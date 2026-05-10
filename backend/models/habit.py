import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Text, Integer, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base


class Habit(Base):
    __tablename__ = "habits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    cue = Column(Text, nullable=True)
    target_per_wk = Column(Integer, nullable=False, default=7)
    current_streak = Column(Integer, nullable=False, default=0)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship with HabitLog
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Habit(id={self.id}, name='{self.name}', streak={self.current_streak})>"


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    habit_id = Column(String, ForeignKey("habits.id"), nullable=False)
    log_date = Column(Date, nullable=False, default=lambda: date.today())
    completed = Column(Boolean, nullable=False, default=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship with Habit
    habit = relationship("Habit", back_populates="logs")

    def __repr__(self):
        return f"<HabitLog(habit_id={self.habit_id}, date={self.log_date}, done={self.completed})>"
