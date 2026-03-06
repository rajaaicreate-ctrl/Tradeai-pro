'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  LayoutDashboard,
  TrendingUp,
  Bell,
  Settings,
  User,
  Menu,
  X,
  Brain,
  BarChart3,
  Zap,
  GraduationCap,
  CreditCard,
  Wallet,
  Target,
  Activity,
  RefreshCw,
  Sparkles,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  LogOut,
  Loader2,
  Shield,
  Users,
  Database,
  Server,
  AlertCircle,
  TrendingDown,
  PieChart,
  DollarSign
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import LoginPage from '@/components/auth/LoginPage'
import SignUpPage from '@/components/auth/SignUpPage'

// Dynamic imports
const MarketOverview = dynamic(() => import('@/components/dashboard/MarketOverview'), { ssr: false })
const AlertsCenter = dynamic(() => import('@/components/dashboard/AlertsCenter'), { ssr: false })
const BacktestPanel = dynamic(() => import('@/components/dashboard/BacktestPanel'), { ssr: false })
const PricingPlans = dynamic(() => import('@/components/dashboard/PricingPlans'), { ssr: false })
const TradingChart = dynamic(() => import('@/components/dashboard/TradingChart'), { ssr: false })
const IndianMarketOverview = dynamic(() => import('@/components/dashboard/IndianMarketOverview'), { ssr: false })
const IndianStockScanner = dynamic(() => import('@/components/dashboard/IndianStockScanner'), { ssr: false })
const IndianMarketHeatmap = dynamic(() => import('@/components/dashboard/IndianMarketHeatmap'), { ssr: false })
const AISectorRotation = dynamic(() => import('@/components/dashboard/AISectorRotation'), { ssr: false })
const AIIndianInsights = dynamic(() => import('@/components/dashboard/AIIndianInsights'), { ssr: false })

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: TrendingUp, label: 'Markets', id: 'markets' },
  { icon: TrendingUp, label: '🇮🇳 Indian Markets', id: 'indian-markets' },
  { icon: Zap, label: 'Scanner', id: 'scanner' },
  { icon: BarChart3, label: 'Backtest', id: 'backtest' },
  { icon: Wallet, label: 'Portfolio', id: 'portfolio' },
  { icon: Brain, label: 'AI Insights', id: 'insights' },
  { icon: GraduationCap, label: 'AI Coach', id: 'coach' },
  { icon: Bell, label: 'Alerts', id: 'alerts' },
  { icon: CreditCard, label: 'Pricing', id: 'pricing' },
]

const adminSidebarItems = [
  { icon: LayoutDashboard, label: 'Admin Dashboard', id: 'admin-dashboard' },
  { icon: Users, label: 'User Management', id: 'admin-users' },
  { icon: Database, label: 'System Status', id: 'admin-system' },
  { icon: Server, label: 'API Logs', id: 'admin-logs' },
  { icon: PieChart, label: 'Analytics', id: 'admin-analytics' },
  { icon: Settings, label: 'Settings', id: 'admin-settings' },
]

interface UserProfile {
  id: string
  email: string
  full_name?: string
  plan: 'free' | 'pro' | 'enterprise'
  is_admin?: boolean
}

