from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db  # <-- Notice backend.
from backend.models.goal import Goal, GoalStatus
from backend.schemas.goal import GoalCreate, GoalResponse
from backend.models.task import Task, TaskStatus
from backend.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.post("", response_model=GoalResponse, status_code=201)
async def create_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    if goal.parent_id:
        parent = db.query(Goal).filter(Goal.id == goal.parent_id).first()
        if not parent:
            raise HTTPException(404, "Parent goal not found")
    db_goal = Goal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("", response_model=List[GoalResponse])
async def get_goals(status: Optional[GoalStatus] = None, db: Session = Depends(get_db)):
    query = db.query(Goal)
    if status:
        query = query.filter(Goal.status == status)
    return query.order_by(Goal.created_at.desc()).all()

@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(goal_id: str, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(404, "Goal not found")
    return goal

task_router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@task_router.post("", response_model=TaskResponse, status_code=201)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    if task.goal_id:
        goal = db.query(Goal).filter(Goal.id == str(task.goal_id)).first()
        if not goal:
            raise HTTPException(404, "Goal not found")
    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@task_router.get("", response_model=List[TaskResponse])
async def get_tasks(status: Optional[TaskStatus] = None, goal_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Task)
    if status:
        query = query.filter(Task.status == status)
    if goal_id:
        query = query.filter(Task.goal_id == goal_id)
    return query.order_by(Task.created_at.desc()).all()

@task_router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    return task

@task_router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    
    if task_update.goal_id is not None:
        goal = db.query(Goal).filter(Goal.id == str(task_update.goal_id)).first()
        if not goal:
            raise HTTPException(404, "Goal not found")
            
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
        
    db.commit()
    db.refresh(task)
    return task