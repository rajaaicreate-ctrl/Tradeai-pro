'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Coins, BarChart3, RefreshCw } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
}

interface MarketsResponse {
  success: boolean
  data: {
    forex: MarketData[]
    crypto: MarketData[]
    commodities: MarketData[]
    indices: MarketData[]
  }
}

const marketConfig = {
  forex: { icon: DollarSign, label: 'Forex', color: 'text-blue-400' },
  crypto: { icon: Bitcoin, label: 'Crypto', color: 'text-orange-400' },
  gold: { icon: Coins, label: 'Gold', color: 'text-yellow-400' },
  stocks: { icon: BarChart3, label: 'Stocks', color: 'text-green-400' }
}

export default function MarketOverview() {
  const [markets, setMarkets] = useState<{ [key: string]: MarketData | null }>({
    forex: null,
    crypto: null,
    gold: null,
    stocks: null
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market-data')
      const result: MarketsResponse = await response.json()
      if (result.success && result.data) {
        // Map API arrays to single objects
        setMarkets({
          forex: result.data.forex?.[0] || null,
          crypto: result.data.crypto?.[0] || null,
          gold: result.data.commodities?.[0] || null,
          stocks: result.data.indices?.[0] || null
        })
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

  const generateSparkline = (basePrice: number) => {
    const data = []
    let price = basePrice * 0.98
    for (let i = 0; i < 20; i++) {
      price += (Math.random() - 0.48) * basePrice * 0.005
      data.push({ value: price })
    }
    data.push({ value: basePrice })
    return data
  }

  const formatPrice = (price: number, type: string) => {
    if (type === 'forex') return price.toFixed(4)
    if (type === 'crypto') return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Global Market Overview</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <button onClick={fetchMarketData} disabled={loading} className="p-1 hover:bg-gray-800 rounded">
            <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(marketConfig).map(([key, config]) => {
          const market = markets[key]
          const Icon = config.icon
          const isPositive = market ? market.change >= 0 : false
          const chartData = market ? generateSparkline(market.price) : []

          return (
            <Card key={key} className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">{config.label}</CardTitle>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </CardHeader>
              <CardContent>
                {loading && !market ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : market ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{market.symbol}</p>
                      <div className="text-2xl font-bold text-white">
                        {formatPrice(market.price, key)}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        <Badge className={`${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-xs`}>
                          {isPositive ? '+' : ''}{market.change.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-24 h-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <Line type="monotone" dataKey="value" stroke={isPositive ? '#4ade80' : '#f87171'} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">No data</div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span>Auto-refresh every 30 seconds</span>
      </div>
    </div>
  )
}
