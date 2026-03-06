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
  Loader2
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

interface UserProfile {
  id: string
  email: string
  full_name?: string
  plan: 'free' | 'pro' | 'enterprise'
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  
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
    if (user) {
      // Load default data immediately
      setAiInsights(getDefaultInsights())
      setCoachingTips(getDefaultCoaching())
      setOpportunities(getDefaultOpportunities())
      loadAIData()
    }
  }, [user])

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

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900/80 border-r border-gray-800 flex flex-col transition-all duration-300 fixed h-full z-50`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-white">TradeAI Pro</span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="h-8 w-8">
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start gap-3 ${
                  activeSection === item.id ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {sidebarOpen && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-gray-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{profile?.full_name || profile?.email || 'User'}</div>
                <div className="text-xs text-gray-500 capitalize">{profile?.plan || 'Free'} Plan</div>
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
                {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
              <Button className="bg-purple-500 hover:bg-purple-600" onClick={() => setActiveSection('pricing')}>
                <CreditCard className="h-4 w-4 mr-1" />
                Upgrade Plan
              </Button>
            </div>
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="p-6">
            {renderContent()}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}

// Default data functions
function getDefaultInsights() {
  return [
    { title: 'EUR/USD Breaking Resistance', type: 'trend', probability: 78, description: 'Strong bullish momentum detected on 4H timeframe.' },
    { title: 'Gold Support Test', type: 'pattern', probability: 72, description: 'Testing key support at $2,330. Watch for bounce.' },
    { title: 'BTC Consolidation', type: 'neutral', probability: 65, description: 'Range-bound between $65K-$68K. Awaiting catalyst.' },
  ]
}

function getDefaultCoaching() {
  return [
    { type: 'warning', title: 'Risk Management', message: 'Always use proper position sizing. Never risk more than 2% per trade.' },
    { type: 'success', title: 'Great Progress!', message: 'Your win rate improved 5% this week. Keep following your strategy.' },
    { type: 'info', title: 'Market Hours', message: 'Your best trades happen during London session (8-12 GMT).' },
    { type: 'tip', title: 'Setup Recognition', message: 'The pattern you identified has 78% historical accuracy.' },
  ]
}

function getDefaultOpportunities() {
  return [
    { symbol: 'EUR/USD', type: 'Breakout', direction: 'Long', confidence: 82, entry: 1.0892, target: 1.0950, stopLoss: 1.0860, reasoning: 'Ascending triangle with volume confirmation' },
    { symbol: 'BTC/USD', type: 'Support Bounce', direction: 'Long', confidence: 68, entry: 66500, target: 68500, stopLoss: 65000, reasoning: 'Strong support zone with bullish divergence' },
    { symbol: 'XAU/USD', type: 'Reversal', direction: 'Short', confidence: 71, entry: 2342, target: 2310, stopLoss: 2360, reasoning: 'Double top pattern at resistance' },
  ]
}
