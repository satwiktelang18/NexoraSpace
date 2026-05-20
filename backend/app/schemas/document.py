from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class DocumentResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    file_name: str
    storage_url: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True