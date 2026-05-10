from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional, List


class HabitCreate(BaseModel):
    name: str
    cue: Optional[str] = None
    target_per_wk: int = 7


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    cue: Optional[str] = None
    target_per_wk: Optional[int] = None
    active: Optional[bool] = None


class HabitResponse(BaseModel):
    id: str
    name: str
    cue: Optional[str]
    target_per_wk: int
    current_streak: int
    active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HabitLogCreate(BaseModel):
    completed: bool = True
    note: Optional[str] = None
    log_date: Optional[date] = None  # defaults to today server-side


class HabitLogResponse(BaseModel):
    id: str
    habit_id: str
    log_date: date
    completed: bool
    note: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HabitWithStatus(BaseModel):
    """Habit with today's completion status for the daily checklist."""
    id: str
    name: str
    cue: Optional[str]
    target_per_wk: int
    current_streak: int
    completed_today: bool

    model_config = ConfigDict(from_attributes=True)


class TodayHabitsResponse(BaseModel):
    habits: List[HabitWithStatus]
    completed_count: int
    total_count: int
