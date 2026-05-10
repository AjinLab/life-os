from datetime import date, timedelta
from sqlalchemy.orm import Session
from backend.models.habit import Habit, HabitLog


def calculate_streak(habit_id: str, db: Session) -> int:
    """Calculate current consecutive-day streak for a habit."""
    today = date.today()
    streak = 0
    current_date = today

    while True:
        log = (
            db.query(HabitLog)
            .filter(
                HabitLog.habit_id == habit_id,
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

    return streak


def weekly_completion_rate(habit_id: str, db: Session) -> float:
    """Calculate completion rate for the current week."""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        return 0.0

    completed_count = (
        db.query(HabitLog)
        .filter(
            HabitLog.habit_id == habit_id,
            HabitLog.log_date >= week_start,
            HabitLog.completed == True,
        )
        .count()
    )

    target = habit.target_per_wk or 7
    return min(completed_count / target, 1.0)


def get_best_streak(habit_id: str, db: Session) -> int:
    """Calculate the best-ever streak for a habit by scanning all logs."""
    logs = (
        db.query(HabitLog)
        .filter(HabitLog.habit_id == habit_id, HabitLog.completed == True)
        .order_by(HabitLog.log_date.asc())
        .all()
    )

    if not logs:
        return 0

    best = 1
    current = 1

    for i in range(1, len(logs)):
        if (logs[i].log_date - logs[i - 1].log_date).days == 1:
            current += 1
            best = max(best, current)
        else:
            current = 1

    return best
