import uuid
from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
from backend.database import Base  # <-- Notice backend.

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    mode = Column(String, default="student")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))