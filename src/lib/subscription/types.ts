// Subscription Types and Interfaces
// Supports both Stripe and Razorpay payment gateways

// ============================================
// PLAN TYPES
// ============================================

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'
export type BillingPeriod = 'monthly' | 'yearly'
export type PaymentProvider = 'stripe' | 'razorpay'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing'

// ============================================
// PLAN DEFINITIONS
// ============================================

export interface PlanFeature {
  name: string
  included: boolean
  limit?: number | 'unlimited'
  description?: string
}

export interface PricingPlan {
  id: string
  tier: SubscriptionTier
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  features: PlanFeature[]
  highlighted?: boolean
  stripePriceId?: {
    monthly: string
    yearly: string
  }
  razorpayPlanId?: {
    monthly: string
    yearly: string
  }
  limits: {
    alerts: number | 'unlimited'
    backtests: number | 'unlimited'
    strategies: number | 'unlimited'
    portfolioSize: number | 'unlimited'
    apiCalls: number | 'unlimited'
    dataExport: boolean
    customIndicators: boolean
    aiInsights: number | 'unlimited'
  }
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export interface Subscription {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  provider: PaymentProvider
  providerSubscriptionId: string
  providerCustomerId: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  billingPeriod: BillingPeriod
  amount: number
  currency: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface SubscriptionCheckout {
  provider: PaymentProvider
  checkoutUrl?: string
  sessionId?: string
  orderId?: string
  paymentUrl?: string
  amount: number
  currency: string
}

export interface SubscriptionUpdate {
  newTier: SubscriptionTier
  newBillingPeriod?: BillingPeriod
  prorationAmount?: number
  immediateCharge?: boolean
}

// ============================================
// CUSTOMER TYPES
// ============================================

export interface Customer {
  id: string
  userId: string
  email: string
  name?: string
  stripeCustomerId?: string
  razorpayCustomerId?: string
  defaultPaymentMethod?: string
  createdAt: Date
}

export interface PaymentMethod {
  id: string
  provider: PaymentProvider
  type: 'card' | 'bank_account' | 'upi' | 'wallet'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

// ============================================
// INVOICE TYPES
// ============================================

export interface Invoice {
  id: string
  subscriptionId: string
  userId: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  invoiceUrl?: string
  invoicePdf?: string
  dueDate?: Date
  paidAt?: Date
  createdAt: Date
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface WebhookEvent {
  id: string
  provider: PaymentProvider
  eventType: string
  data: any
  processed: boolean
  createdAt: Date
}

// ============================================
// PRICING PLANS CONFIGURATION
// ============================================

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free',
    description: 'Perfect for getting started with trading insights',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'USD',
    features: [
      { name: 'Basic Market Data', included: true },
      { name: '3 Active Alerts', included: true, limit: 3 },
      { name: '5 Backtests/month', included: true, limit: 5 },
      { name: 'Community Support', included: true },
      { name: 'AI Insights', included: true, limit: 3 },
      { name: 'Real-time Alerts', included: false },
      { name: 'Custom Strategies', included: false },
      { name: 'API Access', included: false },
      { name: 'Priority Support', included: false },
    ],
    limits: {
      alerts: 3,
      backtests: 5,
      strategies: 1,
      portfolioSize: 1,
      apiCalls: 100,
      dataExport: false,
      customIndicators: false,
      aiInsights: 3
    }
  },
  {
    id: 'pro',
    tier: 'pro',
    name: 'Pro',
    description: 'For serious traders who need advanced features',
    monthlyPrice: 29,
    yearlyPrice: 290,
    currency: 'USD',
    highlighted: true,
    features: [
      { name: 'Real-time Market Data', included: true },
      { name: 'Unlimited Alerts', included: true, limit: 'unlimited' },
      { name: 'Unlimited Backtests', included: true, limit: 'unlimited' },
      { name: 'Email & Telegram Alerts', included: true },
      { name: 'AI Insights', included: true, limit: 'unlimited' },
      { name: 'Custom Strategies', included: true },
      { name: 'Strategy Backtesting', included: true },
      { name: 'Priority Email Support', included: true },
      { name: 'API Access', included: false },
    ],
    limits: {
      alerts: 'unlimited',
      backtests: 'unlimited',
      strategies: 10,
      portfolioSize: 5,
      apiCalls: 1000,
      dataExport: true,
      customIndicators: true,
      aiInsights: 'unlimited'
    },
    stripePriceId: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly'
    },
    razorpayPlanId: {
      monthly: 'plan_pro_monthly',
      yearly: 'plan_pro_yearly'
    }
  },
  {
    id: 'enterprise',
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'For professional traders and teams',
    monthlyPrice: 99,
    yearlyPrice: 990,
    currency: 'USD',
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Full API Access', included: true },
      { name: 'Unlimited Strategies', included: true, limit: 'unlimited' },
      { name: 'Team Collaboration', included: true },
      { name: 'Custom Integrations', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: '24/7 Priority Support', included: true },
      { name: 'White-label Options', included: true },
      { name: 'Custom AI Models', included: true },
    ],
    limits: {
      alerts: 'unlimited',
      backtests: 'unlimited',
      strategies: 'unlimited',
      portfolioSize: 'unlimited',
      apiCalls: 'unlimited',
      dataExport: true,
      customIndicators: true,
      aiInsights: 'unlimited'
    },
    stripePriceId: {
      monthly: 'price_enterprise_monthly',
      yearly: 'price_enterprise_yearly'
    },
    razorpayPlanId: {
      monthly: 'plan_enterprise_monthly',
      yearly: 'plan_enterprise_yearly'
    }
  }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPlanByTier(tier: SubscriptionTier): PricingPlan | undefined {
  return PRICING_PLANS.find(p => p.tier === tier)
}

export function getPlanPrice(plan: PricingPlan, billingPeriod: BillingPeriod): number {
  return billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
}

export function calculateYearlySavings(plan: PricingPlan): number {
  if (plan.monthlyPrice === 0) return 0
  return (plan.monthlyPrice * 12) - plan.yearlyPrice
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function isFeatureAvailable(
  plan: PricingPlan,
  feature: keyof PricingPlan['limits']
): boolean {
  const limit = plan.limits[feature]
  if (typeof limit === 'boolean') return limit
  if (limit === 'unlimited') return true
  return limit > 0
}

export function checkLimit(
  plan: PricingPlan,
  feature: keyof PricingPlan['limits'],
  currentUsage: number
): { allowed: boolean; remaining: number } {
  const limit = plan.limits[feature]
  
  if (limit === 'unlimited') {
    return { allowed: true, remaining: Infinity }
  }
  
  if (typeof limit === 'boolean') {
    return { allowed: limit, remaining: limit ? Infinity : 0 }
  }
  
  const numLimit = limit as number
  return {
    allowed: currentUsage < numLimit,
    remaining: Math.max(0, numLimit - currentUsage)
  }
}
