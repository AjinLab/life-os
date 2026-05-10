from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from enum import Enum

class TaskStatus(str, Enum):
    inbox = "inbox"
    todo = "todo"
    in_progress = "in_progress"
    done = "done"
    cancelled = "cancelled"

class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class TaskSource(str, Enum):
    manual = "manual"
    capture = "capture"
    ai_suggested = "ai_suggested"

class TaskBase(BaseModel):
    title: str
    status: Optional[TaskStatus] = TaskStatus.inbox
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    source: Optional[TaskSource] = TaskSource.manual
    goal_id: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    source: Optional[TaskSource] = None
    goal_id: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int