'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react'
import dynamic from 'next/dynamic'

const TradingChart = dynamic(() => import('./TradingChart'), { ssr: false })

interface StockQuote {
  symbol: string
  name: string
  fullName: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  close: number
  volume: number
  timestamp: string
  trend: 'bullish' | 'bearish' | 'neutral'
}

interface IndexData {
  name: string
  value: number
  change: number
  changePercent: number
}

interface MarketStatus {
  status: string
  message: string
  isOpen: boolean
}

interface UpstoxData {
  indices: {
    nifty50: IndexData | null
    sensex: IndexData | null
  }
  stocks: StockQuote[]
  topTraded: StockQuote[]
  gainers: StockQuote[]
  losers: StockQuote[]
  marketStatus: MarketStatus
}

export default function IndianMarketOverview() {
  const [data, setData] = useState<UpstoxData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch live market data from Upstox
  const fetchMarketData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/upstox/market')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setIsLive(result.source === 'upstox')
        setLastUpdate(new Date())
      } else {
        setError(result.error || 'Failed to fetch market data')
      }
    } catch (err: any) {
      console.error('Error fetching market data:', err)
      setError(err.message || 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 15000) // Refresh every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const formatVolume = (vol: number) => {
    if (vol >= 10000000) return `${(vol / 10000000).toFixed(2)}Cr`
    if (vol >= 100000) return `${(vol / 100000).toFixed(2)}L`
    return vol.toLocaleString()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-400">Loading live market data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Live Status Bar */}
      <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isLive ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-400" />
            )}
            <span className="text-sm text-gray-400">
              {isLive ? '🟢 Live Upstox Data' : '🟡 Fallback Data'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${data?.marketStatus?.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {data?.marketStatus?.message || 'Market Status'}
          </Badge>
          <Button variant="ghost" size="sm" onClick={fetchMarketData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Risk Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-300">
          <strong>Risk Disclaimer:</strong> TradeAI Pro provides market analysis and educational insights only. 
          This platform does not provide investment advice. Users must conduct their own research before trading. 
          Trading in stocks involves risk of loss.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
          <p className="text-sm text-red-400">⚠️ {error}</p>
        </div>
      )}

      {/* Index Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NIFTY 50 */}
        <Card className="bg-gray-900/50 border-gray-800 hover:border-purple-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="text-lg">🇮🇳</span>
                  NIFTY 50
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {data?.indices?.nifty50?.value.toLocaleString('en-IN') || '---'}
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${data?.indices?.nifty50 && data.indices.nifty50.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {data?.indices?.nifty50 && data.indices.nifty50.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {data?.indices?.nifty50?.changePercent?.toFixed(2)}%
                </Badge>
                <div className={`text-sm mt-1 ${data?.indices?.nifty50 && data.indices.nifty50.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {data?.indices?.nifty50 ? `${data.indices.nifty50.change >= 0 ? '+' : ''}${data.indices.nifty50.change.toFixed(2)} pts` : '---'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SENSEX */}
        <Card className="bg-gray-900/50 border-gray-800 hover:border-cyan-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  SENSEX (BSE)
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {data?.indices?.sensex?.value.toLocaleString('en-IN') || '---'}
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${data?.indices?.sensex && data.indices.sensex.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {data?.indices?.sensex && data.indices.sensex.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {data?.indices?.sensex?.changePercent?.toFixed(2)}%
                </Badge>
                <div className={`text-sm mt-1 ${data?.indices?.sensex && data.indices.sensex.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {data?.indices?.sensex ? `${data.indices.sensex.change >= 0 ? '+' : ''}${data.indices.sensex.change.toFixed(2)} pts` : '---'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Indian Stocks */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-400" />
              🇮🇳 Top Indian Stocks (NSE)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-800">
                  <th className="text-left py-2 px-2">Stock</th>
                  <th className="text-right py-2 px-2">Price (₹)</th>
                  <th className="text-right py-2 px-2">Change</th>
                  <th className="text-right py-2 px-2">High / Low</th>
                  <th className="text-center py-2 px-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data?.stocks?.map((stock, idx) => (
                  <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-2">
                      <div className="font-medium text-white">{stock.symbol}</div>
                      <div className="text-xs text-gray-500">{stock.fullName}</div>
                    </td>
                    <td className="text-right py-3 px-2 text-white font-medium">
                      {formatPrice(stock.price)}
                    </td>
                    <td className={`text-right py-3 px-2 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <div>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}</div>
                      <div className="text-xs">({stock.changePercent}%)</div>
                    </td>
                    <td className="text-right py-3 px-2 text-gray-400 text-sm">
                      <div className="flex flex-col">
                        <span className="text-green-400">H: {stock.high.toFixed(2)}</span>
                        <span className="text-red-400">L: {stock.low.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <Badge className={
                        stock.trend === 'bullish' ? 'bg-green-500/20 text-green-400' :
                        stock.trend === 'bearish' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }>
                        {stock.trend === 'bullish' ? '📈 Bullish' : 
                         stock.trend === 'bearish' ? '📉 Bearish' : '➡️ Neutral'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gainers & Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              🚀 Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.gainers?.map((stock, idx) => (
                <div key={idx} className="flex items-center justify-between bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                  <div>
                    <div className="font-medium text-white">{stock.symbol}</div>
                    <div className="text-xs text-gray-500">{stock.fullName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{formatPrice(stock.price)}</div>
                    <div className="text-green-400 text-sm">+{stock.changePercent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5" />
              📉 Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.losers?.map((stock, idx) => (
                <div key={idx} className="flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <div>
                    <div className="font-medium text-white">{stock.symbol}</div>
                    <div className="text-xs text-gray-500">{stock.fullName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{formatPrice(stock.price)}</div>
                    <div className="text-red-400 text-sm">{stock.changePercent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradingChart symbol="RELIANCE.NS" height={300} />
        <TradingChart symbol="TCS.NS" height={300} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3 animate-pulse text-green-400" />
          <span>Live from Upstox API</span>
        </div>
        <span>•</span>
        <span>Auto-refresh every 15 seconds</span>
        <span>•</span>
        <span>NSE & BSE</span>
      </div>
    </div>
  )
}
