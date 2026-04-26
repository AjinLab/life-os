from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db  # <-- Notice backend.
from backend.models.capture import Capture, CaptureStatus
from backend.schemas.capture import CaptureCreate, CaptureResponse

router = APIRouter(prefix="/api/captures", tags=["captures"])

@router.post("", response_model=CaptureResponse, status_code=201)
async def create_capture(capture: CaptureCreate, db: Session = Depends(get_db)):
    db_capture = Capture(**capture.dict())
    db.add(db_capture)
    db.commit()
    db.refresh(db_capture)
    return db_capture

@router.get("", response_model=List[CaptureResponse])
async def get_captures(status: CaptureStatus = None, db: Session = Depends(get_db)):
    query = db.query(Capture)
    if status:
        query = query.filter(Capture.status == status)
    return query.order_by(Capture.created_at.desc()).all()

@router.patch("/{capture_id}", response_model=CaptureResponse)
async def process_capture(capture_id: str, new_status: CaptureStatus, db: Session = Depends(get_db)):
    capture = db.query(Capture).filter(Capture.id == capture_id).first()
    if not capture:
        raise HTTPException(404, "Capture not found")
    capture.status = new_status
    db.commit()
    db.refresh(capture)
    return capture