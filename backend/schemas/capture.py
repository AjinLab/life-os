from pydantic import BaseModel
from datetime import datetime
from backend.models.capture import CaptureType, CaptureStatus  # <-- Notice backend.

class CaptureCreate(BaseModel):
    content: str
    type: CaptureType = CaptureType.task

class CaptureResponse(BaseModel):
    id: str
    content: str
    type: CaptureType
    status: CaptureStatus
    created_at: datetime

    class Config:
        from_attributes = True