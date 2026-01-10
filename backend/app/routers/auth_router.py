"""
Authentication router for HireAI.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

from ..services.auth_service import AuthService
from ..models.database import User
from ..config.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    company_name: Optional[str]
    plan: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new user."""
    try:
        # Check if user already exists (in real app, check database)
        # For now, simulate user creation
        
        # Hash password
        password_hash = AuthService.get_password_hash(user_data.password)
        
        # Create user in database (simulated)
        user_id = f"user_{user_data.email}"
        
        logger.info(f"User registered: {user_data.email}")
        
        # Create JWT token
        token_data = {
            "sub": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "plan": "free"
        }
        access_token = AuthService.create_access_token(token_data)
        
        return TokenResponse(
            access_token=access_token,
            user=UserResponse(
                id=user_id,
                email=user_data.email,
                full_name=user_data.full_name,
                company_name=user_data.company_name,
                plan="free",
                created_at=datetime.utcnow()
            )
        )
    
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login an existing user."""
    try:
        # In real app, verify credentials against database
        # For now, simulate login
        
        logger.info(f"User login attempt: {credentials.email}")
        
        # Simulate successful login
        user_id = f"user_{credentials.email}"
        
        # Create JWT token
        token_data = {
            "sub": user_id,
            "email": credentials.email,
            "full_name": "Demo User",
            "plan": "free"
        }
        access_token = AuthService.create_access_token(token_data)
        
        return TokenResponse(
            access_token=access_token,
            user=UserResponse(
                id=user_id,
                email=credentials.email,
                full_name="Demo User",
                company_name="Demo Company",
                plan="free",
                created_at=datetime.utcnow()
            )
        )
    
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to login"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get the current authenticated user."""
    try:
        # Decode token
        payload = AuthService.decode_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        # In real app, fetch user from database
        # For now, return mock data
        return UserResponse(
            id=payload.get("sub", ""),
            email=payload.get("email", ""),
            full_name=payload.get("full_name", ""),
            company_name=payload.get("company_name"),
            plan=payload.get("plan", "free"),
            created_at=datetime.utcnow()
        )
    
    except Exception as e:
        logger.error(f"Get current user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)."""
    return {"message": "Successfully logged out"}