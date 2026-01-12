"""
Authentication service for HireAI using Neon DB.
"""
import os
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.database import User, Usage

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Service for authentication and authorization."""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password."""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: Dict) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> Optional[Dict]:
        """Decode and verify a JWT token."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None
        except Exception as e:
            print(f"Token decode error: {str(e)}")
            return None
    
    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email address."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        """Get user by ID."""
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            await db.refresh(user)
        return user
    
    @staticmethod
    async def create_user(
        db: AsyncSession,
        email: str,
        password: str,
        full_name: str,
        company_name: Optional[str] = None,
        plan: str = "free"
    ) -> User:
        """Create a new user in the database."""
        user = User(
            email=email,
            password_hash=AuthService.get_password_hash(password),
            full_name=full_name,
            company_name=company_name,
            plan=plan
        )
        db.add(user)
        await db.flush()
        
        # Create initial usage record
        current_month = datetime.utcnow().strftime("%Y-%m")
        usage = Usage(
            user_id=user.id,
            month=current_month,
            resumes_processed=0,
            job_postings=0,
            api_calls=0
        )
        db.add(usage)
        
        await db.commit()
        await db.refresh(user)
        return user
    
    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = await AuthService.get_user_by_email(db, email)
        if not user:
            return None
        
        # Get password hash as string value
        password_hash = str(user.password_hash)
        
        if not AuthService.verify_password(password, password_hash):
            return None
        return user
    
    @staticmethod
    def get_plan_limits(plan: str) -> Dict[str, int]:
        """Get limits for a given plan."""
        limits = {
            "free": {
                "resumes_per_month": 10,
                "active_jobs": 1
            },
            "starter": {
                "resumes_per_month": 100,
                "active_jobs": 5
            },
            "professional": {
                "resumes_per_month": float('inf'),
                "active_jobs": 25
            }
        }
        return limits.get(plan, limits["free"])
