import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Enum, DateTime
from backend.database import Base  # <-- Notice backend.

class CaptureType(str, enum.Enum):
    task = "task"
    note = "note"
    idea = "idea"
    expense = "expense"

class CaptureStatus(str, enum.Enum):
    inbox = "inbox"
    processed = "processed"
    archived = "archived"

class Capture(Base):
    __tablename__ = "captures"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    type = Column(Enum(CaptureType), nullable=False, default=CaptureType.task)
    status = Column(Enum(CaptureStatus), nullable=False, default=CaptureStatus.inbox)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))