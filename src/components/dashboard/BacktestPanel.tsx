'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { 
  Play, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Zap,
  Settings,
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react'

// Types
interface Strategy {
  id: string
  name: string
  description: string
  category: string
  assetClasses: string[]
  timeframes: string[]
  parameters: any[]
}

interface BacktestSummary {
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  profitFactor: number
  maxDrawdown: number
  maxDrawdownPercent: number
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
  averageWin: number
  averageLoss: number
  largestWin: number
  largestLoss: number
  averageHoldingPeriod: number
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
  finalCapital: number
}

interface Trade {
  id: string
  symbol: string
  side: 'long' | 'short'
  entryPrice: number
  exitPrice: number
  entryTime: number
  exitTime: number
  pnl: number
  pnlPercent: number
  exitReason: string
}

interface EquityPoint {
  timestamp: number
  equity: number
  drawdown: number
  drawdownPercent: number
}

// Symbol options
const SYMBOLS = [
  { symbol: 'BTC/USD', name: 'Bitcoin', category: 'crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum', category: 'crypto' },
  { symbol: 'EUR/USD', name: 'Euro/US Dollar', category: 'forex' },
  { symbol: 'GBP/USD', name: 'British Pound/US Dollar', category: 'forex' },
  { symbol: 'XAU/USD', name: 'Gold', category: 'commodities' },
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'stocks' },
]

