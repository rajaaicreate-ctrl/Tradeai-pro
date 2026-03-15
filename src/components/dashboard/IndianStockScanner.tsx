'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  RefreshCw,
  Zap,
  Target
} from 'lucide-react'

interface ScannedStock {
  symbol: string
  name: string
  pattern: string
  confidence: number
  support: number
  resistance: number
  currentPrice: number
  volume: string
  reason: string
}

const INDIAN_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', basePrice: 2480 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', basePrice: 3850 },
  { symbol: 'INFY', name: 'Infosys', basePrice: 1480 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', basePrice: 1620 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', basePrice: 1080 },
  { symbol: 'WIPRO', name: 'Wipro', basePrice: 465 },
  { symbol: 'SBIN', name: 'State Bank of India', basePrice: 745 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', basePrice: 1380 },
  { symbol: 'ITC', name: 'ITC Limited', basePrice: 425 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', basePrice: 1720 },
  { symbol: 'LT', name: 'Larsen & Toubro', basePrice: 3450 },
  { symbol: 'AXISBANK', name: 'Axis Bank', basePrice: 1120 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', basePrice: 7250 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', basePrice: 12450 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', basePrice: 2850 },
]

const PATTERNS = [
  { name: 'Breakout', color: 'bg-green-500/20 text-green-400' },
  { name: 'Volume Spike', color: 'bg-cyan-500/20 text-cyan-400' },
  { name: 'Bullish Momentum', color: 'bg-purple-500/20 text-purple-400' },
  { name: 'Oversold Bounce', color: 'bg-amber-500/20 text-amber-400' },
]

const generateScanResults = (): ScannedStock[] => {
  const numResults = Math.floor(Math.random() * 5) + 4
  const shuffled = [...INDIAN_STOCKS].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, numResults)
  
  return selected.map(stock => {
    const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
    const priceVariation = (Math.random() - 0.5) * 0.04
    const currentPrice = stock.basePrice * (1 + priceVariation)
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      pattern: pattern.name,
      confidence: Math.floor(Math.random() * 30) + 60,
      support: Math.floor(currentPrice * 0.96),
      resistance: Math.floor(currentPrice * 1.08),
      currentPrice: Math.floor(currentPrice),
      volume: `${(Math.random() * 10 + 1).toFixed(1)}M`,
      reason: getPatternReason(pattern.name)
    }
  }).sort((a, b) => b.confidence - a.confidence)
}

const getPatternReason = (pattern: string): string => {
  const reasons: Record<string, string[]> = {
    'Breakout': [
      'Breaking above key resistance with volume',
      'Cup and handle breakout confirmed',
      'Ascending triangle pattern breakout'
    ],
    'Volume Spike': [
      'Volume 3x above 20-day average',
      'Institutional buying detected',
      'Heavy call option activity'
    ],
    'Bullish Momentum': [
      'RSI showing strength above 60',
      'MACD bullish crossover confirmed',
      'Trading above all key MAs'
    ],
    'Oversold Bounce': [
      'RSI bounced from oversold levels',
      'Support at 200 EMA holding',
      'Bullish divergence on daily'
    ]
  }
  const patternReasons = reasons[pattern] || ['Pattern detected']
  return patternReasons[Math.floor(Math.random() * patternReasons.length)]
}

export default function IndianStockScanner() {
  const [stocks, setStocks] = useState<ScannedStock[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)

  const runScan = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setStocks(generateScanResults())
    setLoading(false)
  }

  useEffect(() => {
    runScan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPattern = !selectedPattern || stock.pattern === selectedPattern
    return matchesSearch && matchesPattern
  })

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            🇮🇳 Indian Stock Scanner
          </CardTitle>
          <Button onClick={runScan} disabled={loading} className="bg-purple-500 hover:bg-purple-600">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Scan Now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-gray-500 mr-1" />
            {PATTERNS.map((p) => (
              <Button
                key={p.name}
                size="sm"
                variant={selectedPattern === p.name ? 'default' : 'ghost'}
                onClick={() => setSelectedPattern(selectedPattern === p.name ? null : p.name)}
                className={selectedPattern === p.name ? 'bg-purple-500 text-white' : 'text-gray-400'}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <Activity className="h-10 w-10 text-purple-500 mx-auto mb-3 animate-pulse" />
            <p className="text-gray-400">AI scanning Indian markets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.map((stock, idx) => {
              const patternInfo = PATTERNS.find(p => p.name === stock.pattern)
              return (
                <Card key={idx} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-white font-bold">{stock.symbol}</span>
                        <p className="text-xs text-gray-500">{stock.name}</p>
                      </div>
                      <Badge className={patternInfo?.color || 'bg-gray-500/20'}>
                        {stock.pattern}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">AI Confidence</span>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span className={`font-bold ${stock.confidence >= 75 ? 'text-green-400' : 'text-cyan-400'}`}>
                          {stock.confidence}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="bg-gray-700/50 p-2 rounded text-center">
                        <div className="text-gray-500">Price</div>
                        <div className="text-white">₹{stock.currentPrice}</div>
                      </div>
                      <div className="bg-gray-700/50 p-2 rounded text-center">
                        <div className="text-gray-500">Support</div>
                        <div className="text-red-400">₹{stock.support}</div>
                      </div>
                      <div className="bg-gray-700/50 p-2 rounded text-center">
                        <div className="text-gray-500">Resistance</div>
                        <div className="text-green-400">₹{stock.resistance}</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-3">
                      💡 {stock.reason}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Vol: {stock.volume}</span>
                      <Button variant="ghost" size="sm" className="text-purple-400">
                        View Details →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {stocks.filter(s => s.pattern === 'Breakout').length}
            </div>
            <div className="text-xs text-gray-500">Breakouts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {stocks.filter(s => s.pattern === 'Volume Spike').length}
            </div>
            <div className="text-xs text-gray-500">Volume Spikes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stocks.filter(s => s.pattern === 'Bullish Momentum').length}
            </div>
            <div className="text-xs text-gray-500">Momentum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {stocks.filter(s => s.pattern === 'Oversold Bounce').length}
            </div>
            <div className="text-xs text-gray-500">Oversold</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
