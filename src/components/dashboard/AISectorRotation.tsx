'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Brain,
  Zap
} from 'lucide-react'

interface SectorRotation {
  sector: string
  strength: 'strong' | 'moderate' | 'weak'
  momentum: 'rising' | 'falling' | 'neutral'
  rotation: 'entering' | 'exiting' | 'holding'
  score: number
  change: number
  outlook: string
}

const generateSectorRotation = (): SectorRotation[] => {
  const sectors = [
    'Banking',
    'IT & Technology',
    'Energy & Oil',
    'FMCG',
    'Pharma',
    'Automobile',
    'Metals & Mining',
    'Real Estate',
    'Infrastructure',
    'Media & Entertainment'
  ]
  
  return sectors.map(sector => {
    const score = Math.floor(Math.random() * 40) + 60 // 60-100
    const change = (Math.random() - 0.4) * 10
    
    const strength: SectorRotation['strength'] = 
      score >= 80 ? 'strong' : score >= 65 ? 'moderate' : 'weak'
    
    const momentum: SectorRotation['momentum'] = 
      change > 2 ? 'rising' : change < -2 ? 'falling' : 'neutral'
    
    const rotation: SectorRotation['rotation'] = 
      score >= 75 && momentum === 'rising' ? 'entering' :
      score < 65 && momentum === 'falling' ? 'exiting' : 'holding'
    
    const outlooks = {
      'entering': 'Smart money flowing in. Consider accumulating.',
      'exiting': 'Profit booking observed. Wait for stabilization.',
      'holding': 'Consolidation phase. Hold existing positions.'
    }
    
    return {
      sector,
      strength,
      momentum,
      rotation,
      score,
      change,
      outlook: outlooks[rotation]
    }
  }).sort((a, b) => b.score - a.score)
}

export default function AISectorRotation() {
  const [rotations, setRotations] = useState<SectorRotation[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const updateRotation = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRotations(generateSectorRotation())
    setLastUpdate(new Date())
    setLoading(false)
  }

  useEffect(() => {
    const runUpdate = async () => {
      await updateRotation()
    }
    runUpdate()
    const interval = setInterval(updateRotation, 60000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getStrengthColor = (strength: SectorRotation['strength']) => {
    switch (strength) {
      case 'strong': return 'text-green-400'
      case 'moderate': return 'text-amber-400'
      case 'weak': return 'text-red-400'
    }
  }

  const getMomentumIcon = (momentum: SectorRotation['momentum']) => {
    switch (momentum) {
      case 'rising': return <ArrowUpRight className="h-4 w-4 text-green-400" />
      case 'falling': return <ArrowDownRight className="h-4 w-4 text-red-400" />
      case 'neutral': return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getRotationBadge = (rotation: SectorRotation['rotation']) => {
    switch (rotation) {
      case 'entering': 
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
          <TrendingUp className="h-3 w-3 mr-1" /> Money Inflow
        </Badge>
      case 'exiting': 
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
          <TrendingDown className="h-3 w-3 mr-1" /> Money Outflow
        </Badge>
      case 'holding': 
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
          <Activity className="h-3 w-3 mr-1" /> Consolidating
        </Badge>
    }
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-400" />
            🔄 AI Sector Rotation Tracker
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
            <button onClick={updateRotation} className="p-1 hover:bg-gray-800 rounded">
              <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Track where smart money is flowing in Indian markets
        </p>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {rotations.filter(r => r.rotation === 'entering').length}
            </div>
            <div className="text-xs text-gray-400">Entering</div>
          </div>
          <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {rotations.filter(r => r.rotation === 'holding').length}
            </div>
            <div className="text-xs text-gray-400">Holding</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">
              {rotations.filter(r => r.rotation === 'exiting').length}
            </div>
            <div className="text-xs text-gray-400">Exiting</div>
          </div>
        </div>

        {/* Sector List */}
        <div className="space-y-3">
          {rotations.map((rotation, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-lg border ${
                rotation.rotation === 'entering' ? 'bg-green-500/5 border-green-500/30' :
                rotation.rotation === 'exiting' ? 'bg-red-500/5 border-red-500/30' :
                'bg-gray-800/30 border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-white">{rotation.sector}</span>
                  {getMomentumIcon(rotation.momentum)}
                </div>
                {getRotationBadge(rotation.rotation)}
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Sector Strength</span>
                    <span className={`text-xs font-medium ${getStrengthColor(rotation.strength)}`}>
                      {rotation.score}% ({rotation.strength})
                    </span>
                  </div>
                  <Progress 
                    value={rotation.score} 
                    className={`h-2 ${
                      rotation.score >= 80 ? 'bg-green-900/30' :
                      rotation.score >= 65 ? 'bg-amber-900/30' : 'bg-red-900/30'
                    }`}
                  />
                </div>
                
                <div className={`text-right ${
                  rotation.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <div className="text-lg font-bold">
                    {rotation.change >= 0 ? '+' : ''}{rotation.change.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">Change</div>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Brain className="h-3 w-3 text-purple-400" />
                {rotation.outlook}
              </div>
            </div>
          ))}
        </div>

        {/* Top Picks */}
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="font-medium text-white">AI Top Sector Picks</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {rotations.slice(0, 3).map((r, idx) => (
              <div key={idx} className="text-center p-2 bg-gray-800/50 rounded">
                <div className="text-sm font-medium text-white">{r.sector}</div>
                <div className="text-xs text-green-400">Score: {r.score}%</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
