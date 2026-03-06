'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
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
  Sparkles
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
    { id: 1, title: 'EUR/USD Breaking Resistance', type: 'trend', probability: 78, description: 'Strong bullish momentum detected' },
    { id: 2, title: 'Gold Support Test', type: 'pattern', probability: 72, description: 'Testing key support at $2,330' },
    { id: 3, title: 'BTC Consolidation', type: 'neutral', probability: 65, description: 'Range-bound between $65K-$68K' },
  ]

  // Demo opportunities
  const opportunities = [
    { id: 1, symbol: 'EUR/USD', type: 'Breakout', direction: 'Long', confidence: 82, entry: 1.0892, target: 1.0950 },
    { id: 2, symbol: 'XAU/USD', type: 'Reversal', direction: 'Short', confidence: 71, entry: 2342, target: 2310 },
    { id: 3, symbol: 'BTC/USD', type: 'Support Bounce', direction: 'Long', confidence: 68, entry: 66500, target: 68500 },
  ]

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
          <div className="p-6 space-y-6">
            {/* Market Overview */}
            <section>
              <MarketOverview />
            </section>

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

                {/* Strategy Backtester */}
                <BacktestPanel />

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
            <section>
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
            </section>

            {/* Pricing Plans */}
            <section>
              <PricingPlans />
            </section>
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}