const TIMEFRAMES = [
  { value: '15m', label: '15 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: 'Daily' },
]

// Demo strategies
const DEMO_STRATEGIES: Strategy[] = [
  {
    id: 'sma_crossover',
    name: 'SMA Crossover',
    description: 'Classic trend-following using moving average crossovers',
    category: 'trend_following',
    assetClasses: ['forex', 'crypto', 'stocks'],
    timeframes: ['1h', '4h', '1d'],
    parameters: [
      { name: 'fastPeriod', default: 20, type: 'number' },
      { name: 'slowPeriod', default: 50, type: 'number' }
    ]
  },
  {
    id: 'rsi_mean_reversion',
    name: 'RSI Mean Reversion',
    description: 'Buy oversold, sell overbought conditions',
    category: 'mean_reversion',
    assetClasses: ['forex', 'stocks'],
    timeframes: ['1h', '4h'],
    parameters: [
      { name: 'oversold', default: 30, type: 'number' },
      { name: 'overbought', default: 70, type: 'number' }
    ]
  },
  {
    id: 'macd_strategy',
    name: 'MACD Momentum',
    description: 'Trade MACD signal line crossovers',
    category: 'momentum',
    assetClasses: ['forex', 'crypto', 'stocks'],
    timeframes: ['1h', '4h', '1d'],
    parameters: []
  },
  {
    id: 'bollinger_bands',
    name: 'Bollinger Band Bounce',
    description: 'Mean reversion at Bollinger Band extremes',
    category: 'mean_reversion',
    assetClasses: ['forex', 'crypto'],
    timeframes: ['1h', '4h'],
    parameters: []
  },
  {
    id: 'breakout',
    name: 'Price Breakout',
    description: 'Enter on breakouts above resistance or below support',
    category: 'breakout',
    assetClasses: ['forex', 'crypto', 'stocks'],
    timeframes: ['1h', '4h', '1d'],
    parameters: [
      { name: 'lookback', default: 20, type: 'number' }
    ]
  },
]

export default function BacktestPanel() {
  const [strategies, setStrategies] = useState<Strategy[]>(DEMO_STRATEGIES)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [showConfig, setShowConfig] = useState(false)
  
  // Backtest config
  const [config, setConfig] = useState({
    symbol: 'BTC/USD',
    strategy: 'sma_crossover',
    timeframe: '1h',
    initialCapital: 10000,
    positionSize: 10,
    stopLoss: 2,
    takeProfit: 4,
    riskPerTrade: 2
  })

  // Run backtest
  const runBacktest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: config.strategy,
          symbol: config.symbol,
          timeframe: config.timeframe,
          initialCapital: config.initialCapital,
          positionSize: config.positionSize,
          stopLoss: config.stopLoss,
          takeProfit: config.takeProfit,
          riskPerTrade: config.riskPerTrade,
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        })
      })

      const data = await response.json()
      if (data.success) {
        setResults(data.results)
        setShowConfig(false)
      } else {
        // Use demo results
        setResults(generateDemoResults())
      }
    } catch (error) {
      console.error('Backtest error:', error)
      setResults(generateDemoResults())
    } finally {
      setLoading(false)
    }
  }

  // Generate demo results
  const generateDemoResults = () => {
    const initialCapital = config.initialCapital
    const winRate = 58 + Math.random() * 15
    const totalTrades = 45 + Math.floor(Math.random() * 30)
    const winningTrades = Math.floor(totalTrades * winRate / 100)
    const avgWin = initialCapital * 0.025
    const avgLoss = initialCapital * 0.015
    
    const grossProfit = winningTrades * avgWin
    const grossLoss = (totalTrades - winningTrades) * avgLoss
    const totalReturn = grossProfit - grossLoss
    
    return {
      id: `backtest-${Date.now()}`,
      config: {
        strategy: strategies.find(s => s.id === config.strategy)?.name || 'SMA Crossover',
        symbol: config.symbol,
        timeframe: config.timeframe,
        initialCapital
      },
      summary: {
        totalReturn,
        totalReturnPercent: (totalReturn / initialCapital) * 100,
        annualizedReturn: ((totalReturn / initialCapital) * 100) * 4,
        totalTrades,
        winningTrades,
        losingTrades: totalTrades - winningTrades,
        winRate,
        profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0,
        maxDrawdown: initialCapital * (0.08 + Math.random() * 0.1),
        maxDrawdownPercent: 8 + Math.random() * 10,
        sharpeRatio: 1.2 + Math.random() * 1.5,
        sortinoRatio: 1.5 + Math.random() * 1.8,
        calmarRatio: 2 + Math.random() * 2,
        averageWin: avgWin,
        averageLoss: avgLoss,
        largestWin: avgWin * 3,
        largestLoss: avgLoss * 2,
        averageHoldingPeriod: 12 + Math.floor(Math.random() * 24),
        maxConsecutiveWins: 5 + Math.floor(Math.random() * 5),
        maxConsecutiveLosses: 3 + Math.floor(Math.random() * 3),
        finalCapital: initialCapital + totalReturn
      },
      trades: generateDemoTrades(totalTrades, config.symbol),
      equityCurve: generateEquityCurve(initialCapital, totalReturn),
      monthlyReturns: generateMonthlyReturns()
    }
  }

  const generateDemoTrades = (count: number, symbol: string): Trade[] => {
    const trades: Trade[] = []
    let time = Date.now() - 90 * 24 * 60 * 60 * 1000
    
    for (let i = 0; i < Math.min(count, 15); i++) {
      const side = Math.random() > 0.5 ? 'long' : 'short'
      const isWin = Math.random() > 0.42
      const pnlPercent = isWin 
        ? 1 + Math.random() * 4 
        : -1 - Math.random() * 2
      
      const basePrice = symbol.includes('BTC') ? 67000 : 
                       symbol.includes('ETH') ? 3500 :
                       symbol.includes('EUR') ? 1.08 : 500
      
      trades.push({
        id: `trade-${i}`,
        symbol,
        side,
        entryPrice: basePrice * (1 + (Math.random() - 0.5) * 0.1),
        exitPrice: basePrice * (1 + (Math.random() - 0.5) * 0.1),
        entryTime: time,
        exitTime: time + (1 + Math.floor(Math.random() * 48)) * 60 * 60 * 1000,
        pnl: 10000 * pnlPercent / 100,
        pnlPercent,
        exitReason: isWin ? 'take_profit' : 'stop_loss'
      })
      
      time += 2 * 24 * 60 * 60 * 1000
    }
    
    return trades
  }

  const generateEquityCurve = (initial: number, totalReturn: number): EquityPoint[] => {
    const points: EquityPoint[] = []
    let equity = initial
    let peak = initial
    const steps = 50
    const stepReturn = totalReturn / steps
    
    for (let i = 0; i < steps; i++) {
      const noise = (Math.random() - 0.5) * initial * 0.03
      equity += stepReturn + noise
      peak = Math.max(peak, equity)
      const drawdown = peak - equity
      
      points.push({
        timestamp: Date.now() - (steps - i) * 2 * 24 * 60 * 60 * 1000,
        equity,
        drawdown,
        drawdownPercent: (drawdown / peak) * 100
      })
    }
    
    return points
  }

  const generateMonthlyReturns = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, i) => ({
      month,
      return: -5 + Math.random() * 15,
      trades: 5 + Math.floor(Math.random() * 10)
    }))
  }

  // Format helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Strategy Backtester
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowConfig(true)}
              className="border-gray-700"
            >
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </Button>
            <Button 
              size="sm"
              onClick={runBacktest}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              Run Backtest
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Strategy Selection */}
        {!results && (
          <div className="space-y-3">
            <Label className="text-gray-300">Select Strategy</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => {
                    setSelectedStrategy(strategy)
                    setConfig({ ...config, strategy: strategy.id })
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    config.strategy === strategy.id
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-sm">{strategy.name}</div>
                  <div className="text-xs opacity-60 mt-1 truncate">{strategy.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Total Return</div>
                <div className={`text-lg font-bold ${results.summary.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(results.summary.totalReturn)}
                </div>
                <div className={`text-xs ${results.summary.totalReturnPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(results.summary.totalReturnPercent)}
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Win Rate</div>
                <div className="text-lg font-bold text-white">
                  {results.summary.winRate.toFixed(1)}%
                </div>
                <Progress 
                  value={results.summary.winRate} 
                  className="h-1.5 mt-1"
                />
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Sharpe Ratio</div>
                <div className="text-lg font-bold text-cyan-400">
                  {results.summary.sharpeRatio.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  Sortino: {results.summary.sortinoRatio.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Max Drawdown</div>
                <div className="text-lg font-bold text-red-400">
                  -{results.summary.maxDrawdownPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(results.summary.maxDrawdown)}
                </div>
              </div>
            </div>

            {/* Trades Stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <div className="bg-gray-800/30 rounded p-2 text-center">
                <div className="text-white font-medium">{results.summary.totalTrades}</div>
                <div className="text-xs text-gray-500">Trades</div>
              </div>
              <div className="bg-gray-800/30 rounded p-2 text-center">
                <div className="text-green-400 font-medium">{results.summary.winningTrades}</div>
                <div className="text-xs text-gray-500">Wins</div>
              </div>
              <div className="bg-gray-800/30 rounded p-2 text-center">
                <div className="text-red-400 font-medium">{results.summary.losingTrades}</div>
                <div className="text-xs text-gray-500">Losses</div>
              </div>
              <div className="bg-gray-800/30 rounded p-2 text-center">
                <div className="text-white font-medium">{results.summary.profitFactor.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Profit Factor</div>
              </div>
              <div className="bg-gray-800/30 rounded p-2 text-center">
                <div className="text-white font-medium">{results.summary.averageHoldingPeriod.toFixed(0)}h</div>
                <div className="text-xs text-gray-500">Avg Hold</div>
              </div>
              <div className="bg-gray-800/30 rounded p-2 text-center">
                <div className="text-white font-medium">{formatCurrency(results.summary.finalCapital)}</div>
                <div className="text-xs text-gray-500">Final Capital</div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="trades" className="mt-4">
              <TabsList className="bg-gray-800/50 w-full">
                <TabsTrigger value="trades" className="flex-1">Trades</TabsTrigger>
                <TabsTrigger value="equity" className="flex-1">Equity Curve</TabsTrigger>
                <TabsTrigger value="monthly" className="flex-1">Monthly</TabsTrigger>
              </TabsList>

              <TabsContent value="trades" className="mt-4">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-1">
                    {results.trades.map((trade: Trade, i: number) => (
                      <div 
                        key={trade.id}
                        className="flex items-center justify-between bg-gray-800/30 rounded p-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Badge className={trade.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {trade.side.toUpperCase()}
                          </Badge>
                          <span className="text-gray-400">{trade.symbol}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500">
                            {trade.entryPrice.toFixed(trade.symbol.includes('EUR') ? 4 : 2)} → {trade.exitPrice.toFixed(trade.symbol.includes('EUR') ? 4 : 2)}
                          </span>
                          <span className={`font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(trade.pnl)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="equity" className="mt-4">
                <div className="bg-gray-800/30 rounded-lg p-4 h-[200px] flex items-end gap-1">
                  {results.equityCurve.map((point: EquityPoint, i: number) => {
                    const maxEquity = Math.max(...results.equityCurve.map((p: EquityPoint) => p.equity))
                    const minEquity = Math.min(...results.equityCurve.map((p: EquityPoint) => p.equity))
                    const height = ((point.equity - minEquity) / (maxEquity - minEquity)) * 100
                    const isPositive = point.equity >= config.initialCapital
                    
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all hover:opacity-80 ${isPositive ? 'bg-green-500/50' : 'bg-red-500/50'}`}
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`$${point.equity.toFixed(0)}`}
                      />
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="mt-4">
                <div className="space-y-2">
                  {results.monthlyReturns.map((month: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-800/30 rounded p-2">
                      <div className="w-12 text-sm text-gray-400">{month.month}</div>
                      <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
                        <div 
                          className={`h-full ${month.return >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(Math.abs(month.return) * 5, 100)}%` }}
                        />
                      </div>
                      <div className={`text-sm font-medium w-16 text-right ${month.return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(month.return)}
                      </div>
                      <div className="text-xs text-gray-500 w-16 text-right">
                        {month.trades} trades
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Clear Results Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setResults(null)}
              className="w-full text-gray-500"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        )}

        {/* Config Dialog */}
        <Dialog open={showConfig} onOpenChange={setShowConfig}>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Backtest Configuration</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-gray-300">Symbol</Label>
                  <select
                    value={config.symbol}
                    onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
                    className="w-full bg-gray-800 border-gray-700 text-white rounded p-2"
                  >
                    {SYMBOLS.map((s) => (
                      <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Timeframe</Label>
                  <select
                    value={config.timeframe}
                    onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
                    className="w-full bg-gray-800 border-gray-700 text-white rounded p-2"
                  >
                    {TIMEFRAMES.map((tf) => (
                      <option key={tf.value} value={tf.value}>{tf.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-gray-300">Initial Capital</Label>
                  <Input
                    type="number"
                    value={config.initialCapital}
                    onChange={(e) => setConfig({ ...config, initialCapital: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Position Size %</Label>
                  <Input
                    type="number"
                    value={config.positionSize}
                    onChange={(e) => setConfig({ ...config, positionSize: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-gray-300">Stop Loss %</Label>
                  <Input
                    type="number"
                    value={config.stopLoss}
                    onChange={(e) => setConfig({ ...config, stopLoss: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Take Profit %</Label>
                  <Input
                    type="number"
                    value={config.takeProfit}
                    onChange={(e) => setConfig({ ...config, takeProfit: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Risk Per Trade %</Label>
                <Input
                  type="number"
                  value={config.riskPerTrade}
                  onChange={(e) => setConfig({ ...config, riskPerTrade: Number(e.target.value) })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowConfig(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => { setShowConfig(false); runBacktest(); }}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Run Backtest
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
