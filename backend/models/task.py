from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.database import Base
import enum

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

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)  # Nullable for V1 single-user
    goal_id = Column(String, ForeignKey("goals.id"), nullable=True)
    title = Column(String, nullable=False, index=True)
    status = Column(String, default=TaskStatus.inbox, nullable=False)
    priority = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    source = Column(String, default=TaskSource.manual, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship with Goal
    goal = relationship("Goal", back_populates="tasks")

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"