from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models.task import Task, TaskStatus, TaskPriority, TaskSource
from backend.models.goal import Goal, GoalStatus
from backend.schemas.goal import GoalCreate, GoalResponse
from backend.schemas.task import (
    TaskCreate, 
    TaskUpdate, 
    TaskResponse, 
    TaskListResponse,
    TaskStatus as TaskStatusSchema,
    TaskPriority as TaskPrioritySchema,
    TaskSource as TaskSourceSchema
)

# Create TWO separate routers
router = APIRouter(tags=["Goals"])  # For Goals
task_router = APIRouter(tags=["Tasks"])  # For Tasks

# ============ GOALS ENDPOINTS ============

@router.post("/api/goals/", response_model=GoalResponse, status_code=201)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    if goal.parent_id:
        parent = db.query(Goal).filter(Goal.id == goal.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent goal not found")
    db_goal = Goal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/api/goals/", response_model=List[GoalResponse])
def get_goals(status: Optional[GoalStatus] = None, db: Session = Depends(get_db)):
    query = db.query(Goal)
    if status:
        query = query.filter(Goal.status == status)
    return query.order_by(Goal.created_at.desc()).all()

@router.get("/api/goals/{goal_id}", response_model=GoalResponse)
def get_goal(goal_id: str, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

# ============ TASKS ENDPOINTS ============

@task_router.post("/api/tasks/", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task. If goal_id is provided, verify the goal exists."""
    if task.goal_id:
        goal = db.query(Goal).filter(Goal.id == task.goal_id).first()
        if not goal:
            raise HTTPException(status_code=404, detail=f"Goal with id {task.goal_id} not found")
    
    db_task = Task(
        title=task.title,
        status=task.status.value if task.status else TaskStatus.inbox,
        priority=task.priority.value if task.priority else None,
        due_date=task.due_date,
        source=task.source.value if task.source else TaskSource.manual,
        goal_id=task.goal_id
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task

@task_router.get("/api/tasks/", response_model=TaskListResponse)
def list_tasks(
    status: Optional[TaskStatusSchema] = Query(None, description="Filter by task status"),
    goal_id: Optional[str] = Query(None, description="Filter by goal ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """List tasks with optional filters."""
    query = db.query(Task)
    
    if status:
        query = query.filter(Task.status == status.value)
    if goal_id is not None:
        query = query.filter(Task.goal_id == goal_id)
    
    total = query.count()
    tasks = query.offset(skip).limit(limit).all()
    
    return TaskListResponse(tasks=tasks, total=total)

@task_router.get("/api/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task by ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")
    return task

@task_router.patch("/api/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """Update a task. Only provided fields will be updated."""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")
    
    if task_update.goal_id is not None:
        goal = db.query(Goal).filter(Goal.id == task_update.goal_id).first()
        if not goal:
            raise HTTPException(status_code=404, detail=f"Goal with id {task_update.goal_id} not found")
    
    update_data = task_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if field in ['status', 'priority', 'source']:
            setattr(db_task, field, value.value if value else None)
        else:
            setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    
    return db_task

@task_router.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task."""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")
    
    db.delete(db_task)
    db.commit()
    
    return None