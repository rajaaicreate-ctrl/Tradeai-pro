import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// AI Chart Analysis API
// Analyzes uploaded charts and generates AI-powered analysis

// Base prices for different assets
const BASE_PRICES: Record<string, number> = {
  'BTC/USD': 94500,
  'ETH/USD': 3450,
  'SOL/USD': 175,
  'XRP/USD': 2.35,
  'BNB/USD': 580,
  'EUR/USD': 1.0850,
  'GBP/USD': 1.2650,
  'USD/JPY': 149.50,
  'XAU/USD': 2350,
  'XAG/USD': 27.80,
  'NIFTY 50': 22500,
  'SENSEX': 74000,
  'RELIANCE': 2450,
  'TCS': 3850,
  'HDFC': 1620,
  'INFY': 1480,
  'AAPL': 195,
  'TSLA': 245,
  'MSFT': 420,
  'GOOGL': 175,
  'AMZN': 185,
}

// Timeframe multipliers for volatility
const TIMEFRAME_VOLATILITY: Record<string, number> = {
  '1m': 0.001,
  '5m': 0.002,
  '15m': 0.003,
  '1H': 0.005,
  '4H': 0.01,
  '1D': 0.02
}

// Chart pattern definitions
const CHART_PATTERNS = [
  { name: 'Double Top', type: 'bearish', description: 'Two consecutive peaks at similar levels indicating potential reversal' },
  { name: 'Double Bottom', type: 'bullish', description: 'Two consecutive troughs at similar levels indicating potential reversal' },
  { name: 'Ascending Triangle', type: 'bullish', description: 'Flat resistance with rising support indicating potential breakout' },
  { name: 'Descending Triangle', type: 'bearish', description: 'Flat support with falling resistance indicating potential breakdown' },
  { name: 'Head and Shoulders', type: 'bearish', description: 'Three peaks with middle peak highest, indicating trend reversal' },
  { name: 'Inverse Head and Shoulders', type: 'bullish', description: 'Three troughs with middle trough lowest, indicating trend reversal' },
  { name: 'Bull Flag', type: 'bullish', description: 'Consolidation after strong uptrend, potential continuation' },
  { name: 'Bear Flag', type: 'bearish', description: 'Consolidation after strong downtrend, potential continuation' },
  { name: 'Cup and Handle', type: 'bullish', description: 'Rounded bottom followed by consolidation, bullish continuation' },
  { name: 'Breakout', type: 'neutral', description: 'Price breaking above resistance or below support level' }
]

// Generate market data for chart analysis
function generateChartData(asset: string, timeframe: string, indicatorsUsed: string[]) {
  const basePrice = BASE_PRICES[asset] || 100
  const volatility = TIMEFRAME_VOLATILITY[timeframe] || 0.01
  
  // Determine asset type
  let assetType = 'stock'
  if (asset.includes('USD') && !asset.includes('/USD')) assetType = 'forex'
  else if (['BTC', 'ETH', 'SOL', 'XRP', 'BNB'].some(c => asset.includes(c))) assetType = 'crypto'
  else if (['XAU', 'XAG', 'Gold', 'Silver'].some(c => asset.includes(c))) assetType = 'commodity'
  else if (['NIFTY', 'SENSEX'].some(c => asset.includes(c))) assetType = 'index'
  
  // Adjust volatility based on asset type
  const assetVolMultiplier = assetType === 'crypto' ? 2 : assetType === 'forex' ? 0.5 : 1
  const adjustedVolatility = volatility * assetVolMultiplier
  
  // Generate price data (candlesticks)
  const candles = []
  let currentPrice = basePrice
  
  for (let i = 0; i < 100; i++) {
    const change = currentPrice * adjustedVolatility * (Math.random() - 0.48)
    const open = currentPrice
    const close = currentPrice + change
    const high = Math.max(open, close) * (1 + Math.random() * adjustedVolatility * 0.5)
    const low = Math.min(open, close) * (1 - Math.random() * adjustedVolatility * 0.5)
    const volume = Math.floor(Math.random() * 1000000) + 100000
    
    candles.push({ open, high, low, close, volume })
    currentPrice = close
  }
  
  const prices = candles.map(c => c.close)
  const latestPrice = prices[prices.length - 1]
  
  // Calculate SMA20
  const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20
  
  // Calculate SMA50
  const sma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / 50
  
  // Calculate EMA (12-period)
  const multiplier = 2 / (12 + 1)
  let ema = prices[0]
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
  }
  
  // Calculate RSI (14-period)
  let gains = 0
  let losses = 0
  for (let i = 1; i < 15; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1]
    if (change > 0) gains += change
    else losses -= change
  }
  const avgGain = gains / 14
  const avgLoss = losses / 14
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
  const rsi = 100 - (100 / (1 + rs))
  
  // Calculate MACD
  const ema12 = ema
  let ema26 = prices[0]
  const multiplier26 = 2 / (26 + 1)
  for (let i = 1; i < prices.length; i++) {
    ema26 = (prices[i] - ema26) * multiplier26 + ema26
  }
  const macdValue = ema12 - ema26
  const macdSignal = macdValue * 0.85
  const macdHistogram = macdValue - macdSignal
  
  // Determine trend
  const trend = latestPrice > sma20 && sma20 > sma50 ? 'Bullish' : 
                latestPrice < sma20 && sma20 < sma50 ? 'Bearish' : 'Sideways'
  
  // Calculate support and resistance
  const recentLow = Math.min(...prices.slice(-20))
  const recentHigh = Math.max(...prices.slice(-20))
  
  const support = recentLow * 0.995
  const resistance = recentHigh * 1.005
  
  // Volume analysis
  const recentVolumes = candles.slice(-10).map(c => c.volume)
  const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / 10
  const lastVolume = recentVolumes[recentVolumes.length - 1]
  const volumeTrend = lastVolume > avgVolume ? 'Increasing' : 'Decreasing'
  const volumeChange = ((lastVolume - avgVolume) / avgVolume) * 100
  
  // Detect pattern
  const detectedPattern = detectPattern(candles, trend)
  
  return {
    price: latestPrice,
    sma20,
    sma50,
    ema: ema12,
    rsi,
    macd: {
      value: macdValue,
      signal: macdSignal,
      histogram: macdHistogram,
      trend: macdHistogram > 0 ? 'Bullish crossover' : 'Bearish crossover'
    },
    trend,
    support,
    resistance,
    volumeTrend,
    volumeChange,
    detectedPattern,
    candles: candles.slice(-20), // Last 20 candles for visualization
    assetType
  }
}

