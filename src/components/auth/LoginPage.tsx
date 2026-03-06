'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Mail, Lock, Loader2, ArrowRight, Shield, User, CheckCircle } from 'lucide-react'

interface LoginPageProps {
  onSwitchToSignUp: () => void
  onSuccess: () => void
}

export default function LoginPage({ onSwitchToSignUp, onSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminCreating, setAdminCreating] = useState(false)
  const [adminCreated, setAdminCreated] = useState(false)
  const [adminMessage, setAdminMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Direct supabase call since we can't use hooks in event handlers
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
      } else {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createAndLoginAdmin = async () => {
    setAdminCreating(true)
    setAdminMessage('')
    setError('')

    try {
      // First, try to create the admin user
      const createRes = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@tradeai.com',
          password: 'admin123',
          fullName: 'Admin User'
        })
      })

      const createData = await createRes.json()
      
      if (createData.success) {
        setAdminCreated(true)
        setAdminMessage('Admin account created! Now logging in...')
        
        // Auto-fill and try login
        setEmail('admin@tradeai.com')
        setPassword('admin123')
        
        // Wait a moment then login
        setTimeout(async () => {
          const { supabase } = await import('@/lib/supabase')
          const { error } = await supabase.auth.signInWithPassword({
            email: 'admin@tradeai.com',
            password: 'admin123'
          })
          
          if (error) {
            setAdminMessage('Account created! Please check your email to confirm, then login.')
            setError(error.message)
          } else {
            onSuccess()
          }
          setAdminCreating(false)
        }, 1000)
      } else {
        // User might already exist, try to login directly
        if (createData.error?.includes('already') || createData.error?.includes('registered')) {
          setAdminMessage('Account exists! Logging in...')
          setEmail('admin@tradeai.com')
          setPassword('admin123')
          
          const { supabase } = await import('@/lib/supabase')
          const { error } = await supabase.auth.signInWithPassword({
            email: 'admin@tradeai.com',
            password: 'admin123'
          })
          
          if (error) {
            setError('Login failed. The admin account exists but password may be different.')
          } else {
            onSuccess()
          }
        } else {
          setError(createData.error || 'Failed to create admin account')
        }
        setAdminCreating(false)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setAdminCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-1">Sign in to your TradeAI Pro account</p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-center text-gray-400 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToSignUp}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign Up
                </button>
              </p>
            </div>
            
            {/* Admin Login Toggle */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowAdminLogin(!showAdminLogin)}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-amber-400 text-sm transition-colors"
              >
                <Shield className="h-4 w-4" />
                Admin Access
              </button>
              
              {showAdminLogin && (
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-amber-400" />
                    <span className="font-medium text-amber-400">Admin Login</span>
                  </div>
                  
                  {adminMessage && (
                    <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {adminMessage}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mb-3">
                    Click below to create admin account and login automatically.
                  </p>
                  
                  <Button
                    type="button"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium"
                    onClick={createAndLoginAdmin}
                    disabled={adminCreating}
                  >
                    {adminCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    {adminCreating ? 'Creating & Logging in...' : 'Create Admin & Login'}
                  </Button>
                  
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <p><strong>Email:</strong> admin@tradeai.com</p>
                    <p><strong>Password:</strong> admin123</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
