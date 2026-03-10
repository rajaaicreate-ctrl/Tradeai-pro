'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Zap,
  Crown,
  Sparkles,
  ExternalLink,
  RefreshCw,
  XCircle,
  Settings,
  Download
} from 'lucide-react'

interface SubscriptionData {
  id: string
  tier: string
  status: string
  provider: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  billing_period: string
  amount: number
  currency: string
}

interface SubscriptionManagerProps {
  userId?: string
}

export default function SubscriptionManager({ userId }: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

  // Fetch subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/subscription?action=subscription&userId=${userId || 'demo'}`)
        const data = await response.json()
        if (data.success) {
          setSubscription(data.subscription || null)
        } else {
          // Use demo subscription
          setSubscription(getDemoSubscription())
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
        setSubscription(getDemoSubscription())
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [userId])

  const getDemoSubscription = (): SubscriptionData => ({
    id: 'sub_demo',
    tier: 'pro',
    status: 'active',
    provider: 'stripe',
    current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_at_period_end: false,
    billing_period: 'monthly',
    amount: 29,
    currency: 'USD'
  })

  const handleManageBilling = async () => {
    try {
      const response = await fetch(`/api/subscription?action=portal&userId=${userId || 'demo'}`)
      const data = await response.json()
      if (data.success && data.portalUrl) {
        window.open(data.portalUrl, '_blank')
      } else {
        // Demo: Show portal dialog
        alert('Billing portal would open here in production')
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription?.id,
          action: 'cancel'
        })
      })

      const data = await response.json()
      if (data.success) {
        setSubscription(prev => prev ? { 
          ...prev, 
          cancel_at_period_end: true 
        } : null)
        setShowCancelDialog(false)
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
    }
  }

  const handleReactivate = async () => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'demo',
          action: 'reactivate'
        })
      })

      const data = await response.json()
      if (data.success) {
        setSubscription(prev => prev ? { 
          ...prev, 
          cancel_at_period_end: false,
          status: 'active'
        } : null)
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error)
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
        return <Zap className="h-6 w-6 text-purple-400" />
      case 'enterprise':
        return <Crown className="h-6 w-6 text-amber-400" />
      default:
        return <Sparkles className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400 border-green-500/50',
      past_due: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
      trialing: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    }
    return styles[status] || 'bg-gray-500/20 text-gray-400'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysRemaining = () => {
    if (!subscription) return 0
    const end = new Date(subscription.current_period_end)
    const now = new Date()
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/3"></div>
            <div className="h-20 bg-gray-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Free tier view
  if (!subscription || subscription.tier === 'free') {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Free Plan</h3>
          <p className="text-gray-400 mb-6">Upgrade to unlock premium features</p>
          <Button 
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            onClick={() => setShowUpgradeDialog(true)}
          >
            <Zap className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-400" />
              Subscription
            </div>
            <Badge className={getStatusBadge(subscription.status)}>
              {subscription.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
              {subscription.status === 'past_due' && <AlertCircle className="h-3 w-3 mr-1" />}
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              {getTierIcon(subscription.tier)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white capitalize">{subscription.tier} Plan</h3>
              <p className="text-gray-400 text-sm">
                {subscription.billing_period === 'yearly' ? 'Annual' : 'Monthly'} billing
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                ${subscription.amount}
              </div>
              <div className="text-gray-400 text-xs">
                per {subscription.billing_period === 'yearly' ? 'year' : 'month'}
              </div>
            </div>
          </div>

          {/* Billing Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Calendar className="h-4 w-4" />
                Current Period
              </div>
              <p className="text-white text-sm">
                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Clock className="h-4 w-4" />
                Days Remaining
              </div>
              <p className="text-white text-sm font-medium">
                {getDaysRemaining()} days
              </p>
              <Progress 
                value={(30 - getDaysRemaining()) / 30 * 100} 
                className="h-1 mt-2"
              />
            </div>
          </div>

          {/* Cancellation Notice */}
          {subscription.cancel_at_period_end && (
            <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-400 font-medium mb-1">
                <AlertCircle className="h-4 w-4" />
                Subscription Ending
              </div>
              <p className="text-gray-300 text-sm">
                Your subscription will end on {formatDate(subscription.current_period_end)}.
                You can reactivate it before then to continue enjoying premium features.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 border-amber-500/50 text-amber-400"
                onClick={handleReactivate}
              >
                Reactivate Subscription
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-gray-700"
              onClick={handleManageBilling}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
            {!subscription.cancel_at_period_end && (
              <Button 
                variant="ghost" 
                className="text-gray-400 hover:text-red-400"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>

          {/* Payment Method Info */}
          <div className="pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Payment Provider</span>
              <span className="text-white capitalize">{subscription.provider}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-400">Currency</span>
              <span className="text-white">{subscription.currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Cancel Subscription</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">What happens when you cancel:</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  You'll keep access until {formatDate(subscription.current_period_end)}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Your alerts will be limited to 3 active alerts
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-400" />
                  You'll lose access to backtesting and AI insights
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Upgrade Your Plan</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-400">
              Plan upgrade interface would appear here with Stripe/Razorpay checkout.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