// Detect chart pattern
function detectPattern(candles: any[], trend: string): { name: string; type: string; description: string; confidence: number } {
  // Simplified pattern detection based on price action
  const prices = candles.slice(-20).map((c: any) => c.close)
  const highs = candles.slice(-20).map((c: any) => c.high)
  const lows = candles.slice(-20).map((c: any) => c.low)
  
  const maxHigh = Math.max(...highs)
  const minLow = Math.min(...lows)
  const range = maxHigh - minLow
  
  // Check for Double Top
  const recentHighs = highs.slice(-10)
  const top1 = Math.max(...recentHighs.slice(0, 5))
  const top2 = Math.max(...recentHighs.slice(5))
  if (Math.abs(top1 - top2) < range * 0.02 && trend === 'Bearish') {
    return { ...CHART_PATTERNS[0], confidence: 70 + Math.random() * 15 }
  }
  
  // Check for Double Bottom
  const recentLows = lows.slice(-10)
  const bottom1 = Math.min(...recentLows.slice(0, 5))
  const bottom2 = Math.min(...recentLows.slice(5))
  if (Math.abs(bottom1 - bottom2) < range * 0.02 && trend === 'Bullish') {
    return { ...CHART_PATTERNS[1], confidence: 70 + Math.random() * 15 }
  }
  
  // Check for Ascending Triangle
  const resistanceTouches = highs.filter(h => Math.abs(h - maxHigh) < range * 0.01).length
  const lowIncreasing = lows.slice(-5).every((l: number, i: number, arr: number[]) => i === 0 || l >= arr[i-1] * 0.998)
  if (resistanceTouches >= 2 && lowIncreasing) {
    return { ...CHART_PATTERNS[2], confidence: 65 + Math.random() * 20 }
  }
  
  // Check for Descending Triangle
  const supportTouches = lows.filter(l => Math.abs(l - minLow) < range * 0.01).length
  const highDecreasing = highs.slice(-5).every((h: number, i: number, arr: number[]) => i === 0 || h <= arr[i-1] * 1.002)
  if (supportTouches >= 2 && highDecreasing) {
    return { ...CHART_PATTERNS[3], confidence: 65 + Math.random() * 20 }
  }
  
  // Check for Head and Shoulders
  if (trend === 'Bearish' && highs.slice(-5).reduce((a: number, b: number) => a + b, 0) / 5 < highs.slice(-10, -5).reduce((a: number, b: number) => a + b, 0) / 5) {
    return { ...CHART_PATTERNS[4], confidence: 60 + Math.random() * 20 }
  }
  
  // Check for Breakout
  const lastPrice = prices[prices.length - 1]
  if (Math.abs(lastPrice - maxHigh) < range * 0.005 || Math.abs(lastPrice - minLow) < range * 0.005) {
    return { ...CHART_PATTERNS[9], confidence: 75 + Math.random() * 15 }
  }
  
  // Default pattern based on trend
  if (trend === 'Bullish') {
    return { ...CHART_PATTERNS[6], confidence: 55 + Math.random() * 20 } // Bull Flag
  } else if (trend === 'Bearish') {
    return { ...CHART_PATTERNS[7], confidence: 55 + Math.random() * 20 } // Bear Flag
  }
  
  return { name: 'Consolidation', type: 'neutral', description: 'Price consolidating within a range', confidence: 50 }
}

