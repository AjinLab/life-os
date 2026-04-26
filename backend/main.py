from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base  # <-- Notice backend.
from backend.models.user import User
from backend.models.capture import Capture
from backend.models.goal import Goal
from backend.routers.capture import router as capture_router
from backend.routers.plan import router as plan_router, task_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Life OS", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(capture_router)
app.include_router(plan_router)
app.include_router(task_router)

@app.get("/")
async def root():
    return {"app": "Life OS", "status": "running", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"status": "ok"}