# Stripe Payment Setup Guide

This guide will help you set up real Stripe payments for the HireAI application.

## Prerequisites

1. A [Stripe account](https://stripe.com/) (free to sign up)
2. Backend server running
3. Stripe CLI (for webhook testing)

## Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Secret key** (starts with `sk_test_...`)
4. Copy your **Publishable key** (starts with `pk_test_...`)

## Step 2: Create Products and Prices in Stripe

1. Go to **Products** in your Stripe Dashboard
2. Click **Add product**
3. For each plan, create a product:

### Free Plan
- Name: "Free Plan"
- Description: "Free tier for individuals"
- Price: $0 (optional, for completeness)

### Starter Plan
Create two prices:
- Monthly: $49/month
- Yearly: $470/year

### Professional Plan
Create two prices:
- Monthly: $149/month  
- Yearly: $1,430/year

4. After creating each price, copy the **Price ID** (starts with `price_...`)

## Step 3: Configure Environment Variables

Add the following to your `.env` file:

```env
# Stripe Configuration
STRIPE_API_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (from Step 2)
STRIPE_PRICE_FREE_MONTHLY=price_xxxxx
STRIPE_PRICE_FREE_YEARLY=price_xxxxx
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxx
STRIPE_PRICE_STARTER_YEARLY=price_xxxxx
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxxxx
STRIPE_PRICE_PROFESSIONAL_YEARLY=price_xxxxx
```

## Step 4: Set Up Webhooks

### For Development (Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Start webhook forwarding:
   ```bash
   stripe listen --forward-to http://localhost:8000/api/v1/billing/webhook
   ```

4. Copy the webhook secret (starts with `whsec_...`) and add it to your `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_cli
   ```

### For Production

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/v1/billing/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the webhook signing secret and add to `.env`

## Step 5: Test Your Integration

### Test Cards

Use these test cards to test the payment flow:

| Card Number | Result |
|-------------|---------|
| 4242 4242 4242 4242 | Success |
| 4000 0025 0000 3155 | Insufficient funds |
| 4000 0000 0000 9995 | Generic decline |
| 4000 0000 0000 0069 | Expired card |

Expiration: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits

### Test the Flow

1. Start your backend server
2. Start the Stripe webhook listener (for development)
3. Navigate to the billing page in your app
4. Select a plan and click "Upgrade"
5. You should be redirected to a real Stripe checkout page
6. Enter test card details: `4242 4242 4242 4242`
7. Complete the payment
8. You should be redirected back to your app with a success message

## Step 6: Update Frontend Configuration

Add your Stripe publishable key to the frontend (optional, for client-side Stripe.js):

```javascript
// frontend/src/services/api.js or create stripe.js
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key';
```

## Troubleshooting

### Webhook signature verification fails
- Ensure webhook secret matches exactly
- Check that payload is being sent correctly
- Verify stripe is listening on the correct port

### Checkout session creation fails
- Check that STRIPE_API_KEY is valid
- Verify price IDs are correct
- Ensure CORS origins include your frontend URL

### Payment succeeds but plan doesn't update
- Check webhook handler logs
- Verify database update logic
- Make sure webhook endpoint is accessible

### Test mode vs Live mode
- Test mode keys: `sk_test_...`
- Live mode keys: `sk_live_...`
- Switch to live mode when ready for production

## Going to Production

1. Switch to live mode in Stripe Dashboard
2. Update API keys to live keys
3. Set up production webhooks
4. Update frontend CORS origins
5. Test with real payments (small amounts)
6. Monitor dashboard for any issues

## Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Test Mode](https://stripe.com/docs/testing)

## Database Updates

Currently the webhook handlers are commented out. To fully integrate Stripe:

1. Uncomment the database update code in webhook handlers
2. Implement the `update_user_subscription()` function
3. Store stripe_customer_id, stripe_subscription_id in your users table
4. Handle subscription status changes (active, past_due, cancelled, etc.)

Example schema update:

```sql
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN stripe_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50);
ALTER TABLE users ADD COLUMN plan_id VARCHAR(50);
ALTER TABLE users ADD COLUMN billing_cycle VARCHAR(50);
```
