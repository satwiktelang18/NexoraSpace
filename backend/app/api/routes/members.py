from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from pydantic import BaseModel, EmailStr
import uuid

router = APIRouter(prefix="/workspaces", tags=["members"])


class InviteRequest(BaseModel):
    email: EmailStr


@router.post("/{workspace_id}/invite")
async def invite_member(
    workspace_id: uuid.UUID,
    data: InviteRequest,
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
        raise HTTPException(status_code=404, detail="Workspace not found or not owner")

    user_result = await db.execute(select(User).where(User.email == data.email))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="No user found with that email. They must register first.")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You are already the owner")

    existing = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User is already a member")

    member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=user.id,
        invited_by=current_user.id,
        role="member",
    )
    db.add(member)
    await db.commit()

    return {"message": f"{user.name} added to workspace successfully"}


@router.get("/{workspace_id}/members")
async def get_members(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Workspace).where(Workspace.id == workspace_id)
    )
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    members_result = await db.execute(
        select(WorkspaceMember, User).join(User, WorkspaceMember.user_id == User.id).where(
            WorkspaceMember.workspace_id == workspace_id
        )
    )
    members = members_result.all()

    owner_result = await db.execute(select(User).where(User.id == workspace.owner_id))
    owner = owner_result.scalar_one_or_none()

    return {
        "owner": {"id": str(owner.id), "name": owner.name, "email": owner.email, "role": "owner"},
        "members": [
            {"id": str(m.id), "name": u.name, "email": u.email, "role": m.role}
            for m, u in members
        ]
    }


@router.delete("/{workspace_id}/members/{user_id}")
async def remove_member(
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
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
        raise HTTPException(status_code=403, detail="Not the owner")

    member_result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    await db.delete(member)
    await db.commit()
    return {"message": "Member removed"}