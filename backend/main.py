from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers.capture import router as capture_router
from backend.routers.plan import router as plan_router, task_router
from backend.routers.habits import router as habits_router
from backend.routers.reflection import router as reflection_router
from backend.routers.home import router as home_router
from backend.routers.ai_coach import router as ai_router

# Import all models so they're registered with Base
import backend.models  # noqa: F401

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Life OS", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(capture_router)
app.include_router(plan_router)
app.include_router(task_router)
app.include_router(habits_router)
app.include_router(reflection_router)
app.include_router(home_router)
app.include_router(ai_router)


@app.get("/")
def root():
    return {"message": "Life OS is running"}


@app.get("/health")
def health():
    return {"status": "ok"}