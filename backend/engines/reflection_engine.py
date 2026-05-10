from datetime import date, timedelta
from sqlalchemy.orm import Session
from backend.models.task import Task
from backend.models.habit import Habit, HabitLog
from backend.models.capture import Capture, CaptureStatus
from backend.models.goal import Goal, GoalStatus


def get_week_summary(db: Session, week_start: date = None) -> dict:
    """Aggregate data for a week to populate reflection prompts."""
    if week_start is None:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())

    week_end = week_start + timedelta(days=6)

    # Tasks
    all_tasks = db.query(Task).all()
    done_tasks = [t for t in all_tasks if t.status == "done"]

    # Habits
    habits = db.query(Habit).filter(Habit.active == True).all()
    total_habit_logs = 0
    total_habit_possible = 0

    for habit in habits:
        week_completed = (
            db.query(HabitLog)
            .filter(
                HabitLog.habit_id == habit.id,
                HabitLog.log_date >= week_start,
                HabitLog.log_date <= week_end,
                HabitLog.completed == True,
            )
            .count()
        )
        total_habit_logs += week_completed
        total_habit_possible += habit.target_per_wk

    habit_pct = (
        int(total_habit_logs / total_habit_possible * 100)
        if total_habit_possible > 0
        else 0
    )

    # Captures
    captures_count = (
        db.query(Capture)
        .filter(Capture.created_at >= str(week_start))
        .count()
    )

    # Goals
    active_goals = db.query(Goal).filter(Goal.status == GoalStatus.active).count()

    return {
        "week_start": week_start.isoformat(),
        "tasks_done": len(done_tasks),
        "tasks_total": len(all_tasks),
        "habit_completion_pct": habit_pct,
        "captures_processed": captures_count,
        "active_goals": active_goals,
    }
