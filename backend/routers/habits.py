from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models.habit import Habit, HabitLog
from backend.schemas.habit import (
    HabitCreate,
    HabitUpdate,
    HabitResponse,
    HabitLogCreate,
    HabitLogResponse,
    HabitWithStatus,
    TodayHabitsResponse,
)

router = APIRouter(prefix="/api/habits", tags=["Habits"])


# ============ HABITS CRUD ============

@router.post("/", response_model=HabitResponse, status_code=201)
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    """Create a new habit."""
    db_habit = Habit(
        name=habit.name,
        cue=habit.cue,
        target_per_wk=habit.target_per_wk,
    )
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit


@router.get("/", response_model=List[HabitResponse])
def list_habits(active_only: bool = True, db: Session = Depends(get_db)):
    """List habits. By default only active habits."""
    query = db.query(Habit)
    if active_only:
        query = query.filter(Habit.active == True)
    return query.order_by(Habit.created_at.desc()).all()


@router.get("/today", response_model=TodayHabitsResponse)
def get_today_habits(db: Session = Depends(get_db)):
    """Get today's habit checklist with completion status."""
    today = date.today()
    habits = db.query(Habit).filter(Habit.active == True).all()

    habit_statuses = []
    completed_count = 0

    for habit in habits:
        # Check if there's a completed log for today
        today_log = (
            db.query(HabitLog)
            .filter(
                HabitLog.habit_id == habit.id,
                HabitLog.log_date == today,
                HabitLog.completed == True,
            )
            .first()
        )
        completed_today = today_log is not None
        if completed_today:
            completed_count += 1

        habit_statuses.append(
            HabitWithStatus(
                id=habit.id,
                name=habit.name,
                cue=habit.cue,
                target_per_wk=habit.target_per_wk,
                current_streak=habit.current_streak,
                completed_today=completed_today,
            )
        )

    return TodayHabitsResponse(
        habits=habit_statuses,
        completed_count=completed_count,
        total_count=len(habits),
    )


@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit(habit_id: str, db: Session = Depends(get_db)):
    """Get a specific habit."""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@router.patch("/{habit_id}", response_model=HabitResponse)
def update_habit(habit_id: str, update: HabitUpdate, db: Session = Depends(get_db)):
    """Update a habit."""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    update_data = update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(habit, field, value)

    db.commit()
    db.refresh(habit)
    return habit


@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: str, db: Session = Depends(get_db)):
    """Soft-delete a habit (set active=False)."""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    habit.active = False
    db.commit()
    return None


# ============ HABIT LOGS ============

@router.post("/{habit_id}/log", response_model=HabitLogResponse, status_code=201)
def log_habit(habit_id: str, log: HabitLogCreate, db: Session = Depends(get_db)):
    """Log a habit completion for a specific date (defaults to today)."""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    log_date = log.log_date or date.today()

    # Check for existing log on the same date
    existing = (
        db.query(HabitLog)
        .filter(HabitLog.habit_id == habit_id, HabitLog.log_date == log_date)
        .first()
    )
    if existing:
        # Update existing log
        existing.completed = log.completed
        existing.note = log.note
        db.commit()
        db.refresh(existing)
        # Recalculate streak
        _recalculate_streak(habit, db)
        return existing

    # Create new log
    db_log = HabitLog(
        habit_id=habit_id,
        log_date=log_date,
        completed=log.completed,
        note=log.note,
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)

    # Recalculate streak
    _recalculate_streak(habit, db)

    return db_log


@router.get("/{habit_id}/logs", response_model=List[HabitLogResponse])
def get_habit_logs(
    habit_id: str,
    days: int = 30,
    db: Session = Depends(get_db),
):
    """Get logs for a habit (last N days)."""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    since = date.today() - timedelta(days=days)
    logs = (
        db.query(HabitLog)
        .filter(HabitLog.habit_id == habit_id, HabitLog.log_date >= since)
        .order_by(HabitLog.log_date.desc())
        .all()
    )
    return logs


# ============ HELPERS ============

def _recalculate_streak(habit: Habit, db: Session):
    """Recalculate the current streak for a habit based on consecutive completed days."""
    today = date.today()
    streak = 0
    current_date = today

    while True:
        log = (
            db.query(HabitLog)
            .filter(
                HabitLog.habit_id == habit.id,
                HabitLog.log_date == current_date,
                HabitLog.completed == True,
            )
            .first()
        )
        if log:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break

    habit.current_streak = streak
    db.commit()
