// Webhook Handlers for Payment Confirmations
// Handles both Stripe and Razorpay webhooks

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { constructWebhookEvent, parseSubscriptionFromStripe } from '@/lib/subscription/stripe'
import { verifyRazorpayWebhook, parseSubscriptionFromRazorpay } from '@/lib/subscription/razorpay'

export const dynamic = 'force-dynamic'

// ============================================
// WEBHOOK EVENT HANDLERS
// ============================================

async function handleStripeWebhook(event: any): Promise<void> {
  // Skip if Supabase not configured
  if (!supabase) {
    console.log('Supabase not configured, skipping webhook handling')
    return
  }

  console.log(`Processing Stripe webhook: ${event.type}`)

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object)
      break

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object)
      break

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object)
      break

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object)
      break

    case 'customer.created':
      await handleCustomerCreated(event.data.object)
      break

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`)
  }
}

async function handleRazorpayWebhook(event: any): Promise<void> {
  // Skip if Supabase not configured
  if (!supabase) {
    console.log('Supabase not configured, skipping webhook handling')
    return
  }

  console.log(`Processing Razorpay webhook: ${event.event}`)

  switch (event.event) {
    case 'subscription.activated':
    case 'subscription.charged':
      await handleRazorpaySubscriptionActivated(event.payload?.subscription?.entity)
      break

    case 'subscription.cancelled':
      await handleRazorpaySubscriptionCancelled(event.payload?.subscription?.entity)
      break

    case 'subscription.halted':
      await handleRazorpaySubscriptionHalted(event.payload?.subscription?.entity)
      break

    case 'payment.authorized':
      await handleRazorpayPaymentAuthorized(event.payload?.payment?.entity)
      break

    case 'payment.failed':
      await handleRazorpayPaymentFailed(event.payload?.payment?.entity)
      break

    default:
      console.log(`Unhandled Razorpay event type: ${event.event}`)
  }
}

// ============================================
// STRIPE HANDLERS
// ============================================

async function handleCheckoutCompleted(session: any): Promise<void> {
  const customerId = session.customer
  const subscriptionId = session.subscription
  const metadata = session.metadata || {}
  const userId = metadata.userId

  if (!subscriptionId) {
    console.log('No subscription ID in checkout session')
    return
  }

  // Get subscription details from Stripe
  const subscriptionData = await fetch(
    `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      }
    }
  ).then(r => r.json())

  const parsedSub = parseSubscriptionFromStripe(subscriptionData)

  // Create or update subscription in database
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      tier: parsedSub.tier,
      status: parsedSub.status,
      provider: 'stripe',
      provider_subscription_id: subscriptionId,
      provider_customer_id: customerId,
      current_period_start: parsedSub.currentPeriodStart,
      current_period_end: parsedSub.currentPeriodEnd,
      billing_period: parsedSub.billingPeriod,
      amount: parsedSub.amount,
      currency: parsedSub.currency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'provider_subscription_id' })

  if (error) {
    console.error('Error saving subscription:', error)
    return
  }

  // Update user's subscription tier
  if (userId) {
    await supabase
      .from('users')
      .update({ 
        subscription_tier: parsedSub.tier,
        stripe_customer_id: customerId
      })
      .eq('id', userId)
  }

  console.log(`Subscription activated: ${subscriptionId}`)
}

