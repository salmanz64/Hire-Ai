"""
Main FastAPI application.
"""
import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
import os

from .routers import hr_router
from .routers import auth_router
from .routers import billing_router
from .config.settings import settings
from .models.database import Base, engine, get_db

# Force unbuffered output for Windows
os.environ["PYTHONUNBUFFERED"] = "1"

# Configure logging to output to console with both stream handlers
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.StreamHandler(sys.stderr)
    ],
    force=True
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    logger.info("Starting HireAI API...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
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

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests."""
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"
    method = request.method
    url = str(request.url)
    
    # Force immediate output
    sys.stdout.flush()
    sys.stderr.flush()
    print(f"\n>>> REQUEST: {method} {url} from {client_ip}", flush=True)
    logger.info(f"Request: {method} {url} from {client_ip}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        sys.stdout.flush()
        print(f"<<< RESPONSE: {method} {url} - Status: {response.status_code} - Time: {process_time:.3f}s", flush=True)
        logger.info(f"Response: {method} {url} - Status: {response.status_code} - Time: {process_time:.3f}s")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        sys.stdout.flush()
        print(f"!!! ERROR: {method} {url} - Error: {str(e)} - Time: {process_time:.3f}s", flush=True)
        logger.error(f"Error: {method} {url} - Error: {str(e)} - Time: {process_time:.3f}s")
        raise

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(billing_router, prefix="/api/v1/billing", tags=["Billing"])
app.include_router(hr_router, prefix="/api/v1", tags=["HR"])

# Export get_db for router imports
__all__ = ["app", "get_db"]


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
    sys.stdout.flush()
    print("\n>>> HEALTH CHECK REQUESTED <<<", flush=True)
    logger.info("Health check requested")
    return {
        "status": "healthy",
        "service": "HireAI",
        "version": "2.0.0",
        "timestamp": "running"
    }
