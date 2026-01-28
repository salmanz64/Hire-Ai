from datetime import datetime
from typing import List, Dict


class BillingService:
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
        return [
            {
                "id": "free",
                "name": "Free",
                "monthly_price": "$0",
                "yearly_price": "$0",
                "description": "Perfect for individuals",
                "features": [
                    "10 resumes per month",
                    "1 active job posting",
                    "Email support",
                    "Basic analytics"
                ]
            },
            {
                "id": "starter",
                "name": "Starter",
                "monthly_price": "$49",
                "yearly_price": "$470",
                "description": "For small teams",
                "features": [
                    "100 resumes per month",
                    "5 active job postings",
                    "3 team members",
                    "Priority support"
                ]
            },
            {
                "id": "professional",
                "name": "Professional",
                "monthly_price": "$149",
                "yearly_price": "$1,430",
                "description": "For growing companies",
                "features": [
                    "Unlimited resumes",
                    "25 active job postings",
                    "10 team members",
                    "24/7 support"
                ]
            }
        ]
    
    @staticmethod
    def check_usage_limit(plan: str, usage_type: str, current_usage: int) -> bool:
        if plan not in BillingService.PLAN_LIMITS:
            return False
        
        limit = BillingService.PLAN_LIMITS[plan].get(usage_type)
        if limit == float('inf'):
            return True
        
        return current_usage < limit

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