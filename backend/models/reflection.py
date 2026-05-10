import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Text, Integer, Date, DateTime
from backend.database import Base


class Reflection(Base):
    __tablename__ = "reflections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)
    week_start = Column(Date, nullable=False)
    score = Column(Integer, nullable=False)  # 1-10
    wins = Column(Text, nullable=True)
    struggles = Column(Text, nullable=True)
    focus_next = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Reflection(week={self.week_start}, score={self.score})>"
