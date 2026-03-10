'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Shield, Lock, Loader2, ArrowRight, Key, CheckCircle, Eye, EyeOff } from 'lucide-react'

interface AdminLoginPageProps {
  onBack: () => void
  onSuccess: () => void
}

// Secret Admin Key - Change this to your own secret key
const ADMIN_SECRET_KEY = 'TradeAI@2024Admin#Secret'

export default function AdminLoginPage({ onBack, onSuccess }: AdminLoginPageProps) {
  const [adminKey, setAdminKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [verified, setVerified] = useState(false)

  const handleVerifyKey = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (adminKey === ADMIN_SECRET_KEY) {
      setVerified(true)
      setError('')
    } else {
      setError('Invalid Admin Key. Access Denied.')
    }
  }

  const handleAdminLogin = async () => {
    setLoading(true)
    setError('')

    try {
      // Create admin session in localStorage
      localStorage.setItem('admin_session', JSON.stringify({
        isAdmin: true,
        email: 'admin@tradeai.pro',
        loginTime: new Date().toISOString(),
        key: ADMIN_SECRET_KEY
      }))
      
      // Set a cookie for persistence
      document.cookie = `admin_mode=true; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-amber-400 mt-1">TradeAI Pro Administration</p>
        </div>

        <Card className="bg-gray-900/50 border-amber-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              Admin Authentication
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter your admin secret key to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!verified ? (
              <form onSubmit={handleVerifyKey} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Admin Secret Key</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                    <Input
                      type={showKey ? 'text' : 'password'}
                      placeholder="Enter admin key..."
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      className="pl-10 pr-10 bg-gray-800 border-amber-500/30 text-white placeholder-gray-500 focus:border-amber-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Key
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-sm p-4 rounded-lg flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Admin Key Verified!</div>
                    <div className="text-xs text-green-300 mt-1">Click below to access admin dashboard</div>
                  </div>
                </div>

                <Button
                  onClick={handleAdminLogin}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Logging in...' : 'Access Admin Dashboard'}
                </Button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={onBack}
                className="w-full text-center text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Back to User Login
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              <strong className="text-gray-400">Secure Access:</strong> Admin portal uses a separate authentication system. 
              Contact system administrator for the secret key.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
