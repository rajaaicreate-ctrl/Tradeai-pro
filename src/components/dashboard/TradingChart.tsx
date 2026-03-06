'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CandlestickChart, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart
} from 'lucide-react'

interface TradingChartProps {
  symbol?: string
  height?: number
}

type ChartType = 'candlestick' | 'line' | 'area'

// Generate realistic OHLCV data
const generateCandleData = (basePrice: number, days: number = 90) => {
  const data = []
  const volumeData = []
  let currentPrice = basePrice
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
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
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
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

// Technical indicators
const calculateSMA = (data: any[], period: number) => {
  const sma = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    sma.push({
      time: data[i].time,
      value: sum / period
    })
  }
  return sma
}

const calculateEMA = (data: any[], period: number) => {
  const ema = []
  const multiplier = 2 / (period + 1)
  
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i].close
  }
  let prevEMA = sum / period
  ema.push({ time: data[period - 1].time, value: prevEMA })
  
  for (let i = period; i < data.length; i++) {
    const currentEMA = (data[i].close - prevEMA) * multiplier + prevEMA
    ema.push({ time: data[i].time, value: currentEMA })
    prevEMA = currentEMA
  }
  
  return ema
}

export default function TradingChart({ symbol = 'EUR/USD', height = 400 }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartType, setChartType] = useState<ChartType>('candlestick')
  const [showVolume, setShowVolume] = useState(true)
  const [showSMA20, setShowSMA20] = useState(false)
  const [showSMA50, setShowSMA50] = useState(false)
  const [showEMA, setShowEMA] = useState(false)
  const [priceData, setPriceData] = useState<any>(null)
  const [chartLoaded, setChartLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getBasePrice = (sym: string) => {
    const prices: Record<string, number> = {
      'EUR/USD': 1.0892,
      'GBP/USD': 1.2654,
      'USD/JPY': 149.85,
      'BTC/USD': 66543,
      'ETH/USD': 3421,
      'XAU/USD': 2342.50,
    }
    return prices[sym] || 100
  }

  // Generate data on mount
  useEffect(() => {
    const data = generateCandleData(getBasePrice(symbol))
    setPriceData(data)
  }, [symbol])

  // Initialize chart when data is ready
  useEffect(() => {
    if (!chartContainerRef.current || !priceData) return

    let chart: any = null

    const initChart = async () => {
      try {
        const lightweightCharts = await import('lightweight-charts')
        const { createChart, ColorType } = lightweightCharts

        // Clear container
        chartContainerRef.current!.innerHTML = ''

        const containerWidth = chartContainerRef.current?.clientWidth || 800
        const chartHeight = showVolume ? height : height + 100

        chart = createChart(chartContainerRef.current!, {
          layout: {
            background: { type: ColorType.Solid, color: '#1a1a2e' },
            textColor: '#d1d5db',
          },
          grid: {
            vertLines: { color: '#2d2d44' },
            horzLines: { color: '#2d2d44' },
          },
          crosshair: {
            mode: 1,
            vertLine: { color: '#6366f1', width: 1, style: 2 },
            horzLine: { color: '#6366f1', width: 1, style: 2 },
          },
          rightPriceScale: { borderColor: '#2d2d44' },
          timeScale: { borderColor: '#2d2d44', timeVisible: true },
          width: containerWidth,
          height: chartHeight,
        })

        // Main series
        let mainSeries: any
        
        if (chartType === 'candlestick') {
          mainSeries = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
          })
        } else if (chartType === 'line') {
          mainSeries = chart.addLineSeries({
            color: '#8b5cf6',
            lineWidth: 2,
          })
        } else {
          mainSeries = chart.addAreaSeries({
            topColor: 'rgba(139, 92, 246, 0.4)',
            bottomColor: 'rgba(139, 92, 246, 0.0)',
            lineColor: '#8b5cf6',
            lineWidth: 2,
          })
        }

        mainSeries.setData(priceData.candleData)

        // Volume
        if (showVolume) {
          const volumeSeries = chart.addHistogramSeries({
            priceFormat: { type: 'volume' },
            priceScaleId: '',
            scaleMargins: { top: 0.8, bottom: 0 },
          })
          volumeSeries.setData(priceData.volumeData)
        }

        // SMA 20
        if (showSMA20) {
          const sma20 = calculateSMA(priceData.candleData, 20)
          const sma20Series = chart.addLineSeries({
            color: '#f59e0b',
            lineWidth: 1,
          })
          sma20Series.setData(sma20)
        }

        // SMA 50
        if (showSMA50) {
          const sma50 = calculateSMA(priceData.candleData, 50)
          const sma50Series = chart.addLineSeries({
            color: '#3b82f6',
            lineWidth: 1,
          })
          sma50Series.setData(sma50)
        }

        // EMA
        if (showEMA) {
          const emaData = calculateEMA(priceData.candleData, 12)
          const emaSeries = chart.addLineSeries({
            color: '#ec4899',
            lineWidth: 1,
          })
          emaSeries.setData(emaData)
        }

        chart.timeScale().fitContent()
        setChartLoaded(true)
        setError(null)

        // Handle resize
        const handleResize = () => {
          if (chartContainerRef.current && chart) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth })
          }
        }
        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
        }
      } catch (err: any) {
        console.error('Chart error:', err)
        setError(err.message || 'Failed to load chart')
        setChartLoaded(false)
      }
    }

    initChart()

    return () => {
      if (chart) {
        chart.remove()
        chart = null
      }
    }
  }, [priceData, chartType, showVolume, showSMA20, showSMA50, showEMA, height])

  const lastCandle = priceData?.candleData?.[priceData.candleData.length - 1]
  const prevCandle = priceData?.candleData?.[priceData.candleData.length - 2]
  const priceChange = lastCandle && prevCandle ? lastCandle.close - prevCandle.close : 0
  const percentChange = lastCandle && prevCandle ? ((priceChange / prevCandle.close) * 100).toFixed(2) : '0'

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <CandlestickChart className="h-5 w-5 text-purple-400" />
              {symbol}
            </CardTitle>
            {lastCandle && (
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-white">{lastCandle.close}</span>
                <Badge className={parseFloat(percentChange) >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {parseFloat(percentChange) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {percentChange}%
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={chartType === 'candlestick' ? 'default' : 'ghost'}
                onClick={() => setChartType('candlestick')}
                className={chartType === 'candlestick' ? 'bg-purple-500 text-white' : 'text-gray-400'}
              >
                <CandlestickChart className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={chartType === 'line' ? 'default' : 'ghost'}
                onClick={() => setChartType('line')}
                className={chartType === 'line' ? 'bg-purple-500 text-white' : 'text-gray-400'}
              >
                <LineChart className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={chartType === 'area' ? 'default' : 'ghost'}
                onClick={() => setChartType('area')}
                className={chartType === 'area' ? 'bg-purple-500 text-white' : 'text-gray-400'}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={showVolume ? 'default' : 'ghost'}
                onClick={() => setShowVolume(!showVolume)}
                className={showVolume ? 'bg-cyan-500 text-white' : 'text-gray-400'}
              >
                Vol
              </Button>
              <Button
                size="sm"
                variant={showSMA20 ? 'default' : 'ghost'}
                onClick={() => setShowSMA20(!showSMA20)}
                className={showSMA20 ? 'bg-amber-500 text-white' : 'text-gray-400'}
              >
                SMA20
              </Button>
              <Button
                size="sm"
                variant={showSMA50 ? 'default' : 'ghost'}
                onClick={() => setShowSMA50(!showSMA50)}
                className={showSMA50 ? 'bg-blue-500 text-white' : 'text-gray-400'}
              >
                SMA50
              </Button>
              <Button
                size="sm"
                variant={showEMA ? 'default' : 'ghost'}
                onClick={() => setShowEMA(!showEMA)}
                className={showEMA ? 'bg-pink-500 text-white' : 'text-gray-400'}
              >
                EMA
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center bg-gray-800/50 rounded-lg" style={{ height }}>
            <div className="text-center">
              <p className="text-red-400 mb-2">Chart Error</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        ) : !priceData ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div 
            ref={chartContainerRef} 
            className="w-full rounded-lg overflow-hidden"
            style={{ minHeight: height }}
          />
        )}
        
        {lastCandle && (
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800">
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