// Admin emails
const ADMIN_EMAILS = ['admin@tradeai.com', 'admin@tradeai.pro', 'raja@tradeai.com']

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  const [isAdmin, setIsAdmin] = useState(false)
  
  // AI Data states
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [coachingTips, setCoachingTips] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  // Check auth state
  useEffect(() => {
    let mounted = true
    
    const checkAuth = async () => {
      try {
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        if (!mounted) return
        
        setUser(session?.user ?? null)
        
        // Check if admin
        if (session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
          setIsAdmin(true)
        }
        
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Auth check error:', err)
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      
      // Check if admin
      if (session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
      
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })
    
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      clearTimeout(timeoutId)
      
      if (data) {
        setProfile(data as UserProfile)
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load AI data
  useEffect(() => {
    if (user && !isAdmin) {
      // Load default data immediately
      setAiInsights(getDefaultInsights())
      setCoachingTips(getDefaultCoaching())
      setOpportunities(getDefaultOpportunities())
      loadAIData()
    }
  }, [user, isAdmin])

  const loadAIData = async () => {
    setAiLoading(true)
    try {
      // Try to load AI insights from API
      const insightsRes = await fetch('/api/ai/analyze?action=insights')
      if (insightsRes.ok) {
        const data = await insightsRes.json()
        if (data.insights?.length > 0) {
          setAiInsights(data.insights)
        }
      }

      // Try to load coaching tips
      const coachRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'coaching',
          data: {
            tradingStats: {
              winRate: 61,
              totalTrades: 84,
              profitLoss: 740
            }
          }
        })
      })
      if (coachRes.ok) {
        const data = await coachRes.json()
        if (data.tips?.length > 0) {
          setCoachingTips(data.tips)
        }
      }

      // Try to load opportunities
      const scanRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scan',
          data: {
            marketData: [
              { symbol: 'EUR/USD', price: 1.0892, change24h: 0.15 },
              { symbol: 'GBP/USD', price: 1.2654, change24h: -0.08 },
              { symbol: 'BTC/USD', price: 66543, change24h: 2.45 },
              { symbol: 'XAU/USD', price: 2342.50, change24h: 0.45 }
            ]
          }
        })
      })
      if (scanRes.ok) {
        const data = await scanRes.json()
        if (data.opportunities?.length > 0) {
          setOpportunities(data.opportunities)
        }
      }
    } catch (err) {
      console.error('AI load error:', err)
      // Keep default data
    } finally {
      setAiLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setIsAdmin(false)
  }

  // Default data functions
  function getDefaultInsights() {
    return [
      { title: 'EUR/USD Breaking Resistance', type: 'trend', probability: 78, description: 'Strong bullish momentum detected on 4H timeframe with increasing volume confirmation.' },
      { title: 'Gold Support Test', type: 'pattern', probability: 72, description: 'Testing key support at $2,330. Watch for bounce or breakdown confirmation.' },
      { title: 'BTC Consolidation', type: 'neutral', probability: 65, description: 'Range-bound between $65K-$68K. Awaiting catalyst for directional move.' },
      { title: 'USD/JPY Trend Continuation', type: 'trend', probability: 81, description: 'Strong uptrend with potential to test 150.00 resistance zone.' },
    ]
  }

  function getDefaultCoaching() {
    return [
      { type: 'warning', title: 'Risk Management', message: 'Always use proper position sizing. Never risk more than 2% of your account on a single trade.' },
      { type: 'success', title: 'Great Progress!', message: 'Your win rate improved 5% this week. Keep following your trading strategy consistently.' },
      { type: 'info', title: 'Market Hours', message: 'Your best trades happen during London session (8-12 GMT). Consider focusing on this timeframe.' },
      { type: 'tip', title: 'Setup Recognition', message: 'The pattern you identified has 78% historical accuracy in similar market conditions.' },
    ]
  }

  function getDefaultOpportunities() {
    return [
      { symbol: 'EUR/USD', type: 'Breakout', direction: 'Long', confidence: 82, entry: 1.0892, target: 1.0950, stopLoss: 1.0860, reasoning: 'Ascending triangle pattern with volume confirmation suggests continuation.' },
      { symbol: 'BTC/USD', type: 'Support Bounce', direction: 'Long', confidence: 68, entry: 66500, target: 68500, stopLoss: 65000, reasoning: 'Strong support zone with bullish divergence on RSI.' },
      { symbol: 'XAU/USD', type: 'Reversal', direction: 'Short', confidence: 71, entry: 2342, target: 2310, stopLoss: 2360, reasoning: 'Double top pattern forming at key resistance level.' },
      { symbol: 'GBP/USD', type: 'Trend Follow', direction: 'Long', confidence: 75, entry: 1.2650, target: 1.2780, stopLoss: 1.2580, reasoning: 'Uptrend continuation with momentum confirmation.' },
    ]
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading TradeAI Pro...</p>
        </div>
      </div>
    )
  }

  // Auth screens
  if (!user) {
    if (authView === 'login') {
      return (
        <LoginPage
          onSwitchToSignUp={() => setAuthView('signup')}
          onSuccess={() => {}}
        />
      )
    } else {
      return (
        <SignUpPage
          onSwitchToLogin={() => setAuthView('login')}
          onSuccess={() => setAuthView('login')}
        />
      )
    }
  }

  // Portfolio data
  const portfolio = {
    balance: 5240,
    totalPL: 740,
    winRate: 61,
    totalTrades: 84,
    riskLevel: 'Medium'
  }

  // Positions
  const positions = [
    { symbol: 'EUR/USD', direction: 'Long', size: 0.5, entry: 1.0850, current: 1.0892, pnl: 210, pnlPercent: 4.2 },
    { symbol: 'XAU/USD', direction: 'Short', size: 0.1, entry: 2350, current: 2342, pnl: 80, pnlPercent: 1.6 },
    { symbol: 'BTC/USD', direction: 'Long', size: 0.01, entry: 66000, current: 66500, pnl: 50, pnlPercent: 1.0 },
  ]

  // Alerts
  const alerts = [
    { id: 1, type: 'price', symbol: 'EUR/USD', condition: 'Above 1.0950', status: 'active', triggered: false },
    { id: 2, type: 'rsi', symbol: 'BTC/USD', condition: 'RSI Below 30', status: 'triggered', triggered: true },
    { id: 3, type: 'pattern', symbol: 'XAU/USD', condition: 'Double Bottom', status: 'active', triggered: false },
  ]

  // Admin mock data
  const adminStats = {
    totalUsers: 1247,
    activeUsers: 892,
    proUsers: 234,
    enterpriseUsers: 45,
    totalRevenue: 45670,
    monthlyGrowth: 12.5,
    apiCalls: 89432,
    systemHealth: 99.8
  }

  const recentUsers = [
    { id: 1, email: 'user1@gmail.com', name: 'John Doe', plan: 'pro', joined: '2024-01-15', status: 'active' },
    { id: 2, email: 'user2@gmail.com', name: 'Jane Smith', plan: 'free', joined: '2024-01-14', status: 'active' },
    { id: 3, email: 'user3@gmail.com', name: 'Mike Johnson', plan: 'enterprise', joined: '2024-01-13', status: 'active' },
    { id: 4, email: 'user4@gmail.com', name: 'Sarah Wilson', plan: 'pro', joined: '2024-01-12', status: 'inactive' },
    { id: 5, email: 'user5@gmail.com', name: 'Tom Brown', plan: 'free', joined: '2024-01-11', status: 'active' },
  ]

  // Render admin content
  const renderAdminContent = () => {
    switch (activeSection) {
      case 'admin-dashboard':
        return (
          <div className="space-y-6">
            {/* Admin Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
                <p className="text-gray-400">Welcome back, Admin! Here's your platform overview.</p>
              </div>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-sm px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Admin Access
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-white mt-1">{adminStats.totalUsers.toLocaleString()}</p>
                      <p className="text-green-400 text-sm mt-1">+{adminStats.monthlyGrowth}% this month</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Users</p>
                      <p className="text-3xl font-bold text-white mt-1">{adminStats.activeUsers.toLocaleString()}</p>
                      <p className="text-cyan-400 text-sm mt-1">71.5% of total</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-cyan-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Monthly Revenue</p>
                      <p className="text-3xl font-bold text-white mt-1">${adminStats.totalRevenue.toLocaleString()}</p>
                      <p className="text-green-400 text-sm mt-1">+8.3% from last month</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">System Health</p>
                      <p className="text-3xl font-bold text-white mt-1">{adminStats.systemHealth}%</p>
                      <p className="text-green-400 text-sm mt-1">All systems operational</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Server className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Plan Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Free Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-gray-400">{adminStats.totalUsers - adminStats.proUsers - adminStats.enterpriseUsers}</div>
                  <Progress value={((adminStats.totalUsers - adminStats.proUsers - adminStats.enterpriseUsers) / adminStats.totalUsers) * 100} className="h-2 mt-4" />
                  <p className="text-gray-500 text-sm mt-2">77.4% of total users</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Pro Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-400">{adminStats.proUsers}</div>
                  <Progress value={(adminStats.proUsers / adminStats.totalUsers) * 100} className="h-2 mt-4" />
                  <p className="text-gray-500 text-sm mt-2">18.8% of total users</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Enterprise Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-cyan-400">{adminStats.enterpriseUsers}</div>
                  <Progress value={(adminStats.enterpriseUsers / adminStats.totalUsers) * 100} className="h-2 mt-4" />
                  <p className="text-gray-500 text-sm mt-2">3.6% of total users</p>
                </CardContent>
              </Card>
            </div>

            {/* API Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-cyan-400" />
                  API Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">API Calls Today</p>
                    <p className="text-2xl font-bold text-white mt-2">{adminStats.apiCalls.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Avg Response Time</p>
                    <p className="text-2xl font-bold text-green-400 mt-2">145ms</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-green-400 mt-2">99.9%</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Error Rate</p>
                    <p className="text-2xl font-bold text-amber-400 mt-2">0.1%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'admin-users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <p className="text-gray-400">Manage and monitor all platform users</p>
              </div>
              <div className="flex gap-3">
                <Input placeholder="Search users..." className="bg-gray-800 border-gray-700 text-white w-64" />
                <Button className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="text-left p-4 text-gray-400 font-medium">User</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Joined</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((u) => (
                        <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-white font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-400">{u.email}</td>
                          <td className="p-4">
                            <Badge className={
                              u.plan === 'enterprise' ? 'bg-cyan-500/20 text-cyan-400' :
                              u.plan === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-gray-500/20 text-gray-400'
                            }>
                              {u.plan.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-400">{u.joined}</td>
                          <td className="p-4">
                            <Badge className={u.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {u.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">Edit</Button>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'admin-system':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">System Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-400" />
                    Database
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <Badge className="bg-green-500/20 text-green-400">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Connections</span>
                    <span className="text-white">47/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Response Time</span>
                    <span className="text-white">12ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Storage Used</span>
                    <span className="text-white">2.4 GB / 10 GB</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Server className="h-5 w-5 text-green-400" />
                    API Server
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <Badge className="bg-green-500/20 text-green-400">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Uptime</span>
                    <span className="text-white">99.98%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Avg Latency</span>
                    <span className="text-white">45ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Requests/min</span>
                    <span className="text-white">1,247</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-green-400" />
                    AI Engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <Badge className="bg-green-500/20 text-green-400">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Model Version</span>
                    <span className="text-white">v2.4.1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Accuracy</span>
                    <span className="text-white">94.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Predictions Today</span>
                    <span className="text-white">8,432</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                    Alerts Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <Badge className="bg-green-500/20 text-green-400">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Alerts</span>
                    <span className="text-white">234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Triggered Today</span>
                    <span className="text-white">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Queue Size</span>
                    <span className="text-white">12</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'admin-logs':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">API Logs</h2>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-2 font-mono text-sm">
                    {[
                      { time: '10:45:23', type: 'INFO', msg: 'GET /api/market-data - 200 OK (45ms)' },
                      { time: '10:45:22', type: 'INFO', msg: 'POST /api/ai/analyze - 200 OK (234ms)' },
                      { time: '10:45:21', type: 'WARN', msg: 'Rate limit warning for user_123 - 95/100 requests' },
                      { time: '10:45:20', type: 'INFO', msg: 'GET /api/portfolio - 200 OK (23ms)' },
                      { time: '10:45:19', type: 'ERROR', msg: 'WebSocket connection timeout - reconnecting...' },
                      { time: '10:45:18', type: 'INFO', msg: 'GET /api/indian-stocks - 200 OK (67ms)' },
                      { time: '10:45:17', type: 'INFO', msg: 'POST /api/alerts/create - 201 Created (89ms)' },
                      { time: '10:45:16', type: 'INFO', msg: 'GET /api/health - 200 OK (5ms)' },
                      { time: '10:45:15', type: 'WARN', msg: 'High memory usage detected - 78%' },
                      { time: '10:45:14', type: 'INFO', msg: 'User signup: user_456@gmail.com' },
                      { time: '10:45:13', type: 'INFO', msg: 'GET /api/backtest - 200 OK (1.2s)' },
                      { time: '10:45:12', type: 'INFO', msg: 'Payment processed: $49.00 - user_789' },
                    ].map((log, idx) => (
                      <div key={idx} className={`p-2 rounded ${
                        log.type === 'ERROR' ? 'bg-red-500/10 text-red-400' :
                        log.type === 'WARN' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-gray-800/50 text-gray-300'
                      }`}>
                        <span className="text-gray-500">[{log.time}]</span>
                        <span className={`ml-2 ${
                          log.type === 'ERROR' ? 'text-red-400' :
                          log.type === 'WARN' ? 'text-amber-400' :
                          'text-green-400'
                        }`}>[{log.type}]</span>
                        <span className="ml-2">{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )

      case 'admin-analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end gap-2">
                    {[40, 55, 70, 85, 95, 110, 125, 140, 155, 170, 185, 200].map((val, idx) => (
                      <div key={idx} className="flex-1 bg-purple-500/30 rounded-t hover:bg-purple-500/50 transition-all" style={{ height: `${val * 0.3}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-xs text-gray-500">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end gap-2">
                    {[30, 45, 60, 55, 80, 95, 110, 125, 140, 165, 190, 220].map((val, idx) => (
                      <div key={idx} className="flex-1 bg-green-500/30 rounded-t hover:bg-green-500/50 transition-all" style={{ height: `${val * 0.3}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-xs text-gray-500">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Top Features Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'AI Market Analysis', usage: 89 },
                    { name: 'Indian Market Scanner', usage: 76 },
                    { name: 'Trading Charts', usage: 72 },
                    { name: 'Portfolio Tracker', usage: 65 },
                    { name: 'Alerts System', usage: 58 },
                    { name: 'Backtesting', usage: 45 },
                  ].map((feature, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{feature.name}</span>
                        <span className="text-white">{feature.usage}%</span>
                      </div>
                      <Progress value={feature.usage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'admin-settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Admin Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Maintenance Mode</p>
                      <p className="text-gray-500 text-sm">Disable platform for maintenance</p>
                    </div>
                    <Button variant="outline" className="border-gray-700">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">New Registrations</p>
                      <p className="text-gray-500 text-sm">Allow new user signups</p>
                    </div>
                    <Button className="bg-green-500 hover:bg-green-600">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Demo Mode</p>
                      <p className="text-gray-500 text-sm">Show demo data to new users</p>
                    </div>
                    <Button className="bg-green-500 hover:bg-green-600">Enabled</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">API Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Rate Limiting</p>
                      <p className="text-gray-500 text-sm">100 requests per minute</p>
                    </div>
                    <Button variant="outline" className="border-gray-700">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">API Key Required</p>
                      <p className="text-gray-500 text-sm">Require API key for all endpoints</p>
                    </div>
                    <Button className="bg-green-500 hover:bg-green-600">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">CORS Settings</p>
                      <p className="text-gray-500 text-sm">Cross-origin resource sharing</p>
                    </div>
                    <Button variant="outline" className="border-gray-700">Configure</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <MarketOverview />
            
            {/* Trading Chart */}
            <TradingChart symbol="EUR/USD" height={400} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Portfolio Section */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-amber-400" />
                      Portfolio Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-xs text-gray-400 mb-1">Balance</div>
                        <p className="text-2xl font-bold text-white">${portfolio.balance.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-xs text-gray-400 mb-1">P/L</div>
                        <p className="text-2xl font-bold text-green-400">+${portfolio.totalPL.toLocaleString()}</p>
                        <Badge className="bg-green-500/20 text-green-400 text-xs mt-1">+14.1%</Badge>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-xs text-gray-400 mb-1">Win Rate</div>
                        <p className="text-2xl font-bold text-white">{portfolio.winRate}%</p>
                        <Progress value={portfolio.winRate} className="h-2 mt-2" />
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-xs text-gray-400 mb-1">Total Trades</div>
                        <p className="text-2xl font-bold text-white">{portfolio.totalTrades}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                        <Badge className="bg-amber-500/20 text-amber-400 text-base px-3 py-1">{portfolio.riskLevel}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-400" />
                        AI Market Analysis
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={loadAIData} disabled={aiLoading}>
                        <RefreshCw className={`h-4 w-4 mr-1 ${aiLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiInsights.map((insight, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${
                          insight.type === 'trend' ? 'bg-green-500/10 border-green-500/50' :
                          insight.type === 'pattern' ? 'bg-purple-500/10 border-purple-500/50' :
                          'bg-gray-500/10 border-gray-500/50'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                            <Badge className="bg-gray-700 text-gray-300 text-xs">{insight.probability}% prob</Badge>
                          </div>
                          <p className="text-xs text-gray-400">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunities */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-cyan-400" />
                      AI-Scanned Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {opportunities.map((opp, idx) => (
                        <Card key={idx} className="bg-gray-800/50 border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold">{opp.symbol}</span>
                                <Badge className={opp.direction === 'Long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                  {opp.direction}
                                </Badge>
                              </div>
                              <span className="text-cyan-400 font-bold">{opp.confidence}%</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{opp.type}</p>
                            <p className="text-xs text-gray-500">{opp.reasoning}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                              <div><span className="text-gray-500">Entry:</span> <span className="text-white">{opp.entry}</span></div>
                              <div><span className="text-gray-500">Target:</span> <span className="text-green-400">{opp.target}</span></div>
                              <div><span className="text-gray-500">Stop:</span> <span className="text-red-400">{opp.stopLoss}</span></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <AlertsCenter />
                
                {/* AI Coach */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-indigo-400" />
                      AI Coach
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {coachingTips.map((tip, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${
                        tip.type === 'warning' ? 'bg-amber-500/10 border-amber-500/50' :
                        tip.type === 'success' ? 'bg-green-500/10 border-green-500/50' :
                        tip.type === 'info' ? 'bg-blue-500/10 border-blue-500/50' :
                        'bg-purple-500/10 border-purple-500/50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {tip.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-400" /> :
                           tip.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-400" /> :
                           tip.type === 'info' ? <Info className="h-4 w-4 text-blue-400" /> :
                           <Sparkles className="h-4 w-4 text-purple-400" />}
                          <span className={`text-sm font-medium ${
                            tip.type === 'warning' ? 'text-amber-400' :
                            tip.type === 'success' ? 'text-green-400' :
                            tip.type === 'info' ? 'text-blue-400' : 'text-purple-400'
                          }`}>{tip.title}</span>
                        </div>
                        <p className="text-xs text-gray-300">{tip.message}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="text-gray-400 text-sm">Opportunities Found</div>
                  <div className="text-2xl font-bold text-white mt-1">{opportunities.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="text-gray-400 text-sm">AI Accuracy (7d)</div>
                  <div className="text-2xl font-bold text-white mt-1">74.2%</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="text-gray-400 text-sm">Active Alerts</div>
                  <div className="text-2xl font-bold text-white mt-1">{alerts.filter(a => !a.triggered).length}</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="text-gray-400 text-sm">Your Plan</div>
                  <div className="text-2xl font-bold text-purple-400 mt-1 capitalize">{profile?.plan || 'Free'}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'markets':
        return (
          <div className="space-y-6">
            <TradingChart symbol="EUR/USD" height={500} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TradingChart symbol="BTC/USD" height={350} />
              <TradingChart symbol="XAU/USD" height={350} />
            </div>
          </div>
        )

      case 'indian-markets':
        return (
          <div className="space-y-6">
            {/* AI Indian Market Insights */}
            <AIIndianInsights />
            
            {/* Indian Market Overview with NIFTY, SENSEX */}
            <IndianMarketOverview />
            
            {/* AI Sector Rotation Tracker */}
            <AISectorRotation />
            
            {/* Indian Stock Scanner */}
            <IndianStockScanner />
            
            {/* Indian Market Heatmap */}
            <IndianMarketHeatmap />
          </div>
        )

      case 'scanner':
        return (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    AI Opportunity Scanner
                  </CardTitle>
                  <Button className="bg-purple-500 hover:bg-purple-600" onClick={loadAIData} disabled={aiLoading}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${aiLoading ? 'animate-spin' : ''}`} />
                    Scan Now
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {opportunities.map((opp, idx) => (
                    <Card key={idx} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{opp.symbol}</span>
                            <Badge className={opp.direction === 'Long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {opp.direction}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span className="text-cyan-400 font-bold">{opp.confidence}%</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-1">{opp.type}</p>
                        <p className="text-xs text-gray-500 mb-3">{opp.reasoning}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                          <div className="bg-gray-700/50 p-2 rounded">
                            <div className="text-gray-500">Entry</div>
                            <div className="text-white font-medium">{opp.entry}</div>
                          </div>
                          <div className="bg-gray-700/50 p-2 rounded">
                            <div className="text-gray-500">Target</div>
                            <div className="text-green-400 font-medium">{opp.target}</div>
                          </div>
                          <div className="bg-gray-700/50 p-2 rounded">
                            <div className="text-gray-500">Stop</div>
                            <div className="text-red-400 font-medium">{opp.stopLoss}</div>
                          </div>
                        </div>
                        <Button className="w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
                          View Analysis
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'backtest':
        return <BacktestPanel />

      case 'portfolio':
        return (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-amber-400" />
                  Portfolio Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Balance</div>
                    <p className="text-2xl font-bold text-white">${portfolio.balance.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">P/L</div>
                    <p className="text-2xl font-bold text-green-400">+${portfolio.totalPL.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Win Rate</div>
                    <p className="text-2xl font-bold text-white">{portfolio.winRate}%</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Trades</div>
                    <p className="text-2xl font-bold text-white">{portfolio.totalTrades}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Plan</div>
                    <Badge className="bg-purple-500/20 text-purple-400 text-base px-3 py-1 capitalize">{profile?.plan || 'Free'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    Open Positions
                  </CardTitle>
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Plus className="h-4 w-4 mr-1" />
                    New Trade
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {positions.map((pos, idx) => (
                    <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold">{pos.symbol}</span>
                          <Badge className={pos.direction === 'Long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {pos.direction}
                          </Badge>
                          <span className="text-gray-400 text-sm">Size: {pos.size}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {pos.pnl >= 0 ? '+' : ''}${pos.pnl} ({pos.pnlPercent}%)
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div><span className="text-gray-500">Entry:</span> <span className="text-white">{pos.entry}</span></div>
                        <div><span className="text-gray-500">Current:</span> <span className="text-white">{pos.current}</span></div>
                        <div><span className="text-gray-500">P/L:</span> <span className={pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>${pos.pnl}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-purple-400" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TradingChart symbol="EUR/USD" height={300} />
              </CardContent>
            </Card>
          </div>
        )

      case 'insights':
        return (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    Real-Time AI Market Insights
                  </CardTitle>
                  <Button onClick={loadAIData} disabled={aiLoading}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${aiLoading ? 'animate-spin' : ''}`} />
                    Analyze
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${
                      insight.type === 'trend' ? 'bg-green-500/10 border-green-500/50' :
                      insight.type === 'pattern' ? 'bg-purple-500/10 border-purple-500/50' :
                      'bg-gray-500/10 border-gray-500/50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {insight.type === 'trend' ? <ArrowUpRight className="h-5 w-5 text-green-400" /> :
                           insight.type === 'pattern' ? <Target className="h-5 w-5 text-purple-400" /> :
                           <Activity className="h-5 w-5 text-gray-400" />}
                          <h4 className="text-lg font-medium text-white">{insight.title}</h4>
                        </div>
                        <Badge className="bg-gray-700 text-gray-300">{insight.probability}% probability</Badge>
                      </div>
                      <p className="text-sm text-gray-300">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'coach':
        return (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-400" />
                  Personalized AI Trading Coach
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Get personalized tips to improve your trading performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coachingTips.map((tip, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${
                      tip.type === 'warning' ? 'bg-amber-500/10 border-amber-500/50' :
                      tip.type === 'success' ? 'bg-green-500/10 border-green-500/50' :
                      tip.type === 'info' ? 'bg-blue-500/10 border-blue-500/50' :
                      'bg-purple-500/10 border-purple-500/50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {tip.type === 'warning' ? <AlertTriangle className="h-5 w-5 text-amber-400" /> :
                         tip.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-400" /> :
                         tip.type === 'info' ? <Info className="h-5 w-5 text-blue-400" /> :
                         <Sparkles className="h-5 w-5 text-purple-400" />}
                        <h4 className={`font-medium ${
                          tip.type === 'warning' ? 'text-amber-400' :
                          tip.type === 'success' ? 'text-green-400' :
                          tip.type === 'info' ? 'text-blue-400' : 'text-purple-400'
                        }`}>{tip.title}</h4>
                      </div>
                      <p className="text-gray-300">{tip.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-cyan-400" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Trend Following', value: 85 },
                      { label: 'Risk Management', value: 72 },
                      { label: 'Entry Timing', value: 68 },
                      { label: 'Pattern Recognition', value: 79 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-400">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={item.value} className="w-24 h-2" />
                          <span className="text-white text-sm">{item.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-400" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Exit Timing', value: 55 },
                      { label: 'Position Sizing', value: 48 },
                      { label: 'Emotional Control', value: 62 },
                      { label: 'Journal Habits', value: 35 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-400">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={item.value} className="w-24 h-2" />
                          <span className="text-white text-sm">{item.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'alerts':
        return (
          <div className="space-y-6">
            <AlertsCenter />
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-400" />
                  Create New Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Symbol</label>
                    <Input placeholder="e.g., EUR/USD" className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Alert Type</label>
                    <select className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2">
                      <option>Price Alert</option>
                      <option>RSI Alert</option>
                      <option>Pattern Alert</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Condition</label>
                    <Input placeholder="e.g., Above 1.0950" className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      <Bell className="h-4 w-4 mr-1" />
                      Create Alert
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'pricing':
        return <PricingPlans />

      default:
        return null
    }
  }

  // Get sidebar items based on admin status
  const currentSidebarItems = isAdmin ? adminSidebarItems : sidebarItems

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900/80 border-r border-gray-800 flex flex-col transition-all duration-300 fixed h-full z-50`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-gradient-to-br from-amber-500 to-red-500' : 'bg-gradient-to-br from-purple-500 to-cyan-500'}`}>
                  {isAdmin ? <Shield className="h-5 w-5 text-white" /> : <Brain className="h-5 w-5 text-white" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm">TradeAI Pro</span>
                  {isAdmin && <span className="text-amber-400 text-xs">Admin Panel</span>}
                </div>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="h-8 w-8">
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          <nav className="space-y-1">
            {currentSidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start gap-3 ${
                  activeSection === item.id 
                    ? isAdmin 
                      ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                      : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-gray-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-gradient-to-br from-amber-500 to-red-500' : 'bg-gradient-to-br from-cyan-500 to-purple-500'}`}>
                {isAdmin ? <Shield className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{profile?.full_name || profile?.email || 'User'}</div>
                <div className="flex items-center gap-2">
                  <div className={`text-xs capitalize ${isAdmin ? 'text-amber-400' : 'text-gray-500'}`}>{isAdmin ? 'Admin' : profile?.plan || 'Free'}</div>
                  {isAdmin && <Badge className="bg-amber-500/20 text-amber-400 text-xs">Admin</Badge>}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8 text-red-400 hover:text-red-300">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-red-400">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">
                {currentSidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
              {!isAdmin && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live
                </Badge>
              )}
              {isAdmin && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
              {!isAdmin && (
                <Button className="bg-purple-500 hover:bg-purple-600" onClick={() => setActiveSection('pricing')}>
                  <CreditCard className="h-4 w-4 mr-1" />
                  Upgrade Plan
                </Button>
              )}
            </div>
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="p-6">
            {isAdmin ? renderAdminContent() : renderContent()}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
