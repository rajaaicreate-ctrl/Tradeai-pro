'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Image, 
  X, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Loader2,
  Sparkles,
  AlertTriangle,
  Shield,
  CheckCircle,
  Clock,
  Layers,
  Zap
} from 'lucide-react'

interface AnalysisResult {
  asset: string
  timeframe: string
  analysis: {
    price: string
    trend: string
    indicators: {
      rsi: number
      macd: { value: string; signal: string; trend: string }
      sma20: string
      sma50: string
      ema: string
      volume: { trend: string; change: string }
    }
    levels: {
      support: string
      resistance: string
    }
    pattern: {
      name: string
      type: string
      description: string
      confidence: number
    }
    insight: string
    confidence: number
    riskAnalysis: {
      level: string
      reason: string
    }
    tradeScenario: {
      entry: string
      stopLoss: string
      target: string
      note: string
    }
    timestamp: string
  }
  disclaimer: string
}

interface ChartAnalysisProps {
  className?: string
}

const TIMEFRAMES = [
  { value: '1m', label: '1 Min' },
  { value: '5m', label: '5 Min' },
  { value: '15m', label: '15 Min' },
  { value: '1H', label: '1 Hour' },
  { value: '4H', label: '4 Hour' },
  { value: '1D', label: '1 Day' }
]

const INDICATORS = [
  { value: 'rsi', label: 'RSI' },
  { value: 'macd', label: 'MACD' },
  { value: 'sma', label: 'Moving Average' },
  { value: 'volume', label: 'Volume' }
]

const ASSET_SUGGESTIONS = [
  'BTC/USD', 'ETH/USD', 'EUR/USD', 'GBP/USD', 'XAU/USD',
  'NIFTY 50', 'SENSEX', 'RELIANCE', 'TCS', 'AAPL', 'TSLA'
]

