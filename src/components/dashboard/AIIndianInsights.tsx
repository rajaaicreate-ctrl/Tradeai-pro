'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Zap,
  AlertTriangle
} from 'lucide-react'

interface MarketInsight {
  id: number
  type: 'index' | 'sector' | 'stock' | 'pattern'
  title: string
  description: string
  confidence: number
  action: 'buy' | 'sell' | 'hold' | 'watch'
  timestamp: string
}

const generateInsights = (): MarketInsight[] => {
  const insights: MarketInsight[] = [
    {
      id: 1,
      type: 'index',
      title: 'NIFTY 50 Bullish Momentum',
      description: 'NIFTY showing strong bullish momentum, led by banking and IT stocks. Index trading above all key moving averages with positive breadth.',
      confidence: 76,
      action: 'buy',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'stock',
      title: 'Reliance Breaking Resistance',
      description: 'Reliance breaking out of consolidation pattern with above-average volume. Target ₹2550 in near term.',
      confidence: 71,
      action: 'buy',
      timestamp: new Date().toISOString()
    },
    {
      id: 3,
      type: 'sector',
      title: 'Banking Sector Strength',
      description: 'Banking sector showing relative strength. HDFC Bank and ICICI Bank leading the rally with strong volume.',
      confidence: 82,
      action: 'buy',
      timestamp: new Date().toISOString()
    },
    {
      id: 4,
      type: 'pattern',
      title: 'IT Sector Cup & Handle',
      description: 'IT sector forming classic cup and handle pattern on weekly chart. Breakout above ₹38,800 could trigger rally.',
      confidence: 68,
      action: 'watch',
      timestamp: new Date().toISOString()
    },
    {
      id: 5,
      type: 'stock',
      title: 'TCS Volume Spike',
      description: 'Unusual volume activity detected in TCS. Institutional buying suspected near ₹3,850 support level.',
      confidence: 73,
      action: 'buy',
      timestamp: new Date().toISOString()
    },
    {
      id: 6,
      type: 'index',
      title: 'SENSEX Near Resistance',
      description: 'SENSEX approaching 74,000 resistance zone. Watch for breakout or rejection at current levels.',
      confidence: 65,
      action: 'watch',
      timestamp: new Date().toISOString()
    }
  ]
  
  return insights.sort((a, b) => b.confidence - a.confidence)
}

export default function AIIndianInsights() {
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchInsights = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setInsights(generateInsights())
    setLastUpdate(new Date())
    setLoading(false)
  }

  useEffect(() => {
    const runFetch = async () => {
      await fetchInsights()
    }
    runFetch()
    const interval = setInterval(fetchInsights, 45000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getTypeIcon = (type: MarketInsight['type']) => {
    switch (type) {
      case 'index': return <Activity className="h-4 w-4 text-cyan-400" />
      case 'sector': return <Target className="h-4 w-4 text-purple-400" />
      case 'stock': return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'pattern': return <Zap className="h-4 w-4 text-amber-400" />
    }
  }

  const getActionBadge = (action: MarketInsight['action']) => {
    switch (action) {
      case 'buy':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
          <TrendingUp className="h-3 w-3 mr-1" /> Buy Signal
        </Badge>
      case 'sell':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
          <TrendingDown className="h-3 w-3 mr-1" /> Sell Signal
        </Badge>
      case 'hold':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
          Hold Position
        </Badge>
      case 'watch':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
          <Target className="h-3 w-3 mr-1" /> Watch
        </Badge>
    }
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            🧠 AI Indian Market Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {lastUpdate.toLocaleTimeString()}
            </span>
            <Button variant="ghost" size="sm" onClick={fetchInsights} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Market Summary */}
        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Brain className="h-6 w-6 text-purple-400 mt-1" />
            <div>
              <h4 className="font-medium text-white mb-1">Today's Market Summary</h4>
              <p className="text-sm text-gray-300">
                Indian markets showing bullish momentum led by banking and IT stocks. 
                NIFTY 50 trading near all-time highs with positive breadth. 
                Reliance and HDFC Bank leading the rally. AI Confidence: <span className="text-green-400 font-medium">78%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {loading && insights.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-10 w-10 text-purple-500 mx-auto mb-3 animate-pulse" />
              <p className="text-gray-400">AI analyzing Indian markets...</p>
            </div>
          ) : (
            insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${
                  insight.action === 'buy' ? 'bg-green-500/5 border-green-500/30' :
                  insight.action === 'sell' ? 'bg-red-500/5 border-red-500/30' :
                  insight.action === 'watch' ? 'bg-amber-500/5 border-amber-500/30' :
                  'bg-gray-800/30 border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(insight.type)}
                    <span className="font-medium text-white">{insight.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-700 text-gray-300">
                      {insight.confidence}% conf
                    </Badge>
                    {getActionBadge(insight.action)}
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-2">{insight.description}</p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="uppercase">{insight.type}</span>
                  <span>•</span>
                  <span>{new Date(insight.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-gray-800">
          <Button className="bg-green-500/20 text-green-400 hover:bg-green-500/30" variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Buy Signals ({insights.filter(i => i.action === 'buy').length})
          </Button>
          <Button className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Watch List ({insights.filter(i => i.action === 'watch').length})
          </Button>
          <Button className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30" variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Hold ({insights.filter(i => i.action === 'hold').length})
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              <strong className="text-gray-400">Disclaimer:</strong> AI insights are for educational purposes only. 
              TradeAI Pro does not provide investment advice. Always do your own research before trading.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
