// Razorpay Integration Service
// Handles all Razorpay payment operations (for Indian users)

import { 
  SubscriptionCheckout, 
  Subscription as AppSubscription, 
  SubscriptionTier, 
  BillingPeriod,
  PRICING_PLANS,
  getPlanByTier
} from './types'

// ============================================
// RAZORPAY TYPES
// ============================================

interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
  attempts: number
  notes: Record<string, string>
  created_at: number
}

interface RazorpaySubscription {
  id: string
  entity: string
  plan_id: string
  customer_id: string
  status: 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired'
  current_start: number
  current_end: number
  ended_at: number | null
  quantity: number
  notes: Record<string, string>
  charge_at: number
  start_at: number
  end_at: number
  auth_attempts: number
  total_count: number
  paid_count: number
  customer_notify: boolean
  created_at: number
  expire_by: number
  short_url: string
  has_scheduled_changes: boolean
  change_scheduled_at: number | null
  source: string
  remaining_count: number
}

interface RazorpayPlan {
  id: string
  entity: string
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly'
  period: number
  item: {
    id: string
    active: boolean
    name: string
    description: string
    amount: number
    unit_amount: number
    currency: string
    type: string
    unit: string | null
    tax_inclusive: boolean
    hsn_code: number | null
    sac_code: number | null
    tax_rate: number | null
    tax_id: string | null
    tax_group_id: string | null
    created_at: number
    updated_at: number
  }
  notes: Record<string, string>
  created_at: number
}

interface RazorpayCustomer {
  id: string
  entity: string
  name: string
  email: string
  contact: string | null
  gstin: string | null
  notes: Record<string, string>
  created_at: number
}

interface RazorpayPayment {
  id: string
  entity: string
  amount: number
  currency: string
  status: 'captured' | 'authorized' | 'failed' | 'refunded' | 'created'
  order_id: string
  invoice_id: string | null
  international: boolean
  method: string
  amount_refunded: number
  refund_status: string | null
  captured: boolean
  description: string
  card_id: string | null
  bank: string | null
  wallet: string | null
  vpa: string | null
  email: string
  contact: string
  customer_id: string | null
  notes: Record<string, string>
  fee: number
  tax: number
  error_code: string | null
  error_description: string | null
  error_source: string | null
  error_step: string | null
  error_reason: string | null
  acquirer_data: {
    upi_transaction_id: string | null
  }
  created_at: number
}

// ============================================
// RAZORPAY API CLIENT
// ============================================

const RAZORPAY_API = 'https://api.razorpay.com/v1'

