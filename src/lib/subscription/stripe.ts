// Stripe Integration Service
// Handles all Stripe payment operations

import Stripe from 'stripe'
import { 
  SubscriptionCheckout, 
  Subscription as AppSubscription, 
  SubscriptionTier, 
  BillingPeriod,
  PRICING_PLANS,
  getPlanByTier
} from './types'

// Initialize Stripe
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16'
  })
}

// ============================================
// CUSTOMER OPERATIONS
// ============================================

export async function createStripeCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  const stripe = getStripe()
  
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      ...metadata,
      platform: 'tradeai-pro'
    }
  })
  
  return customer
}

export async function getStripeCustomer(customerId: string): Promise<Stripe.Customer | null> {
  const stripe = getStripe()
  
  try {
    return await stripe.customers.retrieve(customerId) as Stripe.Customer
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error)
    return null
  }
}

export async function updateStripeCustomer(
  customerId: string,
  data: { email?: string; name?: string; metadata?: Record<string, string> }
): Promise<Stripe.Customer> {
  const stripe = getStripe()
  
  return await stripe.customers.update(customerId, data)
}

// ============================================
// CHECKOUT OPERATIONS
// ============================================

export async function createCheckoutSession(
  customerId: string,
  tier: SubscriptionTier,
  billingPeriod: BillingPeriod,
  successUrl: string,
  cancelUrl: string
): Promise<SubscriptionCheckout> {
  const stripe = getStripe()
  const plan = getPlanByTier(tier)
  
  if (!plan || !plan.stripePriceId) {
    throw new Error(`Invalid plan or missing Stripe price ID for tier: ${tier}`)
  }
  
  const priceId = billingPeriod === 'yearly' 
    ? plan.stripePriceId.yearly 
    : plan.stripePriceId.monthly
  
  const price = getPlanPrice(plan, billingPeriod)
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      tier,
      billing_period: billingPeriod
    },
    subscription_data: {
      metadata: {
        tier,
        billing_period: billingPeriod
      }
    }
  })
  
  return {
    provider: 'stripe',
    sessionId: session.id,
    checkoutUrl: session.url || undefined,
    amount: price,
    currency: plan.currency
  }
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe()
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  })
  
  return session.url
}

// ============================================
// SUBSCRIPTION OPERATIONS
// ============================================

export async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  const stripe = getStripe()
  
  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    console.error('Error retrieving Stripe subscription:', error)
    return null
  }
}

export async function cancelStripeSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  const stripe = getStripe()
  
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId)
  }
  
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  })
}

export async function reactivateStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()
  
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false
  })
}

export async function updateStripeSubscription(
  subscriptionId: string,
  newTier: SubscriptionTier,
  billingPeriod: BillingPeriod
): Promise<Stripe.Subscription> {
  const stripe = getStripe()
  const plan = getPlanByTier(newTier)
  
  if (!plan || !plan.stripePriceId) {
    throw new Error(`Invalid plan or missing Stripe price ID for tier: ${newTier}`)
  }
  
  const newPriceId = billingPeriod === 'yearly'
    ? plan.stripePriceId.yearly
    : plan.stripePriceId.monthly
  
  // Get current subscription to find the item to update
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const itemId = subscription.items.data[0].id
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: itemId,
        price: newPriceId
      }
    ],
    metadata: {
      tier: newTier,
      billing_period: billingPeriod
    },
    proration_behavior: 'always_invoice'
  })
}

// ============================================
// WEBHOOK HANDLING
// ============================================

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }
  
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

export function parseSubscriptionFromStripe(
  stripeSubscription: Stripe.Subscription
): Partial<AppSubscription> {
  const tier = (stripeSubscription.metadata?.tier as SubscriptionTier) || 'free'
  const billingPeriod = (stripeSubscription.metadata?.billing_period as BillingPeriod) || 'monthly'
  const plan = getPlanByTier(tier)
  
  const statusMap: Record<string, AppSubscription['status']> = {
    'active': 'active',
    'canceled': 'cancelled',
    'incomplete': 'past_due',
    'incomplete_expired': 'expired',
    'past_due': 'past_due',
    'trialing': 'trialing',
    'unpaid': 'past_due'
  }
  
  return {
    tier,
    status: statusMap[stripeSubscription.status] || 'expired',
    provider: 'stripe',
    providerSubscriptionId: stripeSubscription.id,
    providerCustomerId: stripeSubscription.customer as string,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    billingPeriod,
    amount: plan ? getPlanPrice(plan, billingPeriod) : 0,
    currency: 'USD'
  }
}

// ============================================
// INVOICE OPERATIONS
// ============================================

export async function getStripeInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
  const stripe = getStripe()
  
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit
  })
  
  return invoices.data
}

export async function getStripeInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
  const stripe = getStripe()
  
  try {
    return await stripe.invoices.retrieve(invoiceId)
  } catch (error) {
    console.error('Error retrieving Stripe invoice:', error)
    return null
  }
}

// ============================================
// PAYMENT METHODS
// ============================================

export async function getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
  const stripe = getStripe()
  
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card'
  })
  
  return paymentMethods.data
}

export async function attachPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  const stripe = getStripe()
  
  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId
  })
  
  // Set as default payment method
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId
    }
  })
  
  return paymentMethod
}

export async function detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
  const stripe = getStripe()
  
  return await stripe.paymentMethods.detach(paymentMethodId)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getPlanPrice(plan: ReturnType<typeof getPlanByTier>, billingPeriod: BillingPeriod): number {
  if (!plan) return 0
  return billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
}

// ============================================
// PRODUCT/PRICE CREATION (for setup)
// ============================================

export async function createStripeProduct(): Promise<Stripe.Product> {
  const stripe = getStripe()
  
  return await stripe.products.create({
    name: 'TradeAI Pro',
    description: 'AI-Powered Trading Platform Subscription',
    metadata: {
      platform: 'tradeai-pro'
    }
  })
}

export async function createStripePrice(
  productId: string,
  amount: number,
  interval: 'month' | 'year',
  tier: string
): Promise<Stripe.Price> {
  const stripe = getStripe()
  
  return await stripe.prices.create({
    product: productId,
    unit_amount: amount * 100, // Convert to cents
    currency: 'usd',
    recurring: {
      interval,
      interval_count: interval === 'year' ? 1 : 1
    },
    metadata: {
      tier
    }
  })
}

// Stripe Setup Instructions
export const STRIPE_SETUP_INSTRUCTIONS = `
## Stripe Setup Instructions

1. **Create Stripe Account**:
   - Sign up at https://dashboard.stripe.com
   - Complete account verification

2. **Get API Keys**:
   - Go to Developers > API Keys
   - Copy your Publishable key and Secret key

3. **Create Products & Prices**:
   - Go to Products > Add Product
   - Create Pro and Enterprise plans with monthly/yearly prices
   - Copy the Price IDs (price_xxx)

4. **Configure Webhooks**:
   - Go to Developers > Webhooks
   - Add endpoint: https://your-domain.com/api/webhooks/stripe
   - Select events: checkout.session.completed, customer.subscription.*. invoice.*

5. **Environment Variables**:
   Add to .env.local:
   \`\`\`
   STRIPE_SECRET_KEY=sk_live_xxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   \`\`\`
`
