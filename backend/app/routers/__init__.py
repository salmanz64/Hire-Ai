"""Routers package."""
from .hr_router import router as hr_router
from .auth_router import router as auth_router
from .billing_router import router as billing_router

__all__ = ["hr_router", "auth_router", "billing_router"]