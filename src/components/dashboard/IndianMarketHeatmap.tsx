'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  RefreshCw
} from 'lucide-react'

interface SectorData {
  name: string
  change: number
  stocks: {
    symbol: string
    change: number
    marketCap: string
  }[]
}

const SECTORS = [
  {
    name: 'Banking',
    stocks: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'AXISBANK', 'KOTAKBANK', 'BAJFINANCE']
  },
  {
    name: 'IT',
    stocks: ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM', 'LTIM']
  },
  {
    name: 'Energy',
    stocks: ['RELIANCE', 'ONGC', 'POWERGRID', 'NTPC', 'BPCL', 'IOC']
  },
  {
    name: 'FMCG',
    stocks: ['ITC', 'HINDUNILVR', 'BRITANNIA', 'NESTLEIND', 'DABUR', 'GODREJCP']
  },
  {
    name: 'Pharma',
    stocks: ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB', 'LUPIN', 'BIOCON']
  },
  {
    name: 'Auto',
    stocks: ['MARUTI', 'TATAMOTORS', 'M&M', 'BAJAJ-AUTO', 'HEROMOTOCO', 'EICHERMOT']
  },
  {
    name: 'Metals',
    stocks: ['TATASTEEL', 'HINDALCO', 'JSWSTEEL', 'COALINDIA', 'VEDL', 'ADANIENT']
  },
  {
    name: 'Realty',
    stocks: ['DLF', 'GODREJPROP', 'BRIGADE', 'PRESTIGE', 'OBEROIRLTY', 'SOBHA']
  },
]

// Generate realistic sector data
const generateSectorData = (): SectorData[] => {
  return SECTORS.map(sector => {
    // Generate overall sector change
    const sectorChange = (Math.random() - 0.45) * 4 // Slight bullish bias
    
    const stocks = sector.stocks.map(symbol => ({
      symbol,
      change: (Math.random() - 0.45) * 6, // Individual stock change
      marketCap: `${(Math.random() * 10 + 0.5).toFixed(1)}L Cr`
    }))
    
    return {
      name: sector.name,
      change: sectorChange,
      stocks
    }
  })
}

export default function IndianMarketHeatmap() {
  const [sectors, setSectors] = useState<SectorData[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const updateData = () => {
    setSectors(generateSectorData())
    setLastUpdate(new Date())
  }

  useEffect(() => {
    updateData()
    const interval = setInterval(updateData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getHeatmapColor = (change: number) => {
    if (change >= 2) return 'bg-green-500/80'
    if (change >= 1) return 'bg-green-600/60'
    if (change >= 0.5) return 'bg-green-700/40'
    if (change > 0) return 'bg-green-800/30'
    if (change === 0) return 'bg-gray-700/50'
    if (change > -0.5) return 'bg-red-800/30'
    if (change > -1) return 'bg-red-700/40'
    if (change > -2) return 'bg-red-600/60'
    return 'bg-red-500/80'
  }

  const getTextColor = (change: number) => {
    if (change >= 1) return 'text-white'
    if (change <= -1) return 'text-white'
    return 'text-gray-200'
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-400" />
            🗺️ Indian Market Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
            <button onClick={updateData} className="p-1 hover:bg-gray-800 rounded">
              <RefreshCw className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Sector Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {sectors.map((sector, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg ${getHeatmapColor(sector.change)} transition-all duration-500`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium ${getTextColor(sector.change)}`}>
                  {sector.name}
                </span>
                {sector.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-white" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-white" />
                )}
              </div>
              <div className={`text-xl font-bold ${getTextColor(sector.change)}`}>
                {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Stock Heatmap */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-400">Sector-wise Stock Performance</h4>
          
          {sectors.map((sector, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white w-20">{sector.name}</span>
                <Badge className={`${sector.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {sector.stocks.map((stock, sidx) => (
                  <div
                    key={sidx}
                    className={`px-3 py-2 rounded ${getHeatmapColor(stock.change)} cursor-pointer hover:scale-105 transition-transform`}
                    title={`${stock.symbol}: ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}% • MCAP: ${stock.marketCap}`}
                  >
                    <div className={`text-xs font-medium ${getTextColor(stock.change)}`}>
                      {stock.symbol}
                    </div>
                    <div className={`text-xs ${getTextColor(stock.change)}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-500/80"></div>
            <span className="text-xs text-gray-500">Strong Bullish (+2%+)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-700/40"></div>
            <span className="text-xs text-gray-500">Bullish</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-700/50"></div>
            <span className="text-xs text-gray-500">Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-red-700/40"></div>
            <span className="text-xs text-gray-500">Bearish</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-red-500/80"></div>
            <span className="text-xs text-gray-500">Strong Bearish (-2%+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
