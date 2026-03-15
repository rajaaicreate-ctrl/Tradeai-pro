'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Globe,
  Check,
  CheckCircle,
  Chrome,
  Github,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'

interface LoginPageProps {
  onSwitchToSignUp: () => void
  onSwitchToAdmin: () => void
  onBack?: () => void
  onSuccess: () => void
  emailConfirmed?: boolean
  authError?: string
}

export default function LoginPage({ 
  onSwitchToSignUp, 
  onSwitchToAdmin, 
  onBack, 
  onSuccess,
  emailConfirmed,
  authError 
}: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(authError || '')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showEmailConfirmed, setShowEmailConfirmed] = useState(emailConfirmed || false)
  const [resetPasswordMode, setResetPasswordMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check URL params for email confirmed
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('email_confirmed') === 'true') {
        setShowEmailConfirmed(true)
        // Clean URL
        window.history.replaceState({}, '', '/')
      }
      if (params.get('auth_error')) {
        setError(decodeURIComponent(params.get('auth_error') || ''))
        window.history.replaceState({}, '', '/')
      }
    }
  }, [])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (showEmailConfirmed) {
      const timer = setTimeout(() => setShowEmailConfirmed(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showEmailConfirmed])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (!supabase || !isSupabaseConfigured) {
        setError('Authentication is not configured. Please contact support.')
        setLoading(false)
        return
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email address before signing in. Check your inbox for the verification link.')
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.')
        } else {
          setError(error.message)
        }
      } else {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/supabase')
      if (!supabase) return

      const baseUrl = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.host}`
        : 'https://tradeai-live.vercel.app'

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${baseUrl}/auth/callback?type=recovery`
      })

      if (error) {
        setError(error.message)
      } else {
        setResetSent(true)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setResetLoading(false)
    }
  }

  // Password Reset Mode
  if (resetPasswordMode) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/30 via-gray-950 to-gray-950" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Back Button */}
        <button
          onClick={() => {
            setResetPasswordMode(false)
            setResetSent(false)
            setResetEmail('')
          }}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Sign In</span>
        </button>

        <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                <Lock className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mt-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-gray-400 mt-2">We'll send you a reset link</p>
          </div>

          <Card className="relative bg-gray-900/50 border-gray-800/50 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 via-transparent to-orange-500/20 pointer-events-none" />
            
            <CardContent className="relative pt-6">
              {resetSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Check Your Email</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    We sent a password reset link to<br />
                    <span className="text-amber-400">{resetEmail}</span>
                  </p>
                  <Button
                    onClick={() => {
                      setResetPasswordMode(false)
                      setResetSent(false)
                    }}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-12 h-12 bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-gray-950 to-gray-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 -z-5 pointer-events-none">
        {[...Array(15)].map((_, i) => (
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
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </button>
      )}

      <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/25">
              <Brain className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mt-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-400 mt-2">Sign in to access your trading dashboard</p>
        </div>

        {/* Main Card */}
        <Card className="relative bg-gray-900/50 border-gray-800/50 backdrop-blur-xl overflow-hidden">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-transparent to-cyan-500/20 pointer-events-none" />
          
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white">Sign In</CardTitle>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure
              </Badge>
            </div>
            <CardDescription className="text-gray-400">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Confirmed Success Message */}
              {showEmailConfirmed && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-3 rounded-lg flex items-start gap-2 animate-pulse">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Email verified successfully! You can now sign in.</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500/20"
                  />
                  Remember me
                </label>
                <button 
                  type="button" 
                  onClick={() => setResetPasswordMode(true)}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900/50 px-3 text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-gray-800/50 border-gray-700 hover:bg-gray-700 hover:border-gray-600 text-gray-300"
                onClick={() => {
                  setError('Google Sign-In coming soon!')
                }}
              >
                <Chrome className="h-5 w-5 mr-2" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-gray-800/50 border-gray-700 hover:bg-gray-700 hover:border-gray-600 text-gray-300"
                onClick={() => {
                  setError('GitHub Sign-In coming soon!')
                }}
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToSignUp}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Create Free Account
                </button>
              </p>
            </div>
            
            {/* Admin Portal */}
            <div className="mt-4">
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-amber-400 text-sm transition-colors py-2 rounded-lg hover:bg-gray-800/50"
              >
                <Shield className="h-4 w-4" />
                Admin Portal
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-green-400" />
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-green-400" />
            <span>Email Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-green-400" />
            <span>Secure Auth</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-4">
          By signing in, you agree to our{' '}
          <a href="#" className="text-gray-500 hover:text-gray-400">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-gray-500 hover:text-gray-400">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
