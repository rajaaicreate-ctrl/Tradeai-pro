'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  Radar, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Loader2,
  Sparkles,
  AlertTriangle,
  Zap,
  Filter,
  RefreshCw,
  Bell,
  Clock,
  BarChart3,
  Volume2,
  ChevronRight,
  X,
  CheckCircle,
  Flame,
  Eye,
  Star
} from 'lucide-react'

interface Opportunity {
  id: string
  symbol: string
  name: string
  marketType: string
  pattern: string
  patternLabel: string
  price: number
  priceChange: number
  priceChangePercent: number
  indicators: {
    rsi: number
    macd: { trend: string; histogram: number }
    sma20: number
    sma50: number
    ema: number
    volumeChange: number
  }
  levels: {
    support: number
    resistance: number
  }
  trend: string
  confidence: number
  level: string
  timestamp: string
}

interface RadarData {
  opportunities: Opportunity[]
  categories: {
    high: Opportunity[]
    medium: Opportunity[]
    watchlist: Opportunity[]
  }
  topOpportunities: Opportunity[]
  trendingMarkets: Opportunity[]
  alerts: Array<{
    type: string
    message: string
    confidence: number
    timestamp: string
  }>
  stats: {
    totalScanned: number
    opportunitiesFound: number
    highCount: number
    mediumCount: number
    watchlistCount: number
  }
  lastUpdate: string
  nextUpdate: string
  disclaimer: string
}

const TIMEFRAMES = [
  { value: '5m', label: '5 Min' },
  { value: '15m', label: '15 Min' },
  { value: '1H', label: '1 Hour' },
  { value: '4H', label: '4 Hour' },
  { value: '1D', label: '1 Day' }
]

const MARKET_TYPES = [
  { value: 'all', label: 'All Markets' },
  { value: 'forex', label: 'Forex' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'gold', label: 'Gold' },
  { value: 'usStocks', label: 'US Stocks' },
  { value: 'indianStocks', label: 'Indian Stocks' }
]

const PATTERN_TYPES = [
  { value: 'all', label: 'All Patterns' },
  { value: 'breakout', label: 'Breakout' },
  { value: 'support_bounce', label: 'Support Bounce' },
  { value: 'trend_reversal', label: 'Trend Reversal' },
  { value: 'volume_spike', label: 'Volume Spike' },
  { value: 'rsi_oversold', label: 'RSI Oversold' },
  { value: 'rsi_overbought', label: 'RSI Overbought' }
]

