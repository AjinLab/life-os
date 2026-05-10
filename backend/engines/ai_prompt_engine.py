from datetime import date, timedelta
from sqlalchemy.orm import Session
from backend.models.task import Task
from backend.models.goal import Goal, GoalStatus
from backend.models.habit import Habit, HabitLog
from backend.models.capture import Capture, CaptureStatus
from backend.models.reflection import Reflection


def build_weekly_briefing_prompt(db: Session) -> str:
    """Build a comprehensive prompt for the weekly AI briefing."""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    # Gather data from all modules
    active_goals = db.query(Goal).filter(Goal.status == GoalStatus.active).all()
    all_tasks = db.query(Task).all()
    done_tasks = [t for t in all_tasks if t.status == "done"]
    pending_tasks = [t for t in all_tasks if t.status in ("inbox", "todo", "in_progress")]

    habits = db.query(Habit).filter(Habit.active == True).all()
    habit_data = []
    for h in habits:
        week_logs = (
            db.query(HabitLog)
            .filter(
                HabitLog.habit_id == h.id,
                HabitLog.log_date >= week_start,
                HabitLog.completed == True,
            )
            .count()
        )
        habit_data.append(f"- {h.name}: {week_logs}/{h.target_per_wk} this week, streak: {h.current_streak}d")

    inbox_count = db.query(Capture).filter(Capture.status == CaptureStatus.inbox).count()

    last_reflection = db.query(Reflection).order_by(Reflection.week_start.desc()).first()
    last_focus = last_reflection.focus_next if last_reflection else "Not set"

    prompt = f"""Generate a concise weekly briefing for a student/professional based on this data:

GOALS ({len(active_goals)} active):
{chr(10).join(f'- {g.title} ({g.progress}% progress)' for g in active_goals) or '- No active goals'}

TASKS:
- Completed: {len(done_tasks)}
- Pending: {len(pending_tasks)}
- In inbox: {len([t for t in all_tasks if t.status == 'inbox'])}

HABITS:
{chr(10).join(habit_data) or '- No habits tracked'}

INBOX: {inbox_count} unprocessed captures

LAST WEEK'S FOCUS: {last_focus}

Please provide:
1. A brief assessment of the week (2-3 sentences)
2. Top 3 priorities for this week
3. One actionable suggestion to improve consistency
"""
    return prompt


def build_capture_classification_prompt(content: str) -> str:
    """Build a prompt to classify a capture and suggest next action."""
    return f"""Classify this capture and suggest what to do with it.

CAPTURE: "{content}"

Respond in JSON format:
{{
    "type": "task" | "note" | "idea" | "expense",
    "action": "brief suggested next action",
    "reasoning": "one sentence explaining your classification"
}}"""


def build_reflection_summary_prompt(reflection) -> str:
    """Build a prompt to generate an AI summary for a weekly reflection."""
    return f"""Generate a brief, encouraging summary of this weekly review:

WEEK: {reflection.week_start}
SCORE: {reflection.score}/10
WINS: {reflection.wins or 'Not specified'}
STRUGGLES: {reflection.struggles or 'Not specified'}
FOCUS NEXT: {reflection.focus_next or 'Not specified'}

Provide:
1. A 2-sentence overall assessment
2. One pattern or insight you notice
3. One specific, actionable suggestion for next week

Keep it warm, direct, and under 100 words."""
