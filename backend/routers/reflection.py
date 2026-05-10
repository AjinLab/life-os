from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models.reflection import Reflection
from backend.schemas.reflection import (
    ReflectionCreate,
    ReflectionUpdate,
    ReflectionResponse,
)

router = APIRouter(prefix="/api/reflections", tags=["Reflections"])


@router.post("/", response_model=ReflectionResponse, status_code=201)
def create_reflection(reflection: ReflectionCreate, db: Session = Depends(get_db)):
    """Create a new weekly reflection."""
    # Check for duplicate week
    existing = (
        db.query(Reflection)
        .filter(Reflection.week_start == reflection.week_start)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Reflection for week {reflection.week_start} already exists",
        )

    db_reflection = Reflection(
        week_start=reflection.week_start,
        score=reflection.score,
        wins=reflection.wins,
        struggles=reflection.struggles,
        focus_next=reflection.focus_next,
    )
    db.add(db_reflection)
    db.commit()
    db.refresh(db_reflection)
    return db_reflection


@router.get("/", response_model=List[ReflectionResponse])
def list_reflections(limit: int = 12, db: Session = Depends(get_db)):
    """List recent reflections."""
    return (
        db.query(Reflection)
        .order_by(Reflection.week_start.desc())
        .limit(limit)
        .all()
    )


@router.get("/latest", response_model=Optional[ReflectionResponse])
def get_latest_reflection(db: Session = Depends(get_db)):
    """Get the most recent reflection."""
    reflection = (
        db.query(Reflection).order_by(Reflection.week_start.desc()).first()
    )
    if not reflection:
        raise HTTPException(status_code=404, detail="No reflections found")
    return reflection


@router.get("/{reflection_id}", response_model=ReflectionResponse)
def get_reflection(reflection_id: str, db: Session = Depends(get_db)):
    """Get a specific reflection."""
    reflection = db.query(Reflection).filter(Reflection.id == reflection_id).first()
    if not reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")
    return reflection


@router.patch("/{reflection_id}", response_model=ReflectionResponse)
def update_reflection(
    reflection_id: str,
    update: ReflectionUpdate,
    db: Session = Depends(get_db),
):
    """Update a reflection (e.g. add AI summary)."""
    reflection = db.query(Reflection).filter(Reflection.id == reflection_id).first()
    if not reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")

    update_data = update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reflection, field, value)

    db.commit()
    db.refresh(reflection)
    return reflection
