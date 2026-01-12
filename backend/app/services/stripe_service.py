"""
Stripe payment service for HireAI.
"""
import stripe
import logging
from typing import Optional, Dict, Union

logger = logging.getLogger(__name__)


class StripeService:
    """Service for Stripe payment operations."""
    
    def __init__(self, api_key: str):
        """Initialize Stripe with API key."""
        stripe.api_key = api_key
    
    def create_checkout_session(
        self,
        user_id: str,
        plan_id: str,
        billing_cycle: str,
        success_url: str,
        cancel_url: str,
        price_ids: Optional[Dict[str, str]] = None
    ) -> Union[str, None]:
        """
        Create a Stripe checkout session.
        
        Args:
            user_id: User ID from database
            plan_id: Plan ID (free, starter, professional)
            billing_cycle: 'monthly' or 'yearly'
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect if payment is cancelled
            price_ids: Dictionary mapping plan IDs and cycles to Stripe price IDs
        
        Returns:
            Stripe checkout session URL or None if failed
        """
        try:
            # Map plan and cycle to Stripe price ID
            price_key = f"{plan_id}_{billing_cycle}"
            
            # Only use price_id if it's provided and not empty
            if price_ids and price_ids.get(price_key) and len(price_ids.get(price_key, "")) > 0:
                price_id = price_ids[price_key]
            else:
                price_id = None
            
            if not price_id:
                # If no price IDs provided, create a test price dynamically
                amount = self._get_plan_amount(plan_id, billing_cycle)
                interval = "month" if billing_cycle == "monthly" else "year"
                
                logger.info(f"Creating dynamic price for {plan_id} {billing_cycle}: {amount} cents")
                price = stripe.Price.create(
                    unit_amount=amount,
                    currency="usd",
                    recurring={"interval": interval},
                    product_data={
                        "name": f"{plan_id.capitalize()} Plan ({billing_cycle})"
                    }
                )
                price_id = price.id
                logger.info(f"Created test price: {price_id}")
            
            # Create checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{"price": price_id, "quantity": 1}],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
                client_reference_id=user_id,
                subscription_data={
                    "metadata": {
                        "plan_id": plan_id,
                        "billing_cycle": billing_cycle,
                        "user_id": user_id
                    }
                },
                allow_promotion_codes=True,
                billing_address_collection="auto"
            )
            
            logger.info(f"Created checkout session {session.id} for user {user_id}, plan {plan_id}")
            return session.url
        
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            raise
    
    def create_customer_portal_session(
        self,
        customer_id: str,
        return_url: str
    ) -> str:
        """
        Create a Stripe Customer Portal session.
        
        Args:
            customer_id: Stripe customer ID
            return_url: URL to redirect after portal session
        
        Returns:
            Customer portal URL
        """
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url
            )
            
            logger.info(f"Created portal session {session.id} for customer {customer_id}")
            return session.url
        
        except Exception as e:
            logger.error(f"Error creating portal session: {str(e)}")
            raise
    
    def retrieve_checkout_session(self, session_id: str) -> Dict:
        """
        Retrieve a checkout session.
        
        Args:
            session_id: Stripe checkout session ID
        
        Returns:
            Checkout session data
        """
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return session
        
        except Exception as e:
            logger.error(f"Error retrieving checkout session: {str(e)}")
            raise
    
    def retrieve_subscription(self, subscription_id: str) -> Dict:
        """
        Retrieve a subscription.
        
        Args:
            subscription_id: Stripe subscription ID
        
        Returns:
            Subscription data
        """
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return subscription
        
        except Exception as e:
            logger.error(f"Error retrieving subscription: {str(e)}")
            raise
    
    def cancel_subscription(self, subscription_id: str) -> Dict:
        """
        Cancel a subscription.
        
        Args:
            subscription_id: Stripe subscription ID
        
        Returns:
            Cancelled subscription data
        """
        try:
            # Retrieve subscription first
            subscription = stripe.Subscription.retrieve(subscription_id)
            # Then delete it
            cancelled_subscription = subscription.delete()
            logger.info(f"Cancelled subscription {subscription_id}")
            return cancelled_subscription
        
        except Exception as e:
            logger.error(f"Error cancelling subscription: {str(e)}")
            raise
    
    def construct_webhook_event(
        self,
        payload: str,
        sig_header: str,
        webhook_secret: str
    ) -> Dict:
        """
        Construct and verify a Stripe webhook event.
        
        Args:
            payload: Raw request body as string
            sig_header: Stripe signature header
            webhook_secret: Stripe webhook secret
        
        Returns:
            Stripe event object
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
            return event
        
        except ValueError as e:
            logger.error(f"Invalid webhook payload: {str(e)}")
            raise
        except Exception as e:
            # Handle signature verification errors
            error_msg = str(e)
            if "signature" in error_msg.lower():
                logger.error(f"Invalid webhook signature: {str(e)}")
            raise
    
    def _get_plan_amount(self, plan_id: str, billing_cycle: str) -> int:
        """
        Get plan amount in cents.
        
        Args:
            plan_id: Plan ID
            billing_cycle: 'monthly' or 'yearly'
        
        Returns:
            Amount in cents
        """
        prices = {
            "free": {"monthly": 0, "yearly": 0},
            "starter": {"monthly": 4900, "yearly": 47000},
            "professional": {"monthly": 14900, "yearly": 143000}
        }
        return prices.get(plan_id, {}).get(billing_cycle, 0)
