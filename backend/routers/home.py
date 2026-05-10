from datetime import date, timedelta, datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from backend.database import get_db
from backend.models.task import Task, TaskStatus
from backend.models.habit import Habit, HabitLog
from backend.models.capture import Capture, CaptureStatus
from backend.models.goal import Goal, GoalStatus
from backend.models.reflection import Reflection

router = APIRouter(prefix="/api/home", tags=["Home"])


class TaskSummary(BaseModel):
    id: int
    title: str
    status: str
    priority: Optional[str]
    goal_id: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class GoalSummary(BaseModel):
    id: str
    title: str
    status: str
    progress: int

    model_config = ConfigDict(from_attributes=True)


class HabitSummary(BaseModel):
    id: str
    name: str
    current_streak: int
    completed_today: bool


class DashboardResponse(BaseModel):
    # Greeting
    greeting: str
    day_label: str

    # Metrics
    tasks_completed_today: int
    tasks_total_today: int
    completion_pct: int
    best_streak: int
    current_streak: int

    # Data
    today_tasks: List[TaskSummary]
    active_goals: List[GoalSummary]
    habits_today: List[HabitSummary]
    inbox_count: int
    weekly_score: Optional[int]

    # AI
    ai_nudge: str


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Aggregated home dashboard — read-only view across all modules."""
    today = date.today()
    now = datetime.now(timezone.utc)

    # ---- Tasks ----
    # Get tasks that are todo/in_progress (today's work)
    active_tasks = (
        db.query(Task)
        .filter(Task.status.in_(["inbox", "todo", "in_progress", "done"]))
        .order_by(Task.created_at.desc())
        .limit(10)
        .all()
    )
    done_today = [t for t in active_tasks if t.status == "done"]
    tasks_total = len(active_tasks)
    tasks_done = len(done_today)
    pct = int((tasks_done / tasks_total * 100)) if tasks_total > 0 else 0

    # ---- Goals ----
    active_goals = (
        db.query(Goal)
        .filter(Goal.status == GoalStatus.active)
        .order_by(Goal.created_at.desc())
        .limit(5)
        .all()
    )

    # ---- Habits ----
    habits = db.query(Habit).filter(Habit.active == True).all()
    habit_summaries = []
    best_streak = 0
    current_streak_max = 0

    for habit in habits:
        today_log = (
            db.query(HabitLog)
            .filter(
                HabitLog.habit_id == habit.id,
                HabitLog.log_date == today,
                HabitLog.completed == True,
            )
            .first()
        )
        habit_summaries.append(
            HabitSummary(
                id=habit.id,
                name=habit.name,
                current_streak=habit.current_streak,
                completed_today=today_log is not None,
            )
        )
        if habit.current_streak > best_streak:
            best_streak = habit.current_streak
        current_streak_max = max(current_streak_max, habit.current_streak)

    # ---- Captures inbox ----
    inbox_count = (
        db.query(Capture)
        .filter(Capture.status == CaptureStatus.inbox)
        .count()
    )

    # ---- Latest reflection score ----
    latest_reflection = (
        db.query(Reflection).order_by(Reflection.week_start.desc()).first()
    )
    weekly_score = latest_reflection.score if latest_reflection else None

    # ---- AI nudge ----
    nudge_parts = []
    if inbox_count > 0:
        nudge_parts.append(f"You have {inbox_count} unprocessed capture{'s' if inbox_count != 1 else ''} in your inbox.")
    pending_tasks = len([t for t in active_tasks if t.status in ("inbox", "todo")])
    if pending_tasks > 0:
        nudge_parts.append(f"{pending_tasks} task{'s' if pending_tasks != 1 else ''} waiting for you today.")
    habits_left = len([h for h in habit_summaries if not h.completed_today])
    if habits_left > 0:
        nudge_parts.append(f"{habits_left} habit{'s' if habits_left != 1 else ''} left to complete.")
    ai_nudge = " ".join(nudge_parts) if nudge_parts else "All caught up! Great work today. 🎯"

    # ---- Day label ----
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    week_num = today.isocalendar()[1]
    day_label = f"{days[today.weekday()]} · Week {week_num}"

    # ---- Greeting ----
    hour = now.hour
    if hour < 12:
        greeting = "Good morning"
    elif hour < 17:
        greeting = "Good afternoon"
    else:
        greeting = "Good evening"

    return DashboardResponse(
        greeting=greeting,
        day_label=day_label,
        tasks_completed_today=tasks_done,
        tasks_total_today=tasks_total,
        completion_pct=pct,
        best_streak=best_streak,
        current_streak=current_streak_max,
        today_tasks=[
            TaskSummary(
                id=t.id,
                title=t.title,
                status=t.status,
                priority=t.priority,
                goal_id=t.goal_id,
            )
            for t in active_tasks
        ],
        active_goals=[
            GoalSummary(
                id=g.id,
                title=g.title,
                status=g.status.value if hasattr(g.status, "value") else g.status,
                progress=g.progress,
            )
            for g in active_goals
        ],
        habits_today=habit_summaries,
        inbox_count=inbox_count,
        weekly_score=weekly_score,
        ai_nudge=ai_nudge,
    )
