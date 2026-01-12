"""
Billing service for HireAI.
"""
from datetime import datetime, timedelta
from typing import List, Dict
import math


class BillingService:
    """Service for billing and subscription management."""
    
    PLAN_LIMITS = {
        "free": {
            "resumes_per_month": 10,
            "job_postings": 1,
            "team_members": 1,
            "price_monthly": 0,
            "price_yearly": 0
        },
        "starter": {
            "resumes_per_month": 100,
            "job_postings": 5,
            "team_members": 3,
            "price_monthly": 49,
            "price_yearly": 470
        },
        "professional": {
            "resumes_per_month": float("inf"),
            "job_postings": 25,
            "team_members": 10,
            "price_monthly": 149,
            "price_yearly": 1430
        }
    }
    
    @staticmethod
    def get_plans() -> List[Dict]:
        """Return all available plans."""
        return [
            {
                "id": "free",
                "name": "Free",
                "monthly_price": "$0",
                "yearly_price": "$0",
                "savings": "",
                "description": "Perfect for individuals",
                "features": [
                    "10 resumes per month",
                    "1 active job posting",
                    "Email support",
                    "Basic analytics",
                    "Google Calendar integration"
                ],
                "popular": False,
                "cta": "Get Started"
            },
            {
                "id": "starter",
                "name": "Starter",
                "monthly_price": "$49",
                "yearly_price": "$470",
                "savings": "Save 20%",
                "description": "Perfect for small teams",
                "features": [
                    "100 resumes per month",
                    "5 active job postings",
                    "Email support",
                    "Basic analytics",
                    "Google Calendar integration",
                    "Resume storage (30 days)"
                ],
                "popular": False,
                "cta": "Get Started"
            },
            {
                "id": "professional",
                "name": "Professional",
                "monthly_price": "$149",
                "yearly_price": "$1,430",
                "savings": "Save 20%",
                "description": "Best for growing companies",
                "features": [
                    "Unlimited resumes",
                    "25 active job postings",
                    "Priority support",
                    "Advanced analytics",
                    "API access",
                    "Custom workflows",
                    "Unlimited resume storage"
                ],
                "popular": True,
                "cta": "Get Started"
            }
        ]
    
    @staticmethod
    def get_plan_limits(plan_id: str) -> Dict:
        """Get limits for a specific plan."""
        return BillingService.PLAN_LIMITS.get(plan_id, {})
    
    @staticmethod
    def check_usage_limit(plan_id: str, usage_type: str, current_usage: int) -> Dict:
        """Check if user has exceeded their plan limits."""
        limits = BillingService.get_plan_limits(plan_id)
        limit = limits.get(usage_type, 0)
        
        is_unlimited = limit == float("inf")
        
        return {
            "has_exceeded": not is_unlimited and current_usage >= limit,
            "limit": "Unlimited" if is_unlimited else limit,
            "current": current_usage,
            "remaining": limit - current_usage if not is_unlimited else float("inf"),
            "percentage": (current_usage / limit * 100) if not is_unlimited else 0
        }
    
    @staticmethod
    def calculate_next_billing_date(billing_cycle: str) -> datetime:
        """Calculate next billing date based on cycle."""
        if billing_cycle == "monthly":
            return datetime.utcnow() + timedelta(days=30)
        else:  # yearly
            return datetime.utcnow() + timedelta(days=365)
    
    @staticmethod
    def calculate_prorated_amount(
        old_plan: str,
        new_plan: str,
        billing_cycle: str,
        days_used: int
    ) -> Dict[str, float]:
        """Calculate prorated amount for plan changes."""
        old_plan_limits = BillingService.PLAN_LIMITS[old_plan]
        new_plan_limits = BillingService.PLAN_LIMITS[new_plan]
        
        # Get the full cycle price
        full_price = new_plan_limits[f"price_{billing_cycle}"]
        
        # Calculate days in billing cycle
        days_in_cycle = 365 if billing_cycle == "yearly" else 30
        
        # Calculate unused percentage
        unused_percentage = (days_in_cycle - days_used) / days_in_cycle
        
        # Prorated amount for old plan
        old_full_price = old_plan_limits[f"price_{billing_cycle}"]
        prorated_refund = old_full_price * unused_percentage
        
        # Total amount = new price - prorated refund
        total_amount = full_price - prorated_refund
        
        return {
            "prorated_amount": round(max(0, total_amount), 2),
            "refund_amount": round(prorated_refund, 2),
            "new_plan_price": full_price
        }
    
    @staticmethod
    def generate_invoice_number() -> str:
        """Generate a unique invoice number."""
        timestamp = datetime.now().strftime("%Y%m%d")
        random_suffix = str(hash(timestamp))[:6]
        return f"INV-{timestamp}-{random_suffix}"
    
    @staticmethod
    def format_price(cents: int) -> str:
        """Format price in cents to dollars."""
        dollars = cents / 100
        return f"${dollars:.2f}"