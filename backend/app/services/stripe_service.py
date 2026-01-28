import stripe
from typing import Optional, Dict


class StripeService:
    def __init__(self, api_key: str):
        stripe.api_key = api_key
    
    def create_checkout_session(
        self,
        user_id: str,
        plan_id: str,
        billing_cycle: str,
        success_url: str,
        cancel_url: str,
        price_ids: Optional[Dict[str, str]] = None
    ) -> Optional[str]:
        try:
            price_key = f"{plan_id}_{billing_cycle}"
            
            if price_ids and price_ids.get(price_key) and len(price_ids.get(price_key, "")) > 0:
                price_id = price_ids[price_key]
            else:
                price_id = None
            
            if not price_id:
                amount = self._get_plan_amount(plan_id, billing_cycle)
                interval = "month" if billing_cycle == "monthly" else "year"
                
                price = stripe.Price.create(
                    unit_amount=amount,
                    currency="usd",
                    recurring={"interval": interval},
                    product_data={"name": f"{plan_id.capitalize()} Plan ({billing_cycle})"}
                )
                price_id = price.id
            
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{"price": price_id, "quantity": 1}],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
                client_reference_id=user_id,
                allow_promotion_codes=True
            )
            
            return session.url
        except Exception:
            return None
    
    def create_customer_portal_session(self, customer_id: str, return_url: str) -> str:
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url
            )
            return session.url
        except Exception:
            return None
    
    def retrieve_subscription(self, subscription_id: str) -> Dict:
        try:
            return stripe.Subscription.retrieve(subscription_id)
        except Exception:
            return None
    
    def cancel_subscription(self, subscription_id: str) -> Dict:
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return subscription.delete()
        except Exception:
            return None
    
    def construct_webhook_event(self, payload: str, sig_header: str, webhook_secret: str) -> Dict:
        try:
            return stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except Exception:
            return None
    
    def _get_plan_amount(self, plan_id: str, billing_cycle: str) -> int:
        prices = {
            "free": {"monthly": 0, "yearly": 0},
            "starter": {"monthly": 4900, "yearly": 47000},
            "professional": {"monthly": 14900, "yearly": 143000}
        }
        return prices.get(plan_id, {}).get(billing_cycle, 0)
