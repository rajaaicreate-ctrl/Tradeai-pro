'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Crown, 
  ArrowRight, 
  CreditCard,
  CheckCircle,
  Loader2,
  Shield
} from 'lucide-react'
import { PRICING_PLANS, formatPrice, calculateYearlySavings, BillingPeriod, SubscriptionTier } from '@/lib/subscription/types'

interface PricingPlansProps {
  currentTier?: SubscriptionTier
  onSelectPlan?: (tier: SubscriptionTier, billingPeriod: BillingPeriod) => void
  showToggle?: boolean
}

export default function PricingPlans({ 
  currentTier = 'free', 
  onSelectPlan,
  showToggle = true 
}: PricingPlansProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<typeof PRICING_PLANS[0] | null>(null)

  const handleSelectPlan = async (plan: typeof PRICING_PLANS[0]) => {
    if (plan.tier === currentTier) return
    
    setLoading(plan.tier)
    setSelectedPlan(plan)
    
    if (onSelectPlan) {
      onSelectPlan(plan.tier, billingPeriod)
    } else {
      // Default behavior - create checkout session
      try {
        const response = await fetch('/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: plan.tier,
            billingPeriod,
            email: 'demo@tradeai.pro', // Would come from auth
            provider: 'stripe'
          })
        })

        const data = await response.json()

        if (data.success && data.checkout?.checkoutUrl) {
          // Redirect to checkout
          setTimeout(() => {
            window.location.assign(data.checkout.checkoutUrl)
          }, 100)
        } else {
          setShowCheckout(true)
        }
      } catch (error) {
        console.error('Checkout error:', error)
        setShowCheckout(true)
      }
    }
    
    setLoading(null)
  }

  const getPlanIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return <Sparkles className="h-6 w-6" />
      case 'pro':
        return <Zap className="h-6 w-6" />
      case 'enterprise':
        return <Crown className="h-6 w-6" />
    }
  }

  const getPlanColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 'from-gray-400 to-gray-600'
      case 'pro':
        return 'from-purple-500 to-cyan-500'
      case 'enterprise':
        return 'from-amber-400 to-orange-500'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-gray-400">Unlock the full potential of AI-powered trading</p>
      </div>

      {/* Billing Toggle */}
      {showToggle && (
        <div className="flex items-center justify-center gap-4">
          <Label className={`text-sm ${billingPeriod === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
            Monthly
          </Label>
          <Switch
            checked={billingPeriod === 'yearly'}
            onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
            className="data-[state=checked]:bg-purple-500"
          />
          <Label className={`text-sm ${billingPeriod === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
            Yearly
          </Label>
          <Badge className="bg-green-500/20 text-green-400 text-xs">
            Save 17%
          </Badge>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {PRICING_PLANS.map((plan) => {
          const price = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
          const isCurrent = plan.tier === currentTier
          const savings = calculateYearlySavings(plan)
          const isLoading = loading === plan.tier

          return (
            <Card
              key={plan.id}
              className={`relative bg-gray-900/50 border-2 transition-all ${
                plan.highlighted 
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/10 scale-105' 
                  : 'border-gray-800 hover:border-gray-700'
              } ${isCurrent ? 'ring-2 ring-green-500/50' : ''}`}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={`bg-gradient-to-r ${getPlanColor(plan.tier)} text-white px-4 py-1`}>
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-br ${getPlanColor(plan.tier)} flex items-center justify-center text-white mb-3`}>
                  {getPlanIcon(plan.tier)}
                </div>
                <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </CardHeader>

              <CardContent className="text-center">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(price, plan.currency)}
                    </span>
                    <span className="text-gray-400">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  {billingPeriod === 'yearly' && savings > 0 && (
                    <p className="text-sm text-green-400 mt-1">
                      Save {formatPrice(savings, plan.currency)}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature.name}
                        {feature.limit && feature.included && (
                          <span className="text-gray-500 ml-1">
                            ({feature.limit === 'unlimited' ? 'Unlimited' : feature.limit})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isLoading || isCurrent}
                  className={`w-full ${
                    isCurrent
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : plan.highlighted
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : isCurrent ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : null}
                  {isCurrent ? 'Current Plan' : plan.monthlyPrice === 0 ? 'Get Started' : 'Upgrade'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-8 pt-6">
        <div className="flex items-center gap-2 text-gray-400">
          <Shield className="h-5 w-5 text-green-400" />
          <span className="text-sm">SSL Secured</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <CreditCard className="h-5 w-5 text-blue-400" />
          <span className="text-sm">Cancel Anytime</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <CheckCircle className="h-5 w-5 text-purple-400" />
          <span className="text-sm">7-Day Money Back</span>
        </div>
      </div>

      {/* Checkout Modal (Demo Mode) */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-400" />
              Checkout - {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete your subscription to unlock premium features
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Order Summary */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Plan</span>
                <span className="text-white font-medium">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Billing</span>
                <span className="text-white capitalize">{billingPeriod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-400">Total</span>
                <span className="text-2xl font-bold text-white">
                  {formatPrice(
                    billingPeriod === 'yearly' 
                      ? (selectedPlan?.yearlyPrice || 0) 
                      : (selectedPlan?.monthlyPrice || 0),
                    'USD'
                  )}
                </span>
              </div>
            </div>

            {/* Payment Providers */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600"
                onClick={() => {
                  // Stripe checkout
                  setShowCheckout(false)
                  // In production, redirect to Stripe Checkout
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay with Stripe
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-gray-700 hover:bg-gray-800"
                onClick={() => {
                  // Razorpay checkout
                  setShowCheckout(false)
                  // In production, open Razorpay Checkout
                }}
              >
                Pay with Razorpay (INR)
              </Button>
            </div>

            {/* Demo Notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Demo Mode: Configure Stripe/Razorpay credentials in production
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
