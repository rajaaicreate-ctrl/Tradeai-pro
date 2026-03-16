'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  TrendingUp, TrendingDown, DollarSign, Bitcoin, Coins, BarChart3, RefreshCw,
  CandlestickChart, LineChart as LineChartIcon, Activity, Star, StarOff,
  Bell, BellOff, Search, Maximize2, Minimize2, Zap, X, Eye, EyeOff, Loader2
} from 'lucide-react'
import { createChart, ColorType, CandlestickSeries, LineSeries, AreaSeries, HistogramSeries } from 'lightweight-charts'

// Types
interface WatchlistItem {
  symbol: string
  name: string
  basePrice: number
  category: string
  addedAt: number
}

interface PriceAlert {
  id: string
  symbol: string
  targetPrice: number
  condition: 'above' | 'below'
  active: boolean
  createdAt: number
}

// Symbol configurations
const ALL_PAIRS = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', basePrice: 1.0892, category: 'forex' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', basePrice: 1.2654, category: 'forex' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', basePrice: 149.85, category: 'forex' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', basePrice: 0.6550, category: 'forex' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', basePrice: 1.3580, category: 'forex' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', basePrice: 0.8750, category: 'forex' },
  { symbol: 'BTC/USD', name: 'Bitcoin', basePrice: 94500, category: 'crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum', basePrice: 3450, category: 'crypto' },
  { symbol: 'BNB/USD', name: 'BNB', basePrice: 580, category: 'crypto' },
  { symbol: 'SOL/USD', name: 'Solana', basePrice: 175, category: 'crypto' },
  { symbol: 'XRP/USD', name: 'XRP', basePrice: 2.35, category: 'crypto' },
  { symbol: 'XAU/USD', name: 'Gold', basePrice: 2350, category: 'commodity' },
  { symbol: 'XAG/USD', name: 'Silver', basePrice: 27.80, category: 'commodity' },
  { symbol: 'NIFTY', name: 'NIFTY 50', basePrice: 22500, category: 'index' },
  { symbol: 'SENSEX', name: 'BSE SENSEX', basePrice: 74000, category: 'index' },
]

const TIMEFRAMES = [
  { id: '1H', label: '1H', candles: 24 },
  { id: '4H', label: '4H', candles: 48 },
  { id: '1D', label: '1D', candles: 90 },
  { id: '1W', label: '1W', candles: 52 },
]

// Generate candle data
function generateCandleData(basePrice: number, candles: number = 90) {
  const data = []
  const volumeData = []
  let currentPrice = basePrice
  const now = new Date()
  
  for (let i = candles; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const volatility = 0.02
    const trend = Math.sin(i / 10) * 0.01
    const noise = (Math.random() - 0.5) * volatility
    
    const open = currentPrice
    const change = currentPrice * (trend + noise)
    const close = currentPrice + change
    
    const highExtra = Math.abs(Math.random() * volatility * currentPrice)
    const lowExtra = Math.abs(Math.random() * volatility * currentPrice)
    
    const high = Math.max(open, close) + highExtra
    const low = Math.min(open, close) - lowExtra
    
    data.push({
      time: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(basePrice > 100 ? 2 : 4)),
      high: parseFloat(high.toFixed(basePrice > 100 ? 2 : 4)),
      low: parseFloat(low.toFixed(basePrice > 100 ? 2 : 4)),
      close: parseFloat(close.toFixed(basePrice > 100 ? 2 : 4)),
    })
    
    volumeData.push({
      time: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 1000000 + 500000),
      color: close >= open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
    })
    
    currentPrice = close
  }
  
  return { candleData: data, volumeData }
}

// Calculate SMA
function calculateSMA(data: any[], period: number) {
  const sma = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) sum += data[i - j].close
    sma.push({ time: data[i].time, value: sum / period })
  }
  return sma
}

// Calculate Bollinger Bands
function calculateBollingerBands(data: any[], period: number = 20) {
  const upper = []
  const lower = []
  const middle = []
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const sma = slice.reduce((a, b) => a + b.close, 0) / period
    const variance = slice.reduce((a, b) => a + Math.pow(b.close - sma, 2), 0) / period
    const std = Math.sqrt(variance)
    
    middle.push({ time: data[i].time, value: sma })
    upper.push({ time: data[i].time, value: sma + 2 * std })
    lower.push({ time: data[i].time, value: sma - 2 * std })
  }
  
  return { upper, middle, lower }
}

