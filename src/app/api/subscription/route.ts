// Subscription API Route
// Handles subscription creation, management, and status

import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { 
  PRICING_PLANS, 
  getPlanByTier, 
  formatPrice,
  SubscriptionTier,
  BillingPeriod
} from '@/lib/subscription/types'
import { 
  createStripeCustomer, 
  createCheckoutSession as createStripeCheckout,
  createCustomerPortalSession,
  getStripeSubscription,
  cancelStripeSubscription,
  reactivateStripeSubscription
} from '@/lib/subscription/stripe'

export const dynamic = 'force-dynamic'

// ============================================
// GET - Fetch subscription info
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json({
        success: true,
        plans: PRICING_PLANS.map(plan => ({
          id: plan.id, tier: plan.tier, name: plan.name, description: plan.description,
          monthlyPrice: plan.monthlyPrice, yearlyPrice: plan.yearlyPrice, currency: plan.currency,
          features: plan.features, highlighted: plan.highlighted, limits: plan.limits
        })),
        message: 'Supabase not configured - showing plans only'
      })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    // Get pricing plans
    if (action === 'plans') {
      return NextResponse.json({
        success: true,
        plans: PRICING_PLANS.map(plan => ({
          id: plan.id,
          tier: plan.tier,
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          currency: plan.currency,
          features: plan.features,
          highlighted: plan.highlighted,
          limits: plan.limits
        }))
      })
    }

    // Get user subscription
    if (action === 'subscription') {
      if (!userId) {
        return NextResponse.json({
          success: true,
          subscription: null,
          tier: 'free'
        })
      }

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return NextResponse.json({
        success: true,
        subscription,
        tier: subscription?.plan || 'free'
      })
    }

    // Get billing portal URL
    if (action === 'portal') {
      if (!userId) {
        return NextResponse.json({
          success: false,
          error: 'User ID required'
        }, { status: 400 })
      }

      // Get user's customer ID
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!user?.stripe_customer_id) {
        return NextResponse.json({
          success: false,
          error: 'No billing account found'
        }, { status: 400 })
      }

      const portalUrl = await createCustomerPortalSession(
        user.stripe_customer_id,
        `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/settings/billing`
      )

      return NextResponse.json({
        success: true,
        portalUrl
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription API',
      endpoints: {
        'GET ?action=plans': 'List pricing plans',
        'GET ?action=subscription&userId={id}': 'Get user subscription',
        'GET ?action=portal&userId={id}': 'Get billing portal URL',
        'POST': 'Create checkout session',
        'PATCH': 'Update subscription',
        'DELETE': 'Cancel subscription'
      }
    })

  } catch (error: any) {
    console.error('Subscription API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process request'
    }, { status: 500 })
  }
}

// ============================================
// POST - Create checkout session
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      })
    }

    const body = await request.json()
    const { 
      userId, 
      email, 
      tier, 
      billingPeriod, 
      provider = 'stripe' 
    } = body

    // Validate required fields
    if (!email || !tier) {
      return NextResponse.json({
        success: false,
        error: 'Email and tier are required'
      }, { status: 400 })
    }

    // Validate tier
    const plan = getPlanByTier(tier as SubscriptionTier)
    if (!plan) {
      return NextResponse.json({
        success: false,
        error: 'Invalid plan tier'
      }, { status: 400 })
    }

    // Free tier doesn't need checkout
    if (tier === 'free') {
      // Update user tier directly
      if (userId) {
        await supabase
          .from('users')
          .update({ subscription_tier: 'free' })
          .eq('id', userId)
      }

      return NextResponse.json({
        success: true,
        message: 'Free tier activated',
        tier: 'free'
      })
    }

    const successUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/settings/billing?success=true`
    const cancelUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/pricing?cancelled=true`

    if (provider === 'stripe') {
      // Get or create Stripe customer
      let customerId: string

      if (userId) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (user?.stripe_customer_id) {
          customerId = user.stripe_customer_id
        } else {
          const customer = await createStripeCustomer(email, user?.full_name, { userId })
          customerId = customer.id

          // Save customer ID to user
          await supabase
            .from('users')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId)
        }
      } else {
        const customer = await createStripeCustomer(email)
        customerId = customer.id
      }

      // Create checkout session
      const checkout = await createStripeCheckout(
        customerId,
        tier as SubscriptionTier,
        billingPeriod as BillingPeriod || 'monthly',
        successUrl,
        cancelUrl
      )

      return NextResponse.json({
        success: true,
        checkout
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid payment provider'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Checkout creation error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create checkout session'
    }, { status: 500 })
  }
}

// ============================================
// PATCH - Update subscription
// ============================================

export async function PATCH(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      })
    }

    const body = await request.json()
    const { subscriptionId, action, userId } = body

    if (!subscriptionId && action !== 'reactivate') {
      return NextResponse.json({
        success: false,
        error: 'Subscription ID required'
      }, { status: 400 })
    }

    switch (action) {
      case 'cancel':
        const cancelledSub = await cancelStripeSubscription(subscriptionId)
        
        // Update database
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('provider_subscription_id', subscriptionId)

        return NextResponse.json({
          success: true,
          message: 'Subscription cancelled at period end',
          cancelAtPeriodEnd: cancelledSub.cancel_at_period_end
        })

      case 'reactivate':
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'User ID required'
          }, { status: 400 })
        }

        // Get user's subscription
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!sub) {
          return NextResponse.json({
            success: false,
            error: 'No subscription found'
          }, { status: 404 })
        }

        const reactivatedSub = await reactivateStripeSubscription(sub.provider_subscription_id)
        
        // Update database
        await supabase
          .from('subscriptions')
          .update({ status: 'active', cancel_at_period_end: false })
          .eq('id', sub.id)

        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated'
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Subscription update error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update subscription'
    }, { status: 500 })
  }
}
