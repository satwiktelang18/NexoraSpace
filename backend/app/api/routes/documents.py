from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.models.workspace import Workspace
from app.models.document import Document
from app.schemas.document import DocumentResponse
from typing import List
import uuid
import os
import shutil
import threading
import asyncio
import traceback

router = APIRouter(prefix="/workspaces", tags=["documents"])

UPLOAD_DIR = "/tmp/nexora_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/{workspace_id}/documents", response_model=DocumentResponse)
async def upload_document(
    workspace_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Workspace).where(
            Workspace.id == workspace_id,
            Workspace.owner_id == current_user.id,
        )
    )
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_path = f"{UPLOAD_DIR}/{uuid.uuid4()}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document = Document(
        workspace_id=workspace_id,
        file_name=file.filename,
        storage_url=file_path,
        status="pending",
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)

    doc_id = str(document.id)
    print(f"Starting background thread for document {doc_id}")

    def run_in_thread():
        print(f"Thread started for {doc_id}")
    try:
        from app.services.rag.pipeline import ingest_document
        ingest_document(doc_id, file_path)
        print(f"Thread completed for {doc_id}")
    except Exception as e:
        print(f"Thread ERROR for {doc_id}: {e}")
        traceback.print_exc()

    t = threading.Thread(target=run_in_thread, daemon=True)
    t.start()
    print(f"Thread launched: {t.name}")

    return document


@router.get("/{workspace_id}/documents", response_model=List[DocumentResponse])
async def get_documents(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Document).where(Document.workspace_id == workspace_id)
    )
    return result.scalars().all()


@router.delete("/{workspace_id}/documents/{document_id}")
async def delete_document(
    workspace_id: uuid.UUID,
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.workspace_id == workspace_id,
        )
    )
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(document)
    await db.commit()
    return {"message": "Document deleted"}