
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import hr_router, auth_router, billing_router
from .config.settings import settings
from .models.database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="HireAI",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(billing_router, prefix="/api/v1/billing", tags=["Billing"])
app.include_router(hr_router, prefix="/api/v1", tags=["HR"])


@app.get("/")
async def root():
    return {"message": "HireAI API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