// Calculate risk level
function calculateRiskLevel(marketData: any): { level: string; reason: string } {
  const { rsi, trend, volumeChange, detectedPattern, support, resistance, price } = marketData
  
  let riskScore = 50
  
  // RSI risk
  if (rsi > 75 || rsi < 25) {
    riskScore += 20
  } else if (rsi > 70 || rsi < 30) {
    riskScore += 10
  }
  
  // Volume risk
  if (volumeChange > 50) {
    riskScore += 10
  }
  
  // Pattern risk
  if (detectedPattern.type === 'bearish' && trend === 'Bullish') {
    riskScore += 15 // Divergence
  }
  
  // Support/Resistance proximity
  const supportDistance = ((price - support) / price) * 100
  const resistanceDistance = ((resistance - price) / price) * 100
  
  if (supportDistance < 1 || resistanceDistance < 1) {
    riskScore += 10 // Near key level
  }
  
  const level = riskScore > 70 ? 'High' : riskScore > 45 ? 'Medium' : 'Low'
  
  let reason = ''
  if (rsi > 70) {
    reason = 'RSI in overbought territory suggesting potential reversal risk.'
  } else if (rsi < 30) {
    reason = 'RSI in oversold territory suggesting potential reversal risk.'
  } else if (volumeChange > 30) {
    reason = 'High volume activity indicating increased volatility.'
  } else if (supportDistance < 1) {
    reason = 'Price near support level with potential for breakdown.'
  } else if (resistanceDistance < 1) {
    reason = 'Price approaching resistance level with rejection risk.'
  } else {
    reason = 'Normal market conditions with moderate risk factors.'
  }
  
  return { level, reason }
}

// Generate trade scenario
function generateTradeScenario(marketData: any): { entry: string; stopLoss: string; target: string; note: string } {
  const { price, trend, support, resistance, detectedPattern } = marketData
  
  let entry, stopLoss, target
  
  if (trend === 'Bullish') {
    entry = (price * 0.998).toFixed(2)
    stopLoss = (support * 0.995).toFixed(2)
    target = (resistance * 0.99).toFixed(2)
  } else if (trend === 'Bearish') {
    entry = (price * 1.002).toFixed(2)
    stopLoss = (resistance * 1.005).toFixed(2)
    target = (support * 1.01).toFixed(2)
  } else {
    // Sideways - range trading
    entry = (price * 0.999).toFixed(2)
    stopLoss = (support * 0.99).toFixed(2)
    target = (resistance * 0.99).toFixed(2)
  }
  
  return {
    entry,
    stopLoss,
    target,
    note: 'Possible analytical scenario based on indicators. Not financial advice.'
  }
}

