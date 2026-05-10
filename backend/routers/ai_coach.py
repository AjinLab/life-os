from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db
from backend.models.reflection import Reflection
from backend.models.capture import Capture
from backend.services.ai_service import call_groq
from backend.engines.ai_prompt_engine import (
    build_weekly_briefing_prompt,
    build_capture_classification_prompt,
    build_reflection_summary_prompt,
)

router = APIRouter(prefix="/api/ai", tags=["AI Coach"])


class WeeklyBriefingRequest(BaseModel):
    """Optional context overrides for the briefing."""
    pass


class WeeklyBriefingResponse(BaseModel):
    briefing: str


class CaptureProcessRequest(BaseModel):
    capture_id: str


class CaptureProcessResponse(BaseModel):
    suggested_type: str
    suggested_action: str
    reasoning: str


class ReflectionSummaryRequest(BaseModel):
    reflection_id: str


class ReflectionSummaryResponse(BaseModel):
    summary: str


@router.post("/weekly-briefing", response_model=WeeklyBriefingResponse)
async def generate_weekly_briefing(
    request: WeeklyBriefingRequest,
    db: Session = Depends(get_db),
):
    """Generate an AI weekly briefing based on all module data."""
    prompt = build_weekly_briefing_prompt(db)
    result = await call_groq(prompt)
    return WeeklyBriefingResponse(briefing=result)


@router.post("/process-capture", response_model=CaptureProcessResponse)
async def process_capture(
    request: CaptureProcessRequest,
    db: Session = Depends(get_db),
):
    """AI classifies a capture and suggests what to do with it."""
    capture = db.query(Capture).filter(Capture.id == request.capture_id).first()
    if not capture:
        raise HTTPException(status_code=404, detail="Capture not found")

    prompt = build_capture_classification_prompt(capture.content)
    result = await call_groq(prompt)

    # Parse the AI response (expecting JSON-ish structured output)
    return CaptureProcessResponse(
        suggested_type=_extract_field(result, "type", "task"),
        suggested_action=_extract_field(result, "action", "Add to tasks"),
        reasoning=_extract_field(result, "reasoning", result),
    )


@router.post("/reflection-summary", response_model=ReflectionSummaryResponse)
async def generate_reflection_summary(
    request: ReflectionSummaryRequest,
    db: Session = Depends(get_db),
):
    """Generate an AI summary for a weekly reflection."""
    reflection = (
        db.query(Reflection).filter(Reflection.id == request.reflection_id).first()
    )
    if not reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")

    prompt = build_reflection_summary_prompt(reflection)
    result = await call_groq(prompt)

    # Save the summary to the reflection
    reflection.ai_summary = result
    db.commit()

    return ReflectionSummaryResponse(summary=result)


def _extract_field(text: str, field: str, default: str) -> str:
    """Simple field extraction from AI response text."""
    import json
    try:
        data = json.loads(text)
        return data.get(field, default)
    except (json.JSONDecodeError, AttributeError):
        # If not JSON, try line-by-line parsing
        for line in text.split("\n"):
            if field.lower() in line.lower():
                parts = line.split(":", 1)
                if len(parts) > 1:
                    return parts[1].strip()
        return default