export default function AIOpportunityRadar() {
  const [data, setData] = useState<RadarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState('1H')
  const [marketType, setMarketType] = useState('all')
  const [patternType, setPatternType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; confidence: number }>>([])
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/ai/radar?timeframe=${timeframe}&marketType=${marketType}&patternType=${patternType}`
      )
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setError(null)
        setCountdown(30)

        // Add new alerts
        if (result.data.alerts && result.data.alerts.length > 0) {
          const newAlerts = result.data.alerts.map((a: any, i: number) => ({
            id: `${Date.now()}-${i}`,
            message: a.message,
            confidence: a.confidence
          }))
          setAlerts(prev => [...newAlerts, ...prev].slice(0, 5))
        }
      } else {
        setError(result.error || 'Failed to fetch data')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to radar')
    } finally {
      setLoading(false)
    }
  }, [timeframe, marketType, patternType])

  // Initial fetch and interval
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 30))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const getMarketIcon = (marketType: string) => {
    switch (marketType) {
      case 'forex': return '💱'
      case 'crypto': return '₿'
      case 'gold': return '🥇'
      case 'usStocks': return '📈'
      case 'indianStocks': return '🇮🇳'
      case 'indices': return '📊'
      default: return '💹'
    }
  }

  const getPatternColor = (pattern: string) => {
    switch (pattern) {
      case 'breakout':
      case 'support_bounce':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'trend_reversal':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'volume_spike':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'rsi_oversold':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rsi_overbought':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'high':
        return { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: Flame, color: 'text-red-400' }
      case 'medium':
        return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Star, color: 'text-yellow-400' }
      default:
        return { bg: 'bg-gray-500/10', border: 'border-gray-500/30', icon: Eye, color: 'text-gray-400' }
    }
  }

  const formatPrice = (price: number, marketType: string) => {
    if (marketType === 'forex') return price.toFixed(4)
    if (price > 1000) return price.toFixed(0)
    if (price > 1) return price.toFixed(2)
    return price.toFixed(4)
  }

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="bg-gray-900 border border-purple-500/30 rounded-lg p-3 shadow-lg animate-pulse"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-purple-400 animate-bounce" />
                  <div>
                    <p className="text-white text-sm font-medium">{alert.message}</p>
                    <p className="text-gray-400 text-xs">Confidence: {alert.confidence}%</p>
                  </div>
                </div>
                <button onClick={() => dismissAlert(alert.id)} className="text-gray-500 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Radar className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              AI Opportunity Radar
              {data && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  LIVE
                </Badge>
              )}
            </h2>
            <p className="text-gray-400 text-sm">Scanning 100+ assets for trading opportunities</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Countdown */}
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>Refresh in: {countdown}s</span>
          </div>

          {/* Manual Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="border-gray-700 text-gray-300"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`border-gray-700 ${showFilters ? 'bg-purple-500/20 text-purple-400' : 'text-gray-300'}`}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Market Type */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Market Type</label>
                <div className="flex flex-wrap gap-1">
                  {MARKET_TYPES.map(mt => (
                    <button
                      key={mt.value}
                      onClick={() => setMarketType(mt.value)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                        marketType === mt.value
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {mt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeframe */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Timeframe</label>
                <div className="flex flex-wrap gap-1">
                  {TIMEFRAMES.map(tf => (
                    <button
                      key={tf.value}
                      onClick={() => setTimeframe(tf.value)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                        timeframe === tf.value
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pattern Type */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Pattern Type</label>
                <div className="flex flex-wrap gap-1">
                  {PATTERN_TYPES.slice(0, 4).map(pt => (
                    <button
                      key={pt.value}
                      onClick={() => setPatternType(pt.value)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                        patternType === pt.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && !data && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Scanning markets...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {data && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{data.stats.totalScanned}</div>
              <div className="text-xs text-gray-400">Assets Scanned</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{data.stats.opportunitiesFound}</div>
              <div className="text-xs text-gray-400">Opportunities</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3 text-center border border-red-500/20">
              <div className="text-2xl font-bold text-red-400">{data.stats.highCount}</div>
              <div className="text-xs text-red-400">High Priority</div>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-3 text-center border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400">{data.stats.mediumCount}</div>
              <div className="text-xs text-yellow-400">Medium</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-400">{data.stats.watchlistCount}</div>
              <div className="text-xs text-gray-400">Watchlist</div>
            </div>
          </div>

          {/* 🔥 Top Opportunities */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-400" />
                🔥 Top Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.topOpportunities.slice(0, 6).map(opp => {
                  const levelStyle = getLevelStyle(opp.level)
                  const LevelIcon = levelStyle.icon
                  
                  return (
                    <div
                      key={opp.id}
                      onClick={() => setSelectedOpportunity(opp)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${levelStyle.bg} ${levelStyle.border}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getMarketIcon(opp.marketType)}</span>
                          <div>
                            <div className="font-bold text-white">{opp.symbol}</div>
                            <div className="text-xs text-gray-400">{opp.name}</div>
                          </div>
                        </div>
                        <LevelIcon className={`h-5 w-5 ${levelStyle.color}`} />
                      </div>
                      
                      <Badge className={`text-xs ${getPatternColor(opp.pattern)}`}>
                        {opp.patternLabel}
                      </Badge>
                      
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-gray-400">Confidence</span>
                        <div className="flex items-center gap-2">
                          <Progress value={opp.confidence} className="w-16 h-1.5" />
                          <span className="text-white font-medium">{opp.confidence}%</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                        <span className={opp.trend === 'Bullish' ? 'text-green-400' : opp.trend === 'Bearish' ? 'text-red-400' : 'text-yellow-400'}>
                          {opp.trend === 'Bullish' ? <TrendingUp className="h-3 w-3 inline" /> : 
                           opp.trend === 'Bearish' ? <TrendingDown className="h-3 w-3 inline" /> : 
                           <Activity className="h-3 w-3 inline" />}
                          {' '}{opp.trend}
                        </span>
                        <span>•</span>
                        <span>RSI: {opp.indicators.rsi}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* High Probability Setups */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  ⚡ High Probability Setups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {data.categories.high.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No high probability setups detected
                      </div>
                    ) : (
                      data.categories.high.map(opp => (
                        <div
                          key={opp.id}
                          className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                          onClick={() => setSelectedOpportunity(opp)}
                        >
                          <div className="flex items-center gap-3">
                            <span>{getMarketIcon(opp.marketType)}</span>
                            <div>
                              <div className="font-medium text-white">{opp.symbol}</div>
                              <div className="text-xs text-gray-400">{opp.patternLabel}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-red-500/20 text-red-400">{opp.confidence}%</Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              RSI: {opp.indicators.rsi}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Trending Markets */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-cyan-400" />
                  📈 Trending Markets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {data.trendingMarkets.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No trending markets detected
                      </div>
                    ) : (
                      data.trendingMarkets.map(opp => (
                        <div
                          key={opp.id}
                          className="flex items-center justify-between p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/10 transition-colors cursor-pointer"
                          onClick={() => setSelectedOpportunity(opp)}
                        >
                          <div className="flex items-center gap-3">
                            <span>{getMarketIcon(opp.marketType)}</span>
                            <div>
                              <div className="font-medium text-white">{opp.symbol}</div>
                              <div className="text-xs text-gray-400">
                                Vol: {opp.indicators.volumeChange > 0 ? '+' : ''}{opp.indicators.volumeChange}%
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-cyan-500/20 text-cyan-400">
                              <Volume2 className="h-3 w-3 mr-1" />
                              {opp.indicators.volumeChange}%
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {opp.patternLabel}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Watchlist Opportunities */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-gray-400" />
                👁️ Watchlist Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {data.categories.watchlist.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No watchlist items
                    </div>
                  ) : (
                    data.categories.watchlist.map(opp => (
                      <div
                        key={opp.id}
                        className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => setSelectedOpportunity(opp)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getMarketIcon(opp.marketType)}</span>
                          <span className="text-white text-sm">{opp.symbol}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs text-gray-400">
                            {opp.patternLabel}
                          </Badge>
                          <span className="text-xs text-gray-500">{opp.confidence}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="text-xs text-gray-500 flex items-start gap-2 p-3 bg-gray-800/30 rounded-lg">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{data.disclaimer}</span>
          </div>
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOpportunity(null)}>
          <Card className="bg-gray-900 border-gray-800 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-xl">{getMarketIcon(selectedOpportunity.marketType)}</span>
                  {selectedOpportunity.symbol}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOpportunity(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`text-sm ${getPatternColor(selectedOpportunity.pattern)}`}>
                  {selectedOpportunity.patternLabel}
                </Badge>
                <Badge className="bg-green-500/20 text-green-400">
                  {selectedOpportunity.confidence}% Confidence
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400">Price</div>
                  <div className="text-lg font-bold text-white">
                    {formatPrice(selectedOpportunity.price, selectedOpportunity.marketType)}
                  </div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400">Trend</div>
                  <div className={`text-lg font-bold ${selectedOpportunity.trend === 'Bullish' ? 'text-green-400' : selectedOpportunity.trend === 'Bearish' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {selectedOpportunity.trend}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">RSI (14)</span>
                  <span className={selectedOpportunity.indicators.rsi > 70 ? 'text-red-400' : selectedOpportunity.indicators.rsi < 30 ? 'text-green-400' : 'text-white'}>
                    {selectedOpportunity.indicators.rsi}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">MACD</span>
                  <span className={selectedOpportunity.indicators.macd.trend === 'Bullish' ? 'text-green-400' : 'text-red-400'}>
                    {selectedOpportunity.indicators.macd.trend}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Volume Change</span>
                  <span className={selectedOpportunity.indicators.volumeChange > 0 ? 'text-green-400' : 'text-red-400'}>
                    {selectedOpportunity.indicators.volumeChange > 0 ? '+' : ''}{selectedOpportunity.indicators.volumeChange}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                  <div className="text-xs text-green-400">Support</div>
                  <div className="text-white font-medium">{formatPrice(selectedOpportunity.levels.support, selectedOpportunity.marketType)}</div>
                </div>
                <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                  <div className="text-xs text-red-400">Resistance</div>
                  <div className="text-white font-medium">{formatPrice(selectedOpportunity.levels.resistance, selectedOpportunity.marketType)}</div>
                </div>
              </div>

              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 text-purple-400 text-sm mb-1">
                  <Sparkles className="h-4 w-4" />
                  Opportunity Analysis
                </div>
                <p className="text-gray-300 text-sm">
                  {selectedOpportunity.symbol} showing {selectedOpportunity.patternLabel.toLowerCase()} pattern with {selectedOpportunity.confidence}% confidence. 
                  {selectedOpportunity.trend === 'Bullish' ? ' Trend is bullish.' : selectedOpportunity.trend === 'Bearish' ? ' Trend is bearish.' : ' Trend is consolidating.'}
                  {selectedOpportunity.indicators.volumeChange > 50 && ' Volume spike confirms the setup.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
