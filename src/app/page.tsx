'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Shield,
  Target,
  Activity,
  RefreshCw,
  TrendingDown,
  DollarSign,
  Bitcoin,
  Coins,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  LineChart,
  CandlestickChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  Filter,
  Download,
  Send
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic imports for better performance
const MarketOverview = dynamic(() => import('@/components/dashboard/MarketOverview'), { ssr: false })
const AlertsCenter = dynamic(() => import('@/components/dashboard/AlertsCenter'), { ssr: false })
const BacktestPanel = dynamic(() => import('@/components/dashboard/BacktestPanel'), { ssr: false })
const PricingPlans = dynamic(() => import('@/components/dashboard/PricingPlans'), { ssr: false })

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: TrendingUp, label: 'Markets', id: 'markets' },
  { icon: Zap, label: 'Scanner', id: 'scanner' },
  { icon: BarChart3, label: 'Backtest', id: 'backtest' },
  { icon: Wallet, label: 'Portfolio', id: 'portfolio' },
  { icon: Brain, label: 'AI Insights', id: 'insights' },
  { icon: GraduationCap, label: 'AI Coach', id: 'coach' },
  { icon: Bell, label: 'Alerts', id: 'alerts' },
  { icon: CreditCard, label: 'Pricing', id: 'pricing' },
]

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [marketData, setMarketData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch market data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/market-data')
        const result = await response.json()
        if (result.success) {
          setMarketData(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Demo data for portfolio
  const portfolio = {
    balance: 5240,
    totalPL: 740,
    winRate: 61,
    totalTrades: 84,
    riskLevel: 'Medium'
  }

  // Demo AI insights
  const aiInsights = [
    { id: 1, title: 'EUR/USD Breaking Resistance', type: 'trend', probability: 78, description: 'Strong bullish momentum detected on 4H timeframe. Volume confirms breakout potential.' },
    { id: 2, title: 'Gold Support Test', type: 'pattern', probability: 72, description: 'Testing key support at $2,330. Watch for bounce or breakdown confirmation.' },
    { id: 3, title: 'BTC Consolidation', type: 'neutral', probability: 65, description: 'Range-bound between $65K-$68K. Awaiting catalyst for direction.' },
    { id: 4, title: 'USD/JPY Trend Continuation', type: 'trend', probability: 81, description: 'Strong uptrend with potential to test 150.00 resistance zone.' },
  ]

  // Demo opportunities
  const opportunities = [
    { id: 1, symbol: 'EUR/USD', type: 'Breakout', direction: 'Long', confidence: 82, entry: 1.0892, target: 1.0950, stopLoss: 1.0860 },
    { id: 2, symbol: 'XAU/USD', type: 'Reversal', direction: 'Short', confidence: 71, entry: 2342, target: 2310, stopLoss: 2360 },
    { id: 3, symbol: 'BTC/USD', type: 'Support Bounce', direction: 'Long', confidence: 68, entry: 66500, target: 68500, stopLoss: 65000 },
    { id: 4, symbol: 'GBP/USD', type: 'Trend Follow', direction: 'Long', confidence: 75, entry: 1.2650, target: 1.2780, stopLoss: 1.2580 },
  ]

  // Demo portfolio positions
  const positions = [
    { symbol: 'EUR/USD', direction: 'Long', size: 0.5, entry: 1.0850, current: 1.0892, pnl: 210, pnlPercent: 4.2 },
    { symbol: 'XAU/USD', direction: 'Short', size: 0.1, entry: 2350, current: 2342, pnl: 80, pnlPercent: 1.6 },
    { symbol: 'BTC/USD', direction: 'Long', size: 0.01, entry: 66000, current: 66500, pnl: 50, pnlPercent: 1.0 },
  ]

  // Demo coaching tips
  const coachingTips = [
    { type: 'warning', title: 'Risk Management', message: 'Your position size on EUR/USD is 2.5% of account. Consider reducing to 1-2% for better risk control.' },
    { type: 'success', title: 'Great Progress!', message: 'Your win rate improved 5% this week. Keep following your strategy rules consistently.' },
    { type: 'info', title: 'Market Hours', message: 'Your best trades happen during London session (8-12 GMT). Consider focusing on this timeframe.' },
    { type: 'tip', title: 'Setup Recognition', message: 'The head & shoulders pattern you identified on GBP/USD has 78% historical accuracy in similar conditions.' },
  ]

  // Demo alerts
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
            {/* Market Overview */}
            <MarketOverview />
            
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
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

                {/* AI Market Summary */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      AI Market Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiInsights.map((insight) => (
                        <div key={insight.id} className={`p-3 rounded-lg border ${
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

                {/* Opportunity Scanner */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-cyan-400" />
                      Opportunity Scanner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {opportunities.map((opp) => (
                        <div key={opp.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-yellow-400" />
                              <span className="text-white font-medium">{opp.symbol}</span>
                              <Badge className={opp.direction === 'Long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                {opp.direction}
                              </Badge>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">Active</Badge>
                          </div>
                          <div className="text-xs text-gray-400 mb-2">{opp.type}</div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div><span className="text-gray-500">Entry:</span> <span className="text-white">{opp.entry}</span></div>
                            <div><span className="text-gray-500">Target:</span> <span className="text-green-400">{opp.target}</span></div>
                            <div><span className="text-gray-500">Confidence:</span> <span className="text-cyan-400">{opp.confidence}%</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Alerts Center */}
                <AlertsCenter />

                {/* AI Coach */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-indigo-400" />
                      AI Coach
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-medium text-amber-400">Warning</span>
                      </div>
                      <p className="text-xs text-gray-300">High volatility expected during Fed meeting. Reduce position sizes.</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Tip</span>
                      </div>
                      <p className="text-xs text-gray-300">Your best trades happen during London session (8-12 GMT).</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-400">Insight</span>
                      </div>
                      <p className="text-xs text-gray-300">Win rate improved 5% this week. Keep following your strategy!</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="text-gray-400 text-sm">Opportunities Found</div>
                  <div className="text-2xl font-bold text-white mt-1">24</div>
                  <div className="text-green-400 text-xs mt-1">+5 from yesterday</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="text-gray-400 text-sm">AI Accuracy (7d)</div>
                  <div className="text-2xl font-bold text-white mt-1">74.2%</div>
                  <div className="text-green-400 text-xs mt-1">+2.1% improvement</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="text-gray-400 text-sm">Active Alerts</div>
                  <div className="text-2xl font-bold text-white mt-1">8</div>
                  <div className="text-gray-400 text-xs mt-1">3 triggered today</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="text-gray-400 text-sm">Assets Scanned</div>
                  <div className="text-2xl font-bold text-white mt-1">156</div>
                  <div className="text-cyan-400 text-xs mt-1">12 markets</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'markets':
        return (
          <div className="space-y-6">
            <MarketOverview />
            
            {/* Market Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CandlestickChart className="h-5 w-5 text-green-400" />
                    Forex Market
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { pair: 'EUR/USD', price: 1.0892, change: 0.15, trend: 'up' },
                      { pair: 'GBP/USD', price: 1.2654, change: -0.08, trend: 'down' },
                      { pair: 'USD/JPY', price: 149.85, change: 0.32, trend: 'up' },
                      { pair: 'AUD/USD', price: 0.6543, change: 0.05, trend: 'up' },
                    ].map((item) => (
                      <div key={item.pair} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">{item.pair}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white">{item.price}</span>
                          <span className={item.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {item.change >= 0 ? '+' : ''}{item.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bitcoin className="h-5 w-5 text-orange-400" />
                    Crypto Market
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { pair: 'BTC/USD', price: 66543, change: 2.45, trend: 'up' },
                      { pair: 'ETH/USD', price: 3421, change: 1.82, trend: 'up' },
                      { pair: 'SOL/USD', price: 142.5, change: -1.23, trend: 'down' },
                      { pair: 'XRP/USD', price: 0.5234, change: 0.89, trend: 'up' },
                    ].map((item) => (
                      <div key={item.pair} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">{item.pair}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white">${item.price.toLocaleString()}</span>
                          <span className={item.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {item.change >= 0 ? '+' : ''}{item.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-400" />
                    Commodities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { pair: 'XAU/USD', name: 'Gold', price: 2342.50, change: 0.45 },
                      { pair: 'XAG/USD', name: 'Silver', price: 27.85, change: -0.32 },
                      { pair: 'WTI', name: 'Oil', price: 78.45, change: 1.23 },
                    ].map((item) => (
                      <div key={item.pair} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">{item.name}</span>
                          <span className="text-gray-400 text-xs">{item.pair}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white">${item.price.toLocaleString()}</span>
                          <span className={item.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {item.change >= 0 ? '+' : ''}{item.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                    Indices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'S&P 500', price: 5234.50, change: 0.56 },
                      { name: 'NASDAQ', price: 16428.75, change: 0.82 },
                      { name: 'DOW', price: 39127.80, change: -0.12 },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white">{item.price.toLocaleString()}</span>
                          <span className={item.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {item.change >= 0 ? '+' : ''}{item.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
                    Opportunity Scanner
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Scan Now
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {opportunities.map((opp) => (
                    <Card key={opp.id} className="bg-gray-800/50 border-gray-700">
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
                        <p className="text-gray-400 text-sm mb-3">{opp.type}</p>
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

            {/* Scanner Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div className="text-gray-400 text-sm">Last Scan</div>
                  </div>
                  <div className="text-xl font-bold text-white mt-2">2 min ago</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-gray-400" />
                    <div className="text-gray-400 text-sm">Opportunities</div>
                  </div>
                  <div className="text-xl font-bold text-white mt-2">24</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gray-400" />
                    <div className="text-gray-400 text-sm">Accuracy</div>
                  </div>
                  <div className="text-xl font-bold text-green-400 mt-2">78.5%</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-gray-400" />
                    <div className="text-gray-400 text-sm">Best Setup</div>
                  </div>
                  <div className="text-xl font-bold text-cyan-400 mt-2">EUR/USD</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'backtest':
        return (
          <div className="space-y-6">
            <BacktestPanel />
          </div>
        )

      case 'portfolio':
        return (
          <div className="space-y-6">
            {/* Portfolio Overview */}
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

            {/* Open Positions */}
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300">
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

            {/* Performance Chart Placeholder */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-purple-400" />
                  Performance History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-800/30 rounded-lg flex items-center justify-center border border-gray-700">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500">Performance chart will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'insights':
        return (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  AI Market Insights
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time AI analysis of market conditions and trading opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <div key={insight.id} className={`p-4 rounded-lg border ${
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
                      <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                          Set Alert
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Confidence Meter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">AI Confidence</div>
                      <div className="text-xl font-bold text-green-400">78%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Models Active</div>
                      <div className="text-xl font-bold text-white">5</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Predictions Today</div>
                      <div className="text-xl font-bold text-white">12</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'coach':
        return (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-400" />
                  AI Trading Coach
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Personalized tips and guidance to improve your trading
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
                          tip.type === 'info' ? 'text-blue-400' :
                          'text-purple-400'
                        }`}>{tip.title}</h4>
                      </div>
                      <p className="text-sm text-gray-300">{tip.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trading Stats */}
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
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Trend Following</span>
                      <Progress value={85} className="w-24 h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Risk Management</span>
                      <Progress value={72} className="w-24 h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Entry Timing</span>
                      <Progress value={68} className="w-24 h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Pattern Recognition</span>
                      <Progress value={79} className="w-24 h-2" />
                    </div>
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
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Exit Timing</span>
                      <Progress value={55} className="w-24 h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Position Sizing</span>
                      <Progress value={48} className="w-24 h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Emotional Control</span>
                      <Progress value={62} className="w-24 h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Journal Habits</span>
                      <Progress value={35} className="w-24 h-2" />
                    </div>
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
            
            {/* Create Alert */}
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
                      <option>Volume Alert</option>
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

            {/* Active Alerts */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-cyan-400" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">{alert.symbol}</span>
                          <Badge className="bg-gray-700 text-gray-300">{alert.type}</Badge>
                          <span className="text-gray-400 text-sm">{alert.condition}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={alert.triggered ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'}>
                            {alert.triggered ? 'Triggered' : 'Active'}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-6">
            <PricingPlans />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900/80 border-r border-gray-800 flex flex-col transition-all duration-300 fixed h-full z-50`}>
        {/* Logo */}
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

        {/* Navigation */}
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

        {/* User Section */}
        <div className="p-4 border-t border-gray-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">Demo User</div>
                <div className="text-xs text-gray-500">Pro Plan</div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
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
              <Button className="bg-purple-500 hover:bg-purple-600">
                <CreditCard className="h-4 w-4 mr-1" />
                Upgrade Plan
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="p-6">
            {renderContent()}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
