"""
Billing router for HireAI.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

from ..services.auth_service import AuthService
from ..services.billing_service import BillingService
from ..services.stripe_service import StripeService
from ..models.database import User, Subscription, Usage, Invoice
from ..config.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize Stripe service if API key is configured
stripe_service = None
if settings.stripe_api_key:
    stripe_service = StripeService(settings.stripe_api_key)
else:
    logger.warning("Stripe API key not configured. Stripe features will not work.")


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
    """Subscribe to a plan using Stripe."""
    try:
        logger.info(f"Subscribe request: user_id={user_id}, plan={request.plan_id}, cycle={request.billing_cycle}")
        
        if not stripe_service:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Stripe payment service is not configured"
            )
        
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
        
        # Create Stripe checkout session
        frontend_url = settings.cors_origins_list[0] if settings.cors_origins_list else "http://localhost:3000"
        logger.info(f"Frontend URL: {frontend_url}")
        
        # For testing, always create dynamic prices (skip price_ids from env)
        logger.info("Creating checkout session with dynamic price")
        
        checkout_url = stripe_service.create_checkout_session(
            user_id=user_id,
            plan_id=request.plan_id,
            billing_cycle=request.billing_cycle,
            success_url=f"{frontend_url}/billing?success=true&plan={request.plan_id}",
            cancel_url=f"{frontend_url}/billing?cancelled=true",
            price_ids=None  # Always use dynamic prices for testing
        )
        
        logger.info(f"Checkout session created: {checkout_url}")
        
        return {
            "message": "Redirecting to Stripe checkout",
            "plan": selected_plan,
            "checkout_url": checkout_url,
            "next_billing_date": BillingService.calculate_next_billing_date(request.billing_cycle).isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Subscribe error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create subscription: {str(e)}"
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


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events.
    This endpoint receives notifications from Stripe about payment events.
    """
    if not settings.stripe_webhook_secret or not stripe_service:
        logger.error("Stripe webhook not configured")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Webhook not configured"}
        )
    
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        if not sig_header:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Stripe signature"
            )
        
        # Verify webhook signature (payload is bytes, convert to str for Stripe)
        event = stripe_service.construct_webhook_event(
            payload.decode('utf-8'),
            sig_header,
            settings.stripe_webhook_secret
        )
        
        logger.info(f"Received Stripe webhook: {event['type']}")
        
        # Handle different event types
        if event['type'] == 'checkout.session.completed':
            await handle_checkout_completed(event)
        elif event['type'] == 'customer.subscription.created':
            await handle_subscription_created(event)
        elif event['type'] == 'customer.subscription.updated':
            await handle_subscription_updated(event)
        elif event['type'] == 'customer.subscription.deleted':
            await handle_subscription_deleted(event)
        elif event['type'] == 'invoice.payment_succeeded':
            await handle_payment_succeeded(event)
        elif event['type'] == 'invoice.payment_failed':
            await handle_payment_failed(event)
        else:
            logger.info(f"Unhandled event type: {event['type']}")
        
        return JSONResponse(content={"status": "success"})
    
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Webhook handler failed"}
        )


async def handle_checkout_completed(event):
    """Handle checkout.session.completed event."""
    session = event['data']['object']
    user_id = session.get('client_reference_id')
    subscription_id = session.get('subscription')
    
    if user_id and subscription_id:
        logger.info(f"Checkout completed for user {user_id}, subscription {subscription_id}")


async def handle_subscription_created(event):
    """Handle customer.subscription.created event."""
    subscription = event['data']['object']
    logger.info(f"Subscription created: {subscription['id']}")


async def handle_subscription_updated(event):
    """Handle customer.subscription.updated event."""
    subscription = event['data']['object']
    logger.info(f"Subscription updated: {subscription['id']}, status: {subscription['status']}")
    
    # Update subscription status in database
    # user_id = subscription.get('metadata', {}).get('user_id')
    # if user_id:
    #     await update_user_subscription_status(user_id, subscription['status'])


async def handle_subscription_deleted(event):
    """Handle customer.subscription.deleted event."""
    subscription = event['data']['object']
    logger.info(f"Subscription cancelled: {subscription['id']}")
    
    # Update user to free plan
    # user_id = subscription.get('metadata', {}).get('user_id')
    # if user_id:
    #     await update_user_subscription_status(user_id, 'cancelled')


async def handle_payment_succeeded(event):
    """Handle invoice.payment_succeeded event."""
    invoice = event['data']['object']
    logger.info(f"Payment succeeded for subscription {invoice.get('subscription')}")
    
    # Update billing history, send receipt email, etc.


async def handle_payment_failed(event):
    """Handle invoice.payment_failed event."""
    invoice = event['data']['object']
    logger.warning(f"Payment failed for subscription {invoice.get('subscription')}")
    
    # Notify user about failed payment
    # send_payment_failed_email(user_id, invoice)