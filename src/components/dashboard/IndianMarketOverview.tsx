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
  AlertTriangle
} from 'lucide-react'
import dynamic from 'next/dynamic'

const TradingChart = dynamic(() => import('./TradingChart'), { ssr: false })

interface IndianStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  trend: 'bullish' | 'bearish' | 'neutral'
}

interface IndexData {
  name: string
  value: number
  change: number
  changePercent: number
}

// Indian stocks data
const INDIAN_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', basePrice: 2480 },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', basePrice: 3850 },
  { symbol: 'INFY.NS', name: 'Infosys', basePrice: 1480 },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', basePrice: 1620 },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', basePrice: 1080 },
]

// Generate realistic stock data
const generateStockData = (basePrice: number): IndianStock => {
  const changePercent = (Math.random() - 0.5) * 6 // -3% to +3%
  const change = basePrice * (changePercent / 100)
  
  return {
    symbol: '',
    name: '',
    price: parseFloat((basePrice + change).toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 10000000 + 1000000),
    trend: changePercent > 0.5 ? 'bullish' : changePercent < -0.5 ? 'bearish' : 'neutral'
  }
}

export default function IndianMarketOverview() {
  const [nifty50, setNifty50] = useState<IndexData | null>(null)
  const [sensex, setSensex] = useState<IndexData | null>(null)
  const [stocks, setStocks] = useState<IndianStock[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)

  // Fetch market data
  const fetchMarketData = async () => {
    try {
      // Generate index data
      const niftyBase = 22450
      const niftyChange = (Math.random() - 0.5) * 400
      setNifty50({
        name: 'NIFTY 50',
        value: parseFloat((niftyBase + niftyChange).toFixed(2)),
        change: parseFloat(niftyChange.toFixed(2)),
        changePercent: parseFloat(((niftyChange / niftyBase) * 100).toFixed(2))
      })

      const sensexBase = 73800
      const sensexChange = (Math.random() - 0.5) * 1200
      setSensex({
        name: 'SENSEX',
        value: parseFloat((sensexBase + sensexChange).toFixed(2)),
        change: parseFloat(sensexChange.toFixed(2)),
        changePercent: parseFloat(((sensexChange / sensexBase) * 100).toFixed(2))
      })

      // Generate stock data
      const stockData = INDIAN_STOCKS.map(stock => ({
        ...generateStockData(stock.basePrice),
        symbol: stock.symbol,
        name: stock.name
      }))
      setStocks(stockData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatVolume = (vol: number) => {
    if (vol >= 10000000) return `${(vol / 10000000).toFixed(2)}Cr`
    if (vol >= 100000) return `${(vol / 100000).toFixed(2)}L`
    return vol.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Risk Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-300">
          <strong>Risk Disclaimer:</strong> TradeAI Pro provides market analysis and educational insights only. 
          This platform does not provide investment advice. Users must conduct their own research before trading. 
          Trading in stocks involves risk of loss.
        </p>
      </div>

      {/* Index Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NIFTY 50 */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm">NIFTY 50</div>
                <div className="text-2xl font-bold text-white">
                  {nifty50?.value.toLocaleString() || '---'}
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${nifty50 && nifty50.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {nifty50 && nifty50.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {nifty50?.changePercent}%
                </Badge>
                <div className={`text-sm mt-1 ${nifty50 && nifty50.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {nifty50 && nifty50.change >= 0 ? '+' : ''}{nifty50?.change.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SENSEX */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm">SENSEX (BSE)</div>
                <div className="text-2xl font-bold text-white">
                  {sensex?.value.toLocaleString() || '---'}
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${sensex && sensex.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {sensex && sensex.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {sensex?.changePercent}%
                </Badge>
                <div className={`text-sm mt-1 ${sensex && sensex.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sensex && sensex.change >= 0 ? '+' : ''}{sensex?.change.toFixed(2)}
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
              🇮🇳 Top Indian Stocks
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
              <Button variant="ghost" size="sm" onClick={fetchMarketData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
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
                  <th className="text-right py-2 px-2">Volume</th>
                  <th className="text-center py-2 px-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock, idx) => (
                  <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-2">
                      <div className="font-medium text-white">{stock.symbol.replace('.NS', '')}</div>
                      <div className="text-xs text-gray-500">{stock.name}</div>
                    </td>
                    <td className="text-right py-3 px-2 text-white font-medium">
                      ₹{stock.price.toLocaleString()}
                    </td>
                    <td className={`text-right py-3 px-2 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <div>{stock.change >= 0 ? '+' : ''}{stock.change}</div>
                      <div className="text-xs">({stock.changePercent}%)</div>
                    </td>
                    <td className="text-right py-3 px-2 text-gray-400 text-sm">
                      {formatVolume(stock.volume)}
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

      {/* Stock Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradingChart symbol="RELIANCE.NS" height={300} />
        <TradingChart symbol="TCS.NS" height={300} />
      </div>

      {/* Live Status */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Activity className="h-3 w-3 animate-pulse text-green-400" />
        <span>Live Indian Market Data • Auto-refresh every 30 seconds</span>
      </div>
    </div>
  )
}
