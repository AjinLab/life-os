from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date
from typing import Optional


class ReflectionCreate(BaseModel):
    week_start: date
    score: int = Field(ge=1, le=10)
    wins: Optional[str] = None
    struggles: Optional[str] = None
    focus_next: Optional[str] = None


class ReflectionUpdate(BaseModel):
    score: Optional[int] = Field(None, ge=1, le=10)
    wins: Optional[str] = None
    struggles: Optional[str] = None
    focus_next: Optional[str] = None
    ai_summary: Optional[str] = None


class ReflectionResponse(BaseModel):
    id: str
    week_start: date
    score: int
    wins: Optional[str]
    struggles: Optional[str]
    focus_next: Optional[str]
    ai_summary: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
