from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from backend.models.task import TaskStatus, TaskPriority, TaskSource

class TaskCreate(BaseModel):
    title: str
    goal_id: Optional[int] = None
    status: TaskStatus = TaskStatus.inbox
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    source: TaskSource = TaskSource.manual

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    goal_id: Optional[int] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    goal_id: Optional[int] = None
    title: str
    status: TaskStatus
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    source: TaskSource
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
