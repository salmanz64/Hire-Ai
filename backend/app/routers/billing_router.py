"""
Billing router for HireAI.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

from ..services.auth_service import AuthService
from ..services.billing_service import BillingService
from ..models.database import User, Subscription, Usage, Invoice

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class CurrentPlanResponse(BaseModel):
    """Current plan and usage response."""
    name: str
    price: str
    period: str
    status: str
    next_billing: str
    features: List[dict]


class SubscribeRequest(BaseModel):
    """Subscription request."""
    plan_id: str
    billing_cycle: str  # monthly, yearly


class UpgradeRequest(BaseModel):
    """Upgrade plan request."""
    plan_id: str
    billing_cycle: str


class UsageResponse(BaseModel):
    """Usage statistics response."""
    month: str
    resumes_processed: dict
    job_postings: dict
    team_members: dict


class InvoiceResponse(BaseModel):
    """Invoice response."""
    id: str
    invoice_number: str
    amount: str
    status: str
    billing_date: str
    download_url: Optional[str]


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current authenticated user."""
    try:
        payload = AuthService.decode_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        # In real app, fetch user from database using payload["sub"]
        # For now, return mock user
        user_id = payload.get("sub", "")
        
        return user_id
    
    except Exception as e:
        logger.error(f"Auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


@router.get("/plans")
async def get_plans():
    """Get all available plans."""
    return {"plans": BillingService.get_plans()}


@router.get("/current", response_model=CurrentPlanResponse)
async def get_current_plan(user_id: str = Depends(get_current_user)):
    """Get user's current plan and usage."""
    try:
        # In real app, fetch from database
        # Mock data for now
        return CurrentPlanResponse(
            name="Starter",
            price="$49",
            period="/month",
            status="Active",
            next_billing="January 15, 2024",
            features=[
                {
                    "name": "Resumes Processed",
                    "used": 45,
                    "limit": 100
                },
                {
                    "name": "Active Job Postings",
                    "used": 3,
                    "limit": 5
                },
                {
                    "name": "Team Members",
                    "used": 2,
                    "limit": 3
                }
            ]
        )
    
    except Exception as e:
        logger.error(f"Get current plan error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch current plan"
        )


@router.post("/subscribe")
async def subscribe_plan(
    request: SubscribeRequest,
    user_id: str = Depends(get_current_user)
):
    """Subscribe to a plan."""
    try:
        # Get plan details
        plans = BillingService.get_plans()
        selected_plan = None
        
        for plan in plans:
            if plan["id"] == request.plan_id:
                selected_plan = plan
                break
        
        if not selected_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan not found"
            )
        
        # In real app with Stripe, create checkout session
        # checkout_url = stripe_service.create_checkout_session(user_id, request.plan_id, request.billing_cycle)
        
        logger.info(f"User {user_id} subscribing to {request.plan_id} ({request.billing_cycle})")
        
        # For now, return success (in real app, return checkout URL)
        return {
            "message": "Subscription created successfully",
            "plan": selected_plan,
            "next_billing_date": BillingService.calculate_next_billing_date(request.billing_cycle).isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Subscribe error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subscription"
        )


@router.post("/upgrade")
async def upgrade_plan(
    request: UpgradeRequest,
    user_id: str = Depends(get_current_user)
):
    """Upgrade user's plan."""
    try:
        # Get plan details
        plans = BillingService.get_plans()
        selected_plan = None
        old_plan = "free"  # In real app, fetch from DB
        
        for plan in plans:
            if plan["id"] == request.plan_id:
                selected_plan = plan
                break
        
        if not selected_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan not found"
            )
        
        # Calculate prorated amount
        proration = BillingService.calculate_prorated_amount(
            old_plan,
            request.plan_id,
            request.billing_cycle,
            15  # Days used in current cycle
        )
        
        # In real app with Stripe, create new subscription
        logger.info(f"User {user_id} upgrading to {request.plan_id} from {old_plan}")
        
        return {
            "message": "Plan upgraded successfully",
            "old_plan": old_plan,
            "new_plan": selected_plan,
            "prorated_amount": proration["prorated_amount"],
            "next_billing_date": BillingService.calculate_next_billing_date(request.billing_cycle).isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upgrade error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upgrade plan"
        )


@router.post("/cancel")
async def cancel_subscription(user_id: str = Depends(get_current_user)):
    """Cancel user's subscription."""
    try:
        # In real app, update subscription status in database
        logger.info(f"User {user_id} cancelled subscription")
        
        return {
            "message": "Subscription cancelled successfully",
            "access_until": BillingService.calculate_next_billing_date("monthly").isoformat()
        }
    
    except Exception as e:
        logger.error(f"Cancel subscription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )


@router.get("/invoices", response_model=List[InvoiceResponse])
async def get_invoices(user_id: str = Depends(get_current_user)):
    """Get user's billing history."""
    try:
        # In real app, fetch from database
        # Mock data for now
        from datetime import timedelta
        
        return [
            InvoiceResponse(
                id="inv-1",
                invoice_number="INV-2024-001",
                amount="$49.00",
                status="Paid",
                billing_date=(datetime.utcnow() - timedelta(days=30)).isoformat(),
                download_url="/api/v1/billing/invoices/inv-1/download"
            ),
            InvoiceResponse(
                id="inv-2",
                invoice_number="INV-2024-002",
                amount="$49.00",
                status="Paid",
                billing_date=(datetime.utcnow() - timedelta(days=60)).isoformat(),
                download_url="/api/v1/billing/invoices/inv-2/download"
            ),
            InvoiceResponse(
                id="inv-3",
                invoice_number="INV-2024-003",
                amount="$49.00",
                status="Paid",
                billing_date=(datetime.utcnow() - timedelta(days=90)).isoformat(),
                download_url="/api/v1/billing/invoices/inv-3/download"
            )
        ]
    
    except Exception as e:
        logger.error(f"Get invoices error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch invoices"
        )


@router.get("/invoices/{invoice_id}/download")
async def download_invoice(
    invoice_id: str,
    user_id: str = Depends(get_current_user)
):
    """Download invoice PDF."""
    try:
        # In real app, generate PDF and return file
        logger.info(f"Downloading invoice {invoice_id} for user {user_id}")
        
        # For now, return success message
        return {
            "message": "Invoice downloaded successfully",
            "invoice_id": invoice_id
        }
    
    except Exception as e:
        logger.error(f"Download invoice error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download invoice"
        )


@router.get("/usage", response_model=UsageResponse)
async def get_usage(user_id: str = Depends(get_current_user)):
    """Get user's current usage."""
    try:
        # In real app, fetch from database
        # Mock data for now
        return UsageResponse(
            month="2024-01",
            resumes_processed=BillingService.check_usage_limit("starter", "resumes_per_month", 45),
            job_postings=BillingService.check_usage_limit("starter", "job_postings", 3),
            team_members=BillingService.check_usage_limit("starter", "team_members", 2)
        )
    
    except Exception as e:
        logger.error(f"Get usage error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch usage"
        )