// Price Ticker Component
function PriceTicker({ pairs }: { pairs: typeof ALL_PAIRS }) {
  return (
    <div className="overflow-hidden bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 border-y border-white/[0.06]">
      <div className="flex items-center gap-6 py-3 px-4 overflow-x-auto">
        {pairs.map((item, idx) => {
          const changePercent = (Math.random() - 0.5) * 2
          const isPositive = changePercent >= 0
          return (
            <div key={idx} className="flex items-center gap-3 whitespace-nowrap min-w-fit">
              <span className="text-white font-medium">{item.symbol}</span>
              <span className="text-gray-300 font-mono">
                {item.basePrice > 100 ? item.basePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : item.basePrice.toFixed(4)}
              </span>
              <span className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Market Stats Panel
function MarketStatsPanel({ symbol, basePrice }: { symbol: string; basePrice: number }) {
  const stats = useMemo(() => {
    const high24h = basePrice * 1.025
    const low24h = basePrice * 0.975
    const volume = Math.floor(Math.random() * 50000000 + 10000000)
    const bid = basePrice * 0.9999
    const ask = basePrice * 1.0001
    const spread = ((ask - bid) / basePrice * 100).toFixed(3)
    return { high24h, low24h, volume, bid, ask, spread }
  }, [basePrice])

  return (
    <Card className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08]">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">24h High</div>
            <div className="text-green-400 font-bold">{basePrice > 100 ? stats.high24h.toLocaleString(undefined, {maximumFractionDigits: 0}) : stats.high24h.toFixed(4)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">24h Low</div>
            <div className="text-red-400 font-bold">{basePrice > 100 ? stats.low24h.toLocaleString(undefined, {maximumFractionDigits: 0}) : stats.low24h.toFixed(4)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">24h Volume</div>
            <div className="text-white font-bold">${(stats.volume / 1000000).toFixed(1)}M</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">Bid</div>
            <div className="text-green-400 font-bold">{basePrice > 100 ? stats.bid.toFixed(2) : stats.bid.toFixed(4)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">Ask</div>
            <div className="text-red-400 font-bold">{basePrice > 100 ? stats.ask.toFixed(2) : stats.ask.toFixed(4)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">Spread</div>
            <div className="text-amber-400 font-bold">{stats.spread}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Watchlist Component
function WatchlistPanel({ watchlist, onRemove, onSelect, selectedSymbol }: { 
  watchlist: WatchlistItem[]; onRemove: (symbol: string) => void; onSelect: (item: WatchlistItem) => void; selectedSymbol: string 
}) {
  if (watchlist.length === 0) {
    return (
      <Card className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-yellow-400" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <StarOff className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No items in watchlist</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08]">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-yellow-400" />
          Watchlist ({watchlist.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[150px]">
          {watchlist.map((item) => (
            <div key={item.symbol}
              className={`flex items-center justify-between p-3 border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer ${selectedSymbol === item.symbol ? 'bg-purple-500/10' : ''}`}
              onClick={() => onSelect(item)}>
              <div>
                <p className="text-white font-medium text-sm">{item.symbol}</p>
                <p className="text-gray-500 text-xs">{item.name}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-yellow-400" onClick={(e) => { e.stopPropagation(); onRemove(item.symbol) }}>
                <Star className="h-3 w-3 fill-current" />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Price Alerts Component
function PriceAlertsPanel({ alerts, currentPrice, onRemove, onToggle }: {
  alerts: PriceAlert[]; currentPrice: number; onRemove: (id: string) => void; onToggle: (id: string) => void
}) {
  return (
    <Card className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08]">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Bell className="h-4 w-4 text-cyan-400" />
          Price Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <BellOff className="h-6 w-6 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-xs">No alerts set</p>
          </div>
        ) : (
          <ScrollArea className="h-[100px]">
            {alerts.map((alert) => {
              const distance = ((alert.targetPrice - currentPrice) / currentPrice * 100).toFixed(2)
              return (
                <div key={alert.id} className="flex items-center justify-between p-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    {alert.condition === 'above' ? <TrendingUp className="h-4 w-4 text-green-400" /> : <TrendingDown className="h-4 w-4 text-red-400" />}
                    <div>
                      <p className="text-white text-sm">{alert.targetPrice.toLocaleString()}</p>
                      <p className="text-gray-500 text-xs">{distance}% away</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className={`h-6 w-6 ${alert.active ? 'text-cyan-400' : 'text-gray-500'}`} onClick={() => onToggle(alert.id)}>
                      {alert.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => onRemove(alert.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

// Quick Trade Panel
function QuickTradePanel({ symbol, basePrice, onTrade, onClose }: { 
  symbol: string; basePrice: number; onTrade: (type: 'buy' | 'sell', amount: number, price: number) => void; onClose?: () => void 
}) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  
  const position = parseFloat(amount) || 0
  const total = position * basePrice
  const suggestedPosition = basePrice > 0 ? (10000 * 0.02) / basePrice : 0

  return (
    <Card className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-amber-400" />
            Quick Trade - {symbol}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Button className={`flex-1 ${tradeType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`} onClick={() => setTradeType('buy')}>
            <TrendingUp className="h-4 w-4 mr-1" /> Buy
          </Button>
          <Button className={`flex-1 ${tradeType === 'sell' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`} onClick={() => setTradeType('sell')}>
            <TrendingDown className="h-4 w-4 mr-1" /> Sell
          </Button>
        </div>
        <div className="relative">
          <Input type="number" placeholder="Position Size" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-gray-800/50 border-gray-700 text-white pr-16" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">units</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs border-gray-700" onClick={() => setAmount((suggestedPosition * 0.25).toFixed(2))}>25%</Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs border-gray-700" onClick={() => setAmount((suggestedPosition * 0.5).toFixed(2))}>50%</Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs border-gray-700" onClick={() => setAmount(suggestedPosition.toFixed(2))}>100%</Button>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Price</span>
            <span className="text-white font-mono">{basePrice > 100 ? basePrice.toLocaleString() : basePrice.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total</span>
            <span className="text-white font-mono">${total.toFixed(2)}</span>
          </div>
        </div>
        <Button className={`w-full ${tradeType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
          disabled={!amount || parseFloat(amount) <= 0} onClick={() => onTrade(tradeType, position, basePrice)}>
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {symbol.split('/')[0]}
        </Button>
      </CardContent>
    </Card>
  )
}

// Main Chart Component
function MainChart({ symbol, basePrice, timeframe, height = 400, isFullscreen, onToggleFullscreen }: { 
  symbol: string; basePrice: number; timeframe: string; height?: number; isFullscreen: boolean; onToggleFullscreen: () => void 
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick')
  const [showVolume, setShowVolume] = useState(true)
  const [showSMA20, setShowSMA20] = useState(false)
  const [showSMA50, setShowSMA50] = useState(false)
  const [showBB, setShowBB] = useState(false)

  // Generate data
  const { candleData, volumeData } = useMemo(() => {
    const candleCount = timeframe === '1H' ? 24 : timeframe === '4H' ? 48 : timeframe === '1W' ? 52 : 90
    return generateCandleData(basePrice, candleCount)
  }, [basePrice, timeframe])

  // Create chart
  useEffect(() => {
    const container = chartContainerRef.current
    if (!container || candleData.length === 0) return

    // Clear existing chart
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    // Retry until container has width
    const createChartWhenReady = () => {
      if (!container) return
      
      const containerWidth = container.clientWidth
      if (containerWidth === 0) {
        requestAnimationFrame(createChartWhenReady)
        return
      }

      const chartHeight = showVolume ? height : height + 80
      
      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: isFullscreen ? '#0a0a12' : '#1a1a2e' },
          textColor: '#d1d5db',
        },
        grid: { vertLines: { color: '#2d2d44' }, horzLines: { color: '#2d2d44' } },
        crosshair: { mode: 1, vertLine: { color: '#6366f1', width: 1, style: 2 }, horzLine: { color: '#6366f1', width: 1, style: 2 } },
        rightPriceScale: { borderColor: '#2d2d44' },
        timeScale: { borderColor: '#2d2d44', timeVisible: true },
        width: containerWidth,
        height: chartHeight,
      })

      chartRef.current = chart

      let mainSeries: any
      if (chartType === 'candlestick') {
        mainSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#22c55e', downColor: '#ef4444', borderDownColor: '#ef4444', borderUpColor: '#22c55e',
          wickDownColor: '#ef4444', wickUpColor: '#22c55e',
        })
      } else if (chartType === 'line') {
        mainSeries = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2 })
      } else {
        mainSeries = chart.addSeries(AreaSeries, {
          topColor: 'rgba(139, 92, 246, 0.4)', bottomColor: 'rgba(139, 92, 246, 0.0)',
          lineColor: '#8b5cf6', lineWidth: 2,
        })
      }
      mainSeries.setData(candleData)

      if (showVolume) {
        const volumeSeries = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: '' })
        volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } })
        volumeSeries.setData(volumeData)
      }

      if (showSMA20) {
        const sma20 = calculateSMA(candleData, 20)
        const sma20Series = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1 })
        sma20Series.setData(sma20)
      }

      if (showSMA50) {
        const sma50 = calculateSMA(candleData, 50)
        const sma50Series = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1 })
        sma50Series.setData(sma50)
      }

      if (showBB) {
        const bbData = calculateBollingerBands(candleData)
        const upperSeries = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 1, lineStyle: 2 })
        const lowerSeries = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 1, lineStyle: 2 })
        const middleSeries = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 1 })
        upperSeries.setData(bbData.upper)
        lowerSeries.setData(bbData.lower)
        middleSeries.setData(bbData.middle)
      }

      chart.timeScale().fitContent()
    }

    createChartWhenReady()

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [candleData, volumeData, chartType, showVolume, showSMA20, showSMA50, showBB, height, isFullscreen])

  const lastCandle = candleData[candleData.length - 1]
  const prevCandle = candleData[candleData.length - 2]
  const priceChange = lastCandle && prevCandle ? lastCandle.close - prevCandle.close : 0
  const percentChange = lastCandle && prevCandle ? ((priceChange / prevCandle.close) * 100).toFixed(2) : '0'
  const isPositive = parseFloat(percentChange) >= 0

  return (
    <Card className={`backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <CandlestickChart className="h-5 w-5 text-purple-400" />
              {symbol}
            </CardTitle>
            {lastCandle && (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">
                  {basePrice > 100 ? lastCandle.close.toLocaleString() : lastCandle.close.toFixed(4)}
                </span>
                <Badge className={`${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {isPositive ? '+' : ''}{percentChange}%
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-white/[0.05] rounded-lg p-1 border border-white/[0.06]">
              <Button size="sm" variant={chartType === 'candlestick' ? 'default' : 'ghost'} onClick={() => setChartType('candlestick')} className={chartType === 'candlestick' ? 'bg-purple-500 text-white' : 'text-gray-400'}>
                <CandlestickChart className="h-4 w-4" />
              </Button>
              <Button size="sm" variant={chartType === 'line' ? 'default' : 'ghost'} onClick={() => setChartType('line')} className={chartType === 'line' ? 'bg-purple-500 text-white' : 'text-gray-400'}>
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button size="sm" variant={chartType === 'area' ? 'default' : 'ghost'} onClick={() => setChartType('area')} className={chartType === 'area' ? 'bg-purple-500 text-white' : 'text-gray-400'}>
                <Activity className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <Button size="sm" variant={showVolume ? 'default' : 'ghost'} onClick={() => setShowVolume(!showVolume)} className={showVolume ? 'bg-cyan-500 text-white text-xs' : 'text-gray-400 text-xs'}>Vol</Button>
              <Button size="sm" variant={showSMA20 ? 'default' : 'ghost'} onClick={() => setShowSMA20(!showSMA20)} className={showSMA20 ? 'bg-amber-500 text-white text-xs' : 'text-gray-400 text-xs'}>SMA20</Button>
              <Button size="sm" variant={showSMA50 ? 'default' : 'ghost'} onClick={() => setShowSMA50(!showSMA50)} className={showSMA50 ? 'bg-blue-500 text-white text-xs' : 'text-gray-400 text-xs'}>SMA50</Button>
              <Button size="sm" variant={showBB ? 'default' : 'ghost'} onClick={() => setShowBB(!showBB)} className={showBB ? 'bg-cyan-500 text-white text-xs' : 'text-gray-400 text-xs'}>BB</Button>
            </div>

            <Button size="sm" variant="ghost" onClick={onToggleFullscreen} className="text-gray-400">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" style={{ minHeight: height, height: height }} />
        {lastCandle && (
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/[0.06]">
            <div className="text-center">
              <div className="text-gray-400 text-xs">Open</div>
              <div className="text-white font-medium">{lastCandle.open}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">High</div>
              <div className="text-green-400 font-medium">{lastCandle.high}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">Low</div>
              <div className="text-red-400 font-medium">{lastCandle.low}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">Close</div>
              <div className="text-white font-medium">{lastCandle.close}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Mini Chart Component
function MiniChart({ basePrice, height = 80 }: { basePrice: number; height?: number }) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  
  const priceData = useMemo(() => {
    return generateCandleData(basePrice, 30).candleData.map(d => ({ time: d.time, value: d.close }))
  }, [basePrice])

  useEffect(() => {
    if (!chartContainerRef.current || priceData.length === 0) return

    const container = chartContainerRef.current
    
    const createChartNow = () => {
      if (!container) return
      const rect = container.getBoundingClientRect()
      if (rect.width === 0) {
        requestAnimationFrame(createChartNow)
        return
      }

      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }

      const chart = createChart(container, {
        layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#d1d5db' },
        grid: { vertLines: { visible: false }, horzLines: { visible: false } },
        rightPriceScale: { visible: false },
        timeScale: { visible: false },
        width: rect.width,
        height: height,
      })

      chartRef.current = chart
      const lineSeries = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2 })
      lineSeries.setData(priceData)
      chart.timeScale().fitContent()
    }

    createChartNow()

    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [priceData, height])

  return <div ref={chartContainerRef} className="w-full rounded-lg bg-white/[0.02]" style={{ minHeight: height, height: height }} />
}

// Main Markets Page Component
export default function MarketsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState(ALL_PAIRS[0])
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showQuickTrade, setShowQuickTrade] = useState(false)

  // Load watchlist and alerts from localStorage
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem('tradeai_watchlist')
      const savedAlerts = localStorage.getItem('tradeai_alerts')
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist))
      if (savedAlerts) setAlerts(JSON.parse(savedAlerts))
    } catch (e) {}
  }, [])

  useEffect(() => { localStorage.setItem('tradeai_watchlist', JSON.stringify(watchlist)) }, [watchlist])
  useEffect(() => { localStorage.setItem('tradeai_alerts', JSON.stringify(alerts)) }, [alerts])

  // Filter pairs
  const filteredPairs = useMemo(() => {
    let pairs = activeCategory === 'all' ? ALL_PAIRS : ALL_PAIRS.filter(p => p.category === activeCategory)
    if (searchQuery) {
      pairs = pairs.filter(p => 
        p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return pairs
  }, [activeCategory, searchQuery])

  const isInWatchlist = useCallback((symbol: string) => watchlist.some(item => item.symbol === symbol), [watchlist])

  const toggleWatchlist = useCallback((pair: typeof ALL_PAIRS[0]) => {
    if (isInWatchlist(pair.symbol)) {
      setWatchlist(prev => prev.filter(item => item.symbol !== pair.symbol))
    } else {
      setWatchlist(prev => [...prev, { symbol: pair.symbol, name: pair.name, basePrice: pair.basePrice, category: pair.category, addedAt: Date.now() }])
    }
  }, [isInWatchlist])

  const handleTrade = useCallback((type: 'buy' | 'sell', amount: number, price: number) => {
    alert(`Demo ${type.toUpperCase()} Order:\n${amount} ${selectedSymbol.symbol} @ ${price}\nTotal: $${(amount * price).toFixed(2)}`)
  }, [selectedSymbol])

  const categories = [
    { id: 'all', label: 'All', icon: BarChart3 },
    { id: 'forex', label: 'Forex', icon: DollarSign },
    { id: 'crypto', label: 'Crypto', icon: Bitcoin },
    { id: 'commodity', label: 'Gold', icon: Coins },
    { id: 'index', label: 'Indices', icon: BarChart3 },
  ]

  return (
    <div className="space-y-6">
      <PriceTicker pairs={ALL_PAIRS} />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search symbols..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/[0.03] border-white/[0.08] text-white placeholder-gray-500" />
      </div>

      {/* Category Tabs & Timeframe */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button key={cat.id} variant={activeCategory === cat.id ? 'default' : 'ghost'}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 whitespace-nowrap ${activeCategory === cat.id ? 'bg-purple-500 text-white' : 'text-gray-400'}`}>
            <cat.icon className="h-4 w-4" /> {cat.label}
          </Button>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          {TIMEFRAMES.map(tf => (
            <Button key={tf.id} size="sm" variant={selectedTimeframe === tf.id ? 'default' : 'ghost'}
              onClick={() => setSelectedTimeframe(tf.id)}
              className={selectedTimeframe === tf.id ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:bg-white/10'}>
              {tf.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Symbol Selector */}
          <Card className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08]">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Select Symbol</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                {filteredPairs.map(pair => (
                  <div key={pair.symbol}
                    className={`flex items-center justify-between p-3 border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer group ${selectedSymbol.symbol === pair.symbol ? 'bg-purple-500/10' : ''}`}
                    onClick={() => setSelectedSymbol(pair)}>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{pair.symbol}</span>
                      <span className="text-gray-500 text-xs">{pair.name}</span>
                    </div>
                    <Button variant="ghost" size="icon"
                      className={`h-6 w-6 ${isInWatchlist(pair.symbol) ? 'text-yellow-400' : 'text-gray-500 opacity-0 group-hover:opacity-100'}`}
                      onClick={(e) => { e.stopPropagation(); toggleWatchlist(pair) }}>
                      <Star className={`h-3 w-3 ${isInWatchlist(pair.symbol) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          <WatchlistPanel watchlist={watchlist} onRemove={(symbol) => setWatchlist(prev => prev.filter(item => item.symbol !== symbol))}
            onSelect={(item) => setSelectedSymbol(item)} selectedSymbol={selectedSymbol.symbol} />

          <PriceAlertsPanel alerts={alerts.filter(a => a.symbol === selectedSymbol.symbol)} currentPrice={selectedSymbol.basePrice}
            onRemove={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
            onToggle={(id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))} />
        </div>

        {/* Main Chart Area */}
        <div className="lg:col-span-3 space-y-6">
          <MarketStatsPanel symbol={selectedSymbol.symbol} basePrice={selectedSymbol.basePrice} />
          
          <MainChart key={selectedSymbol.symbol} symbol={selectedSymbol.symbol} basePrice={selectedSymbol.basePrice}
            timeframe={selectedTimeframe} height={400} isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)} />
          
          {/* More Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPairs.slice(1, 7).map(pair => (
              <Card key={pair.symbol}
                className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all cursor-pointer group relative"
                onClick={() => setSelectedSymbol(pair)}>
                <div className="absolute top-2 right-2 z-10">
                  <Button variant="ghost" size="icon"
                    className={`h-6 w-6 ${isInWatchlist(pair.symbol) ? 'text-yellow-400' : 'text-gray-500 opacity-0 group-hover:opacity-100'}`}
                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(pair) }}>
                    <Star className={`h-3 w-3 ${isInWatchlist(pair.symbol) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">{pair.symbol}</CardTitle>
                    <span className="text-xs text-gray-400">{pair.name}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <MiniChart basePrice={pair.basePrice} height={80} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Trade Floating Button */}
      <Button className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
        onClick={() => setShowQuickTrade(true)}>
        <Zap className="h-6 w-6 text-white" />
      </Button>

      {/* Quick Trade Modal */}
      {showQuickTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQuickTrade(false)} />
          <div className="relative z-10 w-full max-w-sm">
            <QuickTradePanel symbol={selectedSymbol.symbol} basePrice={selectedSymbol.basePrice}
              onTrade={(type, amount, price) => { handleTrade(type, amount, price); setShowQuickTrade(false) }}
              onClose={() => setShowQuickTrade(false)} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pb-8">
        <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Auto-refresh every 30 seconds</span>
        <span>•</span>
        <span>Data from CoinGecko & ExchangeRate-API</span>
      </div>
    </div>
  )
}
