import os
from pydantic_settings import BaseSettings
from typing import List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class Settings(BaseSettings):
    groq_api_key: str = ""
    google_calendar_credentials_path: str = os.path.join(BASE_DIR, "config", "google_credentials.json")
    google_calendar_id: str = "primary"
    
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    cors_origins: str = "http://localhost:3000,https://hire-ai-6fgr.onrender.com"
    
    interview_duration_minutes: int = 60
    interview_days_to_schedule: int = 14
    max_candidates_to_schedule: int = 10
    
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    from_email: str = ""
    from_name: str = "HR Team"
    
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    
    database_url: str = ""
    
    stripe_api_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_free_monthly: str = ""
    stripe_price_free_yearly: str = ""
    stripe_price_starter_monthly: str = ""
    stripe_price_starter_yearly: str = ""
    stripe_price_professional_monthly: str = ""
    stripe_price_professional_yearly: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
