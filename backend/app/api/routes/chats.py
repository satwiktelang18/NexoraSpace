from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.models.chat import Chat, Message
from app.models.document import Document
from app.schemas.chat import ChatCreate, ChatResponse, MessageResponse, MessageCreate
from app.services.rag.pipeline import query_documents
from app.core.database import AsyncSessionLocal
from typing import List
import uuid

router = APIRouter(prefix="/chats", tags=["chats"])


@router.post("", response_model=ChatResponse)
async def create_chat(
    data: ChatCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = Chat(
        workspace_id=data.workspace_id,
        user_id=current_user.id,
        title=data.title or "New Chat",
    )
    db.add(chat)
    await db.commit()
    await db.refresh(chat)
    return chat


@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    chat_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at)
    )
    return result.scalars().all()

@router.get("/workspace/{workspace_id}", response_model=List[ChatResponse])
async def get_workspace_chats(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Chat).where(Chat.workspace_id == workspace_id).order_by(Chat.created_at.desc())
    )
    return result.scalars().all()

@router.post("/{chat_id}/messages/stream")
async def stream_message(
    chat_id: uuid.UUID,
    data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id)
    )

    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    user_message = Message(
        chat_id=chat_id,
        role="user",
        content=data.content,
    )

    db.add(user_message)
    await db.commit()

    doc_result = await db.execute(
        select(Document).where(
            Document.workspace_id == chat.workspace_id,
            Document.status == "ready",
        )
    )

    documents = doc_result.scalars().all()
    document_ids = [str(d.id) for d in documents]

    async def generate():
        full_answer = ""

        stream = await query_documents(
            data.content,
            document_ids,
            stream=True
        )

        async for chunk in stream:
            full_answer += chunk
            yield chunk

        async with AsyncSessionLocal() as save_db:
            assistant_message = Message(
                chat_id=chat_id,
                role="assistant",
                content=full_answer,
            )

            save_db.add(assistant_message)
            await save_db.commit()

    return StreamingResponse(
        generate(),
        media_type="text/plain"
    )