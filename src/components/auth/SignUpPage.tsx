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
  User,
  Loader2,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  Check,
  Chrome,
  Github,
  Sparkles
} from 'lucide-react'
import EmailVerificationScreen from './EmailVerificationScreen'

interface SignUpPageProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
  onBack?: () => void
}

export default function SignUpPage({ onSwitchToLogin, onSuccess, onBack }: SignUpPageProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    let strength = 0
    if (pass.length >= 8) strength++
    if (/[A-Z]/.test(pass)) strength++
    if (/[0-9]/.test(pass)) strength++
    if (/[^A-Za-z0-9]/.test(pass)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)

    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (!supabase || !isSupabaseConfigured) {
        setError('Authentication is not configured. Please contact support.')
        setLoading(false)
        return
      }

      // Get the base URL for email redirect
      const baseUrl = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.host}`
        : 'https://tradeai-live.vercel.app'
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          },
          emailRedirectTo: `${baseUrl}/auth/callback`
        }
      })

      if (error) {
        setError(error.message)
      } else {
        // User registered successfully
        // Check if email confirmation is required
        if (data.user && !data.session) {
          // Email confirmation required - show verification screen
          setRegisteredEmail(email)
          setShowVerification(true)
        } else {
          // Auto-confirmed (shouldn't happen with mailer_autoconfirm: false)
          // But handle it anyway
          try {
            await fetch('/api/admin/create-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, name, plan: 'free' })
            })
          } catch (e) {
            // Ignore profile creation errors
          }
          onSuccess()
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    const { supabase } = await import('@/lib/supabase')
    if (!supabase) return

    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://tradeai-live.vercel.app'

    await supabase.auth.resend({
      type: 'signup',
      email: registeredEmail,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback`
      }
    })
  }

  // Show verification screen after signup
  if (showVerification) {
    return (
      <EmailVerificationScreen
        email={registeredEmail}
        onBack={() => setShowVerification(false)}
        onResend={handleResendEmail}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-gray-950 to-gray-950" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 -z-5 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-float"
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          <span>Back to Home</span>
        </button>
      )}

      <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/25">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mt-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-400 mt-2">Start your AI trading journey today</p>
        </div>

        {/* Main Card */}
        <Card className="relative bg-gray-900/50 border-gray-800/50 backdrop-blur-xl overflow-hidden">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 pointer-events-none" />
          
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white">Sign Up</CardTitle>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Free Plan
              </Badge>
            </div>
            <CardDescription className="text-gray-400">
              Create your account in less than a minute
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-12 bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
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
                {/* Password Strength */}
                {password && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs ${
                      passwordStrength === 4 ? 'text-green-400' :
                      passwordStrength === 3 ? 'text-yellow-400' :
                      passwordStrength === 2 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {strengthLabels[passwordStrength - 1] || 'Too weak'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 h-12 bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                      required
                    />
                    {confirmPassword && password === confirmPassword && (
                      <Check className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 text-gray-400 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500/20"
                />
                <span>
                  I agree to the{' '}
                  <a href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
                </span>
              </label>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create Account
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
                <span className="bg-gray-900/50 px-3 text-gray-500">or sign up with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-gray-800/50 border-gray-700 hover:bg-gray-700 hover:border-gray-600 text-gray-300"
                onClick={() => setError('Google Sign-Up coming soon!')}
              >
                <Chrome className="h-5 w-5 mr-2" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-gray-800/50 border-gray-700 hover:bg-gray-700 hover:border-gray-600 text-gray-300"
                onClick={() => setError('GitHub Sign-Up coming soon!')}
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </Button>
            </div>

            {/* Sign In Link */}
            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-green-400" />
            <span>Free Forever Plan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-green-400" />
            <span>No Credit Card</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-green-400" />
            <span>Secure Email Verification</span>
          </div>
        </div>
      </div>
    </div>
  )
}
