from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class WorkspaceCreate(BaseModel):
    name: str


class WorkspaceResponse(BaseModel):
    id: UUID
    name: str
    owner_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True