async function razorpayRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any
): Promise<any> {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured')
  }
  
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  
  const response = await fetch(`${RAZORPAY_API}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error?.description || 'Razorpay API error')
  }
  
  return data
}

// ============================================
// CUSTOMER OPERATIONS
// ============================================

export async function createRazorpayCustomer(
  email: string,
  name?: string,
  contact?: string,
  notes?: Record<string, string>
): Promise<RazorpayCustomer> {
  return await razorpayRequest('/customers', 'POST', {
    name: name || email.split('@')[0],
    email,
    contact,
    notes: {
      platform: 'tradeai-pro',
      ...notes
    }
  })
}

export async function getRazorpayCustomer(customerId: string): Promise<RazorpayCustomer> {
  return await razorpayRequest(`/customers/${customerId}`)
}

export async function updateRazorpayCustomer(
  customerId: string,
  data: { name?: string; email?: string; contact?: string }
): Promise<RazorpayCustomer> {
  return await razorpayRequest(`/customers/${customerId}`, 'PATCH', data)
}

// ============================================
// PLAN OPERATIONS
// ============================================

export async function createRazorpayPlan(
  name: string,
  amount: number,
  interval: 'monthly' | 'yearly',
  description?: string
): Promise<RazorpayPlan> {
  return await razorpayRequest('/plans', 'POST', {
    period: interval === 'yearly' ? 'yearly' : 'monthly',
    interval: 1,
    item: {
      name,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      description: description || name
    }
  })
}

export async function getRazorpayPlan(planId: string): Promise<RazorpayPlan> {
  return await razorplayRequest(`/plans/${planId}`)
}

// ============================================
// SUBSCRIPTION OPERATIONS
// ============================================

export async function createRazorpaySubscription(
  customerId: string,
  planId: string,
  totalCycles: number = 12,
  notes?: Record<string, string>
): Promise<{ subscription: RazorpaySubscription; checkout: SubscriptionCheckout }> {
  const subscription = await razorpayRequest('/subscriptions', 'POST', {
    plan_id: planId,
    customer_notify: 1,
    total_count: totalCycles,
    customer_id: customerId,
    notes: {
      platform: 'tradeai-pro',
      ...notes
    }
  })
  
  return {
    subscription,
    checkout: {
      provider: 'razorpay',
      orderId: subscription.id,
      paymentUrl: subscription.short_url,
      amount: 0, // Will be determined by plan
      currency: 'INR'
    }
  }
}

export async function getRazorpaySubscription(subscriptionId: string): Promise<RazorpaySubscription> {
  return await razorpayRequest(`/subscriptions/${subscriptionId}`)
}

export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean = true
): Promise<RazorpaySubscription> {
  return await razorpayRequest(`/subscriptions/${subscriptionId}/cancel`, 'POST', {
    cancel_at_cycle_end: cancelAtCycleEnd
  })
}

export async function updateRazorpaySubscription(
  subscriptionId: string,
  data: { plan_id?: string; schedule_change_at?: 'now' | 'cycle_end' }
): Promise<RazorpaySubscription> {
  return await razorpayRequest(`/subscriptions/${subscriptionId}`, 'PATCH', data)
}

// ============================================
// ORDER OPERATIONS (One-time payments)
// ============================================

export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  receipt?: string,
  notes?: Record<string, string>
): Promise<RazorpayOrder> {
  return await razorpayRequest('/orders', 'POST', {
    amount: amount * 100, // Convert to paise
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    notes: {
      platform: 'tradeai-pro',
      ...notes
    }
  })
}

export async function getRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
  return await razorpayRequest(`/orders/${orderId}`)
}

export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const crypto = await import('crypto')
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  
  if (!keySecret) {
    throw new Error('Razorpay key secret not configured')
  }
  
  const body = `${orderId}|${paymentId}`
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex')
  
  return signature === expectedSignature
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

export async function getRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  return await razorpayRequest(`/payments/${paymentId}`)
}

export async function captureRazorpayPayment(
  paymentId: string,
  amount: number,
  currency: string = 'INR'
): Promise<RazorpayPayment> {
  return await razorpayRequest(`/payments/${paymentId}/capture`, 'POST', {
    amount: amount * 100,
    currency
  })
}

export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
): Promise<any> {
  return await razorpayRequest(`/payments/${paymentId}/refund`, 'POST', {
    amount: amount ? amount * 100 : undefined,
    notes
  })
}

// ============================================
// WEBHOOK HANDLING
// ============================================

export async function verifyRazorpayWebhook(
  body: string,
  signature: string
): Promise<boolean> {
  const crypto = await import('crypto')
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    throw new Error('Razorpay webhook secret not configured')
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')
  
  return signature === expectedSignature
}

export function parseSubscriptionFromRazorpay(
  razorpaySubscription: RazorpaySubscription
): Partial<AppSubscription> {
  const tier = (razorpaySubscription.notes?.tier as SubscriptionTier) || 'free'
  const billingPeriod = razorpaySubscription.notes?.billing_period === 'yearly' ? 'yearly' : 'monthly'
  const plan = getPlanByTier(tier)
  
  const statusMap: Record<string, AppSubscription['status']> = {
    'active': 'active',
    'created': 'active',
    'authenticated': 'active',
    'pending': 'past_due',
    'halted': 'past_due',
    'cancelled': 'cancelled',
    'completed': 'expired',
    'expired': 'expired'
  }
  
  return {
    tier,
    status: statusMap[razorpaySubscription.status] || 'expired',
    provider: 'razorpay',
    providerSubscriptionId: razorpaySubscription.id,
    providerCustomerId: razorpaySubscription.customer_id,
    currentPeriodStart: new Date(razorpaySubscription.current_start * 1000),
    currentPeriodEnd: new Date(razorpaySubscription.current_end * 1000),
    cancelAtPeriodEnd: false,
    billingPeriod,
    amount: plan ? getPlanPriceRazorpay(plan, billingPeriod) : 0,
    currency: 'INR'
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getPlanPriceRazorpay(plan: ReturnType<typeof getPlanByTier>, billingPeriod: BillingPeriod): number {
  if (!plan) return 0
  // Convert USD to INR (approximate rate, should use real-time rate)
  const usdToInr = 83
  const usdPrice = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
  return Math.round(usdPrice * usdToInr)
}

// ============================================
// SETUP INSTRUCTIONS
// ============================================

export const RAZORPAY_SETUP_INSTRUCTIONS = `
## Razorpay Setup Instructions

1. **Create Razorpay Account**:
   - Sign up at https://dashboard.razorpay.com
   - Complete KYC verification

2. **Generate API Keys**:
   - Go to Settings > API Keys
   - Generate Key ID and Key Secret
   - For production, use live keys

3. **Create Plans**:
   - Go to Products > Plans
   - Create Pro and Enterprise plans
   - Copy Plan IDs (plan_xxx)

4. **Configure Webhooks**:
   - Go to Settings > Webhooks
   - Add endpoint: https://your-domain.com/api/webhooks/razorpay
   - Select events: subscription.*. payment.*

5. **Environment Variables**:
   Add to .env.local:
   \`\`\`
   RAZORPAY_KEY_ID=rzp_live_xxx
   RAZORPAY_KEY_SECRET=xxx
   RAZORPAY_WEBHOOK_SECRET=xxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
   \`\`\`

6. **Frontend Integration**:
   Include Razorpay Checkout script in your page:
   \`\`\`html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   \`\`\`
`

// Razorpay Checkout Options for frontend
export interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id?: string
  subscription_id?: string
  prefill: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme: {
    color: string
  }
  handler: (response: any) => void
}

export function getRazorpayCheckoutOptions(
  orderId: string,
  amount: number,
  customerEmail: string,
  customerName?: string,
  onSuccess: (response: any) => void
): RazorpayCheckoutOptions {
  return {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    amount: amount * 100,
    currency: 'INR',
    name: 'TradeAI Pro',
    description: 'Subscription Payment',
    order_id: orderId,
    prefill: {
      name: customerName,
      email: customerEmail
    },
    notes: {
      platform: 'tradeai-pro'
    },
    theme: {
      color: '#8b5cf6' // Purple theme
    },
    handler: onSuccess
  }
}

// Fix typo in function name
async function razorplayRequest(endpoint: string): Promise<any> {
  return await razorpayRequest(endpoint)
}