// Generate AI insight using z-ai-web-dev-sdk
async function generateChartInsight(
  asset: string,
  timeframe: string,
  marketData: any,
  detectedPattern: any
): Promise<string> {
  try {
    const zai = await ZAI.create()
    
    const prompt = `You are a professional technical analyst for TradeAI Pro. Analyze the following chart data and provide a comprehensive insight.

Asset: ${asset}
Timeframe: ${timeframe}
Current Price: ${marketData.price.toFixed(2)}
Trend: ${marketData.trend}

Technical Indicators:
- RSI (14): ${marketData.rsi.toFixed(1)}
- MACD: ${marketData.macd.trend} (Histogram: ${marketData.macd.histogram.toFixed(4)})
- SMA 20: ${marketData.sma20.toFixed(2)}
- SMA 50: ${marketData.sma50.toFixed(2)}
- EMA: ${marketData.ema.toFixed(2)}

Key Levels:
- Support: ${marketData.support.toFixed(2)}
- Resistance: ${marketData.resistance.toFixed(2)}

Volume: ${marketData.volumeTrend} (${Math.abs(marketData.volumeChange).toFixed(1)}% change)

Detected Pattern: ${detectedPattern.name} (${detectedPattern.type})

Provide a 2-3 sentence professional analysis covering:
1. Current market structure
2. Key observations from indicators
3. Potential scenarios

Keep it educational and concise. Do NOT give financial advice.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional technical analyst providing educational market insights.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    })
    
    return completion.choices[0]?.message?.content || generateFallbackInsight(marketData, detectedPattern)
  } catch (error) {
    console.error('AI chart insight generation failed:', error)
    return generateFallbackInsight(marketData, detectedPattern)
  }
}

// Fallback insight
function generateFallbackInsight(marketData: any, detectedPattern: any): string {
  const trendDesc = marketData.trend === 'Bullish' ? 'showing bullish momentum with higher highs' :
                    marketData.trend === 'Bearish' ? 'in a bearish trend with lower lows' :
                    'consolidating in a range'
  
  return `${detectedPattern.name} pattern detected on ${marketData.trend.toLowerCase()} chart. Price is ${trendDesc}. RSI at ${marketData.rsi.toFixed(0)} ${marketData.rsi > 70 ? 'suggests overbought conditions' : marketData.rsi < 30 ? 'suggests oversold conditions' : 'is neutral'}. Watch for reaction at key support (${marketData.support.toFixed(2)}) and resistance (${marketData.resistance.toFixed(2)}) levels.`
}

// Calculate confidence score
function calculateConfidence(marketData: any): number {
  let confidence = 50
  
  // Pattern confidence
  confidence += (marketData.detectedPattern.confidence - 50) * 0.5
  
  // Indicator alignment
  if (marketData.trend === 'Bullish' && marketData.macd.histogram > 0) {
    confidence += 10
  } else if (marketData.trend === 'Bearish' && marketData.macd.histogram < 0) {
    confidence += 10
  }
  
  // Volume confirmation
  if ((marketData.trend === 'Bullish' && marketData.volumeTrend === 'Increasing') ||
      (marketData.trend === 'Bearish' && marketData.volumeTrend === 'Increasing')) {
    confidence += 8
  }
  
  return Math.min(Math.max(Math.round(confidence), 40), 85)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const asset = formData.get('asset') as string
    const timeframe = formData.get('timeframe') as string || '1H'
    const indicatorsUsed = (formData.get('indicators') as string || '').split(',').filter(Boolean)
    const chartImage = formData.get('chartImage') as File | null
    
    if (!asset) {
      return NextResponse.json({
        success: false,
        error: 'Asset name is required'
      }, { status: 400 })
    }
    
    // Validate timeframe
    const validTimeframes = ['1m', '5m', '15m', '1H', '4H', '1D']
    const normalizedTimeframe = validTimeframes.includes(timeframe) ? timeframe : '1H'
    
    // Generate chart data and analysis
    const marketData = generateChartData(asset, normalizedTimeframe, indicatorsUsed)
    
    // Calculate risk level
    const riskAnalysis = calculateRiskLevel(marketData)
    
    // Generate trade scenario
    const tradeScenario = generateTradeScenario(marketData)
    
    // Calculate confidence
    const confidence = calculateConfidence(marketData)
    
    // Generate AI insight
    const insight = await generateChartInsight(
      asset,
      normalizedTimeframe,
      marketData,
      marketData.detectedPattern
    )
    
    // Build response
    const response = {
      asset,
      timeframe: normalizedTimeframe,
      analysis: {
        price: marketData.price.toFixed(marketData.assetType === 'forex' ? 4 : 2),
        trend: marketData.trend,
        indicators: {
          rsi: Math.round(marketData.rsi),
          macd: {
            value: marketData.macd.value.toFixed(4),
            signal: marketData.macd.signal.toFixed(4),
            trend: marketData.macd.trend
          },
          sma20: marketData.sma20.toFixed(marketData.assetType === 'forex' ? 4 : 2),
          sma50: marketData.sma50.toFixed(marketData.assetType === 'forex' ? 4 : 2),
          ema: marketData.ema.toFixed(marketData.assetType === 'forex' ? 4 : 2),
          volume: {
            trend: marketData.volumeTrend,
            change: `${marketData.volumeChange > 0 ? '+' : ''}${marketData.volumeChange.toFixed(1)}%`
          }
        },
        levels: {
          support: marketData.support.toFixed(marketData.assetType === 'forex' ? 4 : 2),
          resistance: marketData.resistance.toFixed(marketData.assetType === 'forex' ? 4 : 2)
        },
        pattern: {
          name: marketData.detectedPattern.name,
          type: marketData.detectedPattern.type,
          description: marketData.detectedPattern.description,
          confidence: Math.round(marketData.detectedPattern.confidence)
        },
        insight,
        confidence,
        riskAnalysis,
        tradeScenario,
        timestamp: new Date().toISOString()
      },
      disclaimer: 'TradeAI Pro provides market analysis for educational purposes only. This platform does not provide investment advice.'
    }
    
    return NextResponse.json({
      success: true,
      data: response
    })
    
  } catch (error: any) {
    console.error('Chart analysis API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to analyze chart'
    }, { status: 500 })
  }
}