async function handleSubscriptionUpdated(subscription: any): Promise<void> {
  const parsedSub = parseSubscriptionFromStripe(subscription)

  const { error } = await supabase
    .from('subscriptions')
    .update({
      tier: parsedSub.tier,
      status: parsedSub.status,
      current_period_start: parsedSub.currentPeriodStart,
      current_period_end: parsedSub.currentPeriodEnd,
      cancel_at_period_end: parsedSub.cancelAtPeriodEnd,
      updated_at: new Date().toISOString()
    })
    .eq('provider_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
    return
  }

  // Update user tier
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('provider_subscription_id', subscription.id)
    .single()

  if (subData?.user_id) {
    await supabase
      .from('users')
      .update({ subscription_tier: parsedSub.status === 'active' ? parsedSub.tier : 'free' })
      .eq('id', subData.user_id)
  }

  console.log(`Subscription updated: ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: any): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('provider_subscription_id', subscription.id)

  // Update user tier to free
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('provider_subscription_id', subscription.id)
    .single()

  if (subData?.user_id) {
    await supabase
      .from('users')
      .update({ subscription_tier: 'free' })
      .eq('id', subData.user_id)
  }

  console.log(`Subscription deleted: ${subscription.id}`)
}

async function handleInvoicePaid(invoice: any): Promise<void> {
  console.log(`Invoice paid: ${invoice.id}`)
  
  // Optionally store invoice record
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('provider_subscription_id', invoice.subscription)
    .single()

  if (subData) {
    await supabase
      .from('invoices')
      .insert({
        user_id: subData.user_id,
        subscription_id: invoice.subscription,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'paid',
        invoice_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
  }
}

async function handleInvoicePaymentFailed(invoice: any): Promise<void> {
  console.log(`Invoice payment failed: ${invoice.id}`)
  
  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('provider_subscription_id', invoice.subscription)
}

async function handleCustomerCreated(customer: any): Promise<void> {
  console.log(`Customer created: ${customer.id}`)
  
  // If we have userId in metadata, link it
  const userId = customer.metadata?.userId
  if (userId) {
    await supabase
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId)
  }
}

// ============================================
// RAZORPAY HANDLERS
// ============================================

async function handleRazorpaySubscriptionActivated(subscription: any): Promise<void> {
  if (!subscription) return

  const parsedSub = parseSubscriptionFromRazorpay(subscription)
  const userId = subscription.notes?.userId

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      tier: parsedSub.tier,
      status: parsedSub.status,
      provider: 'razorpay',
      provider_subscription_id: subscription.id,
      provider_customer_id: subscription.customer_id,
      current_period_start: parsedSub.currentPeriodStart,
      current_period_end: parsedSub.currentPeriodEnd,
      billing_period: parsedSub.billingPeriod,
      amount: parsedSub.amount,
      currency: 'INR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'provider_subscription_id' })

  if (userId) {
    await supabase
      .from('users')
      .update({ subscription_tier: parsedSub.tier })
      .eq('id', userId)
  }

  console.log(`Razorpay subscription activated: ${subscription.id}`)
}

async function handleRazorpaySubscriptionCancelled(subscription: any): Promise<void> {
  if (!subscription) return

  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('provider_subscription_id', subscription.id)

  const { data: subData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('provider_subscription_id', subscription.id)
    .single()

  if (subData?.user_id) {
    await supabase
      .from('users')
      .update({ subscription_tier: 'free' })
      .eq('id', subData.user_id)
  }

  console.log(`Razorpay subscription cancelled: ${subscription.id}`)
}

async function handleRazorpaySubscriptionHalted(subscription: any): Promise<void> {
  if (!subscription) return

  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('provider_subscription_id', subscription.id)

  console.log(`Razorpay subscription halted: ${subscription.id}`)
}

async function handleRazorpayPaymentAuthorized(payment: any): Promise<void> {
  console.log(`Razorpay payment authorized: ${payment.id}`)
}

async function handleRazorpayPaymentFailed(payment: any): Promise<void> {
  console.log(`Razorpay payment failed: ${payment.id}`)
}

// ============================================
// MAIN HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    const body = await request.text()

    if (provider === 'stripe') {
      const signature = request.headers.get('stripe-signature')
      
      if (!signature) {
        return NextResponse.json({
          success: false,
          error: 'Missing Stripe signature'
        }, { status: 400 })
      }

      // Verify webhook signature
      const event = constructWebhookEvent(body, signature)
      
      // Handle the event
      await handleStripeWebhook(event)

      return NextResponse.json({ 
        success: true, 
        received: true 
      })
    }

    if (provider === 'razorpay') {
      const signature = request.headers.get('x-razorpay-signature')
      
      if (!signature) {
        return NextResponse.json({
          success: false,
          error: 'Missing Razorpay signature'
        }, { status: 400 })
      }

      // Verify webhook signature
      const isValid = await verifyRazorpayWebhook(body, signature)
      
      if (!isValid) {
        return NextResponse.json({
          success: false,
          error: 'Invalid signature'
        }, { status: 400 })
      }

      const event = JSON.parse(body)
      
      // Handle the event
      await handleRazorpayWebhook(event)

      return NextResponse.json({ 
        success: true, 
        received: true 
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid provider. Use ?provider=stripe or ?provider=razorpay'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Webhook processing failed'
    }, { status: 500 })
  }
}