export default function AIChartAnalysis({ className }: ChartAnalysisProps) {
  const [chartImage, setChartImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [asset, setAsset] = useState('')
  const [timeframe, setTimeframe] = useState('1H')
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['rsi', 'macd'])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PNG, JPG, JPEG, or WEBP.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.')
      return
    }

    setChartImage(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const toggleIndicator = (indicator: string) => {
    setSelectedIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    )
  }

  const handleAnalyze = async () => {
    if (!asset) {
      setError('Please enter an asset name.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('asset', asset)
      formData.append('timeframe', timeframe)
      formData.append('indicators', selectedIndicators.join(','))
      if (chartImage) {
        formData.append('chartImage', chartImage)
      }

      const response = await fetch('/api/ai/chart-analysis', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze chart')
    } finally {
      setLoading(false)
    }
  }

  const resetAnalysis = () => {
    setChartImage(null)
    setImagePreview(null)
    setAsset('')
    setResult(null)
    setError(null)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Bullish':
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case 'Bearish':
        return <TrendingDown className="h-5 w-5 text-red-400" />
      default:
        return <Activity className="h-5 w-5 text-yellow-400" />
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'High':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    }
  }

  return (
    <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
      <CardHeader className="pb-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">AI Chart Analysis</CardTitle>
              <p className="text-gray-400 text-xs">Upload chart for AI analysis</p>
            </div>
          </div>
          {result && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAnalysis}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-purple-500 bg-purple-500/10' 
              : 'border-gray-700 hover:border-gray-600'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {imagePreview ? (
            <div className="space-y-3">
              <img
                src={imagePreview}
                alt="Chart preview"
                className="max-h-48 mx-auto rounded-lg"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setChartImage(null)
                  setImagePreview(null)
                }}
                className="text-gray-400 hover:text-red-400"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-800 flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Drag & drop chart image</p>
                <p className="text-gray-500 text-xs">or click to browse</p>
              </div>
              <p className="text-gray-500 text-xs">PNG, JPG, WEBP • Max 5MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Asset Input */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Asset Name</label>
          <Input
            value={asset}
            onChange={(e) => setAsset(e.target.value.toUpperCase())}
            placeholder="e.g., BTC/USD, EURUSD, NIFTY"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
          <div className="flex flex-wrap gap-1">
            {ASSET_SUGGESTIONS.slice(0, 6).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setAsset(suggestion)}
                className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Select */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Timeframe</label>
          <div className="grid grid-cols-6 gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`text-xs py-2 px-1 rounded transition-colors ${
                  timeframe === tf.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Indicators */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Indicators Used</label>
          <div className="flex flex-wrap gap-2">
            {INDICATORS.map((ind) => (
              <button
                key={ind.value}
                onClick={() => toggleIndicator(ind.value)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                  selectedIndicators.includes(ind.value)
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                {selectedIndicators.includes(ind.value) && (
                  <CheckCircle className="h-3 w-3" />
                )}
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={loading || !asset}
          className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Chart...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Chart
            </>
          )}
        </Button>

        {/* Analysis Result */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-cyan-500/20 text-cyan-400">
                  {result.asset}
                </Badge>
                <Badge variant="outline" className="text-gray-400">
                  {result.timeframe}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                {new Date(result.analysis.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {/* Trend & Pattern */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Trend</div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(result.analysis.trend)}
                  <span className={`font-medium ${
                    result.analysis.trend === 'Bullish' ? 'text-green-400' :
                    result.analysis.trend === 'Bearish' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>{result.analysis.trend}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Pattern</div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-400" />
                  <span className="text-white text-sm font-medium">{result.analysis.pattern.name}</span>
                </div>
              </div>
            </div>

            {/* Indicators */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-gray-800/50 rounded text-center">
                <div className="text-xs text-gray-400">RSI</div>
                <div className={`text-lg font-bold ${
                  result.analysis.indicators.rsi > 70 ? 'text-red-400' :
                  result.analysis.indicators.rsi < 30 ? 'text-green-400' :
                  'text-white'
                }`}>{result.analysis.indicators.rsi}</div>
              </div>
              <div className="p-2 bg-gray-800/50 rounded text-center">
                <div className="text-xs text-gray-400">MACD</div>
                <div className={`text-sm font-medium ${
                  result.analysis.indicators.macd.trend.includes('Bullish') ? 'text-green-400' : 'text-red-400'
                }`}>{result.analysis.indicators.macd.trend}</div>
              </div>
              <div className="p-2 bg-gray-800/50 rounded text-center">
                <div className="text-xs text-gray-400">Volume</div>
                <div className={`text-sm font-medium ${
                  result.analysis.indicators.volume.trend === 'Increasing' ? 'text-green-400' : 'text-red-400'
                }`}>{result.analysis.indicators.volume.trend}</div>
              </div>
              <div className="p-2 bg-gray-800/50 rounded text-center">
                <div className="text-xs text-gray-400">Price</div>
                <div className="text-lg font-bold text-white">{result.analysis.price}</div>
              </div>
            </div>

            {/* Support & Resistance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-1 text-green-400 text-xs mb-1">
                  <Target className="h-3 w-3" />
                  Support
                </div>
                <div className="text-white font-bold">{result.analysis.levels.support}</div>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-1 text-red-400 text-xs mb-1">
                  <Target className="h-3 w-3" />
                  Resistance
                </div>
                <div className="text-white font-bold">{result.analysis.levels.resistance}</div>
              </div>
            </div>

            {/* AI Insight */}
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
                <Sparkles className="h-4 w-4" />
                AI Insight
              </div>
              <p className="text-gray-300 text-sm">{result.analysis.insight}</p>
            </div>

            {/* Pattern Description */}
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1">
                <Layers className="h-3 w-3" />
                Detected Pattern: {result.analysis.pattern.name}
              </div>
              <p className="text-gray-400 text-sm">{result.analysis.pattern.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Pattern Confidence:</span>
                <Progress value={result.analysis.pattern.confidence} className="h-1.5 flex-1" />
                <span className="text-xs text-white">{Math.round(result.analysis.pattern.confidence)}%</span>
              </div>
            </div>

            {/* Risk Analysis */}
            <div className={`p-3 rounded-lg border ${getRiskColor(result.analysis.riskAnalysis.level)}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Risk Level: {result.analysis.riskAnalysis.level}</span>
                </div>
              </div>
              <p className="text-sm opacity-80">{result.analysis.riskAnalysis.reason}</p>
            </div>

            {/* Trade Scenario */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 text-cyan-400 text-sm mb-3">
                <Zap className="h-4 w-4" />
                Possible Analytical Scenario
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-gray-900/50 rounded">
                  <div className="text-xs text-gray-400 mb-1">Entry Zone</div>
                  <div className="text-green-400 font-medium">{result.analysis.tradeScenario.entry}</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded">
                  <div className="text-xs text-gray-400 mb-1">Stop Loss</div>
                  <div className="text-red-400 font-medium">{result.analysis.tradeScenario.stopLoss}</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded">
                  <div className="text-xs text-gray-400 mb-1">Target</div>
                  <div className="text-cyan-400 font-medium">{result.analysis.tradeScenario.target}</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{result.analysis.tradeScenario.note}</p>
            </div>

            {/* Confidence */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                <span className="text-gray-400">Overall Confidence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      result.analysis.confidence >= 70 ? 'bg-green-500' :
                      result.analysis.confidence >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${result.analysis.confidence}%` }}
                  />
                </div>
                <span className="text-white font-medium">{result.analysis.confidence}%</span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-gray-500 flex items-start gap-2 p-2 bg-gray-800/30 rounded">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{result.disclaimer}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
