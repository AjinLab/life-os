import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, Integer
from backend.database import Base  # <-- Notice backend.

class GoalType(str, enum.Enum):
    semester = "semester"
    monthly = "monthly"
    weekly = "weekly"

class GoalStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    paused = "paused"

class Goal(Base):
    __tablename__ = "goals"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)
    parent_id = Column(String, ForeignKey("goals.id"), nullable=True)
    title = Column(String, nullable=False)
    type = Column(Enum(GoalType), nullable=False, default=GoalType.semester)
    status = Column(Enum(GoalStatus), nullable=False, default=GoalStatus.active)
    progress = Column(Integer, default=0)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))