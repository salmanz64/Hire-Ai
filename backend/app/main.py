"""
Main FastAPI application.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .routers import hr_router
from .routers import auth_router
from .routers import billing_router
from .config.settings import settings
from .models.database import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Database setup
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Database dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    logger.info("Starting HireAI API...")
    yield
    logger.info("Shutting down HireAI API...")


app = FastAPI(
    title="HireAI API",
    description="AI-powered HR platform for resume screening, candidate ranking, and interview scheduling",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(billing_router, prefix="/api/v1/billing", tags=["Billing"])
app.include_router(hr_router, prefix="/api/v1", tags=["HR"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "HireAI API",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/v1/auth",
            "billing": "/api/v1/billing",
            "hr": "/api/v1"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "HireAI",
        "version": "2.0.0",
        "timestamp": "running"
    }