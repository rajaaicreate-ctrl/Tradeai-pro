'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Coins, BarChart3, RefreshCw, Activity, Clock, Globe } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface MarketItem {
  symbol: string
  name?: string
  price: number
  change: number
  changePercent: number
  volume?: number
  timestamp: string
}

interface MarketsResponse {
  success: boolean
  data: {
    forex: MarketItem[]
    crypto: MarketItem[]
    commodities: MarketItem[]
    indices: MarketItem[]
  }
  source: string
}

const tabConfig = [
  { id: 'crypto', label: 'Crypto', icon: Bitcoin, color: 'text-orange-400' },
  { id: 'forex', label: 'Forex', icon: DollarSign, color: 'text-blue-400' },
  { id: 'commodities', label: 'Gold & Silver', icon: Coins, color: 'text-yellow-400' },
  { id: 'indices', label: 'Indices', icon: BarChart3, color: 'text-green-400' },
]

export default function MarketOverview() {
  const [markets, setMarkets] = useState<{
    forex: MarketItem[]
    crypto: MarketItem[]
    commodities: MarketItem[]
    indices: MarketItem[]
  }>({
    forex: [],
    crypto: [],
    commodities: [],
    indices: []
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [dataSource, setDataSource] = useState<string>('live')

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market-data')
      const result: MarketsResponse = await response.json()
      if (result.success && result.data) {
        setMarkets({
          forex: result.data.forex || [],
          crypto: result.data.crypto || [],
          commodities: result.data.commodities || [],
          indices: result.data.indices || []
        })
        setDataSource(result.source || 'live')
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  const generateSparkline = (basePrice: number, trend: number) => {
    const data = []
    let price = basePrice * 0.98
    const direction = trend >= 0 ? 0.51 : 0.49
    for (let i = 0; i < 20; i++) {
      price += (Math.random() - direction) * basePrice * 0.005
      data.push({ value: price })
    }
    data.push({ value: basePrice })
    return data
  }

  const formatPrice = (price: number, type: string) => {
    if (type === 'forex') return price.toFixed(4)
    if (type === 'crypto') {
      if (price > 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
      if (price > 1) return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
      return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatVolume = (vol: number) => {
    if (vol > 1e9) return `$${(vol / 1e9).toFixed(1)}B`
    if (vol > 1e6) return `$${(vol / 1e6).toFixed(1)}M`
    if (vol > 1e3) return `$${(vol / 1e3).toFixed(1)}K`
    return `$${vol}`
  }

  const MarketCard = ({ item, type }: { item: MarketItem; type: string }) => {
    const isPositive = item.changePercent >= 0
    const chartData = generateSparkline(item.price, item.changePercent)

    return (
      <div className="glass rounded-xl p-4 hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">{item.symbol}</span>
              {item.name && <span className="text-gray-500 text-xs">{item.name}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <Badge className={`${isPositive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} text-xs`}>
              {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
            </Badge>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-white mb-1">
              {formatPrice(item.price, type)}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                {isPositive ? '+' : ''}{item.change.toFixed(type === 'forex' ? 4 : 2)}
              </span>
              {item.volume && (
                <span className="text-gray-500">
                  Vol: {formatVolume(item.volume)}
                </span>
              )}
            </div>
          </div>
          <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isPositive ? '#4ade80' : '#f87171'} 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Live Market Data</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
              <Badge className={`${dataSource === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'} text-[10px] px-1.5`}>
                {dataSource === 'live' ? 'LIVE' : 'CACHED'}
              </Badge>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchMarketData} 
          disabled={loading} 
          className="glass-button rounded-xl px-4 py-2 flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Market Tabs */}
      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="glass rounded-xl p-1 mb-4">
          {tabConfig.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg px-4"
            >
              <tab.icon className={`h-4 w-4 mr-2 ${tab.color}`} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            {loading && markets[tab.id as keyof typeof markets].length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glass rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-700/50 rounded w-20 mb-3"></div>
                    <div className="h-8 bg-gray-700/50 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : markets[tab.id as keyof typeof markets].length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {markets[tab.id as keyof typeof markets].map((item, idx) => (
                  <MarketCard key={`${item.symbol}-${idx}`} item={item} type={tab.id} />
                ))}
              </div>
            ) : (
              <div className="glass rounded-xl p-8 text-center text-gray-400">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No {tab.label} data available</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span>Auto-refresh every 30 seconds • Data from CoinGecko & ExchangeRate-API</span>
      </div>
    </div>
  )
}
