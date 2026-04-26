import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from backend.database import Base

class TaskStatus(str, enum.Enum):
    inbox = "inbox"
    todo = "todo"
    in_progress = "in_progress"
    done = "done"
    cancelled = "cancelled"

class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class TaskSource(str, enum.Enum):
    manual = "manual"
    capture = "capture"
    ai_suggested = "ai_suggested"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    title = Column(String, nullable=False)
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.inbox)
    priority = Column(Enum(TaskPriority), nullable=True)
    due_date = Column(DateTime, nullable=True)
    source = Column(Enum(TaskSource), nullable=False, default=TaskSource.manual)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
