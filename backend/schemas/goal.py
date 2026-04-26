from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from backend.models.goal import GoalType, GoalStatus  # <-- Notice backend.

class GoalCreate(BaseModel):
    title: str
    parent_id: Optional[str] = None
    type: GoalType = GoalType.semester
    due_date: Optional[datetime] = None

class GoalResponse(BaseModel):
    id: str
    parent_id: Optional[str]
    title: str
    type: GoalType
    status: GoalStatus
    progress: int
    due_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True