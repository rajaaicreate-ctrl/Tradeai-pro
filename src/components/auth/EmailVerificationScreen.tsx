'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Sparkles,
  Shield,
  Zap,
  Loader2
} from 'lucide-react'

interface EmailVerificationScreenProps {
  email: string
  onBack: () => void
  onResend: () => Promise<void>
}

export default function EmailVerificationScreen({ email, onBack, onResend }: EmailVerificationScreenProps) {
  const [mounted, setMounted] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResend = async () => {
    if (countdown > 0) return
    
    setResending(true)
    try {
      await onResend()
      setResent(true)
      setCountdown(60)
      setTimeout(() => setResent(false), 3000)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-gray-950 to-gray-950" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 -z-5 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/25">
              <Mail className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mt-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Verify Your Email
          </h1>
          <p className="text-gray-400 mt-2">We've sent a confirmation link</p>
        </div>

        {/* Main Card */}
        <Card className="relative bg-gray-900/50 border-gray-800/50 backdrop-blur-xl overflow-hidden">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-transparent to-cyan-500/20 pointer-events-none" />
          
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-purple-500/30">
                <Mail className="h-10 w-10 text-purple-400 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-xl text-white text-center">Check Your Inbox</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              We sent a verification link to
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative pt-2">
            {/* Email Display */}
            <div className="bg-gray-800/50 rounded-lg p-4 text-center mb-6 border border-gray-700/50">
              <p className="text-cyan-400 font-medium text-lg">{email}</p>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-medium text-sm">1</span>
                </div>
                <span className="text-sm">Open your email inbox</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-medium text-sm">2</span>
                </div>
                <span className="text-sm">Find the email from TradeAI Pro</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-medium text-sm">3</span>
                </div>
                <span className="text-sm">Click the verification link to activate your account</span>
              </div>
            </div>

            {/* Resend Button */}
            <div className="space-y-3">
              <Button
                onClick={handleResend}
                disabled={countdown > 0 || resending}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50"
              >
                {resending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : resent ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Email Sent!
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-purple-300 font-medium text-sm">Didn't receive the email?</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Check your spam folder. The email should arrive within 2-3 minutes.
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-gray-500 text-xs text-center mb-3">Once verified, you'll get access to:</p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  <span>AI Trading Signals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Real-time Alerts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-green-400" />
                  <span>Portfolio Tracking</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Link */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Need help?{' '}
          <a href="mailto:support@tradeai.pro" className="text-purple-400 hover:text-purple-300 transition-colors">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}
