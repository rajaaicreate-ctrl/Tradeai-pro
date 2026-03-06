import ZAI from 'z-ai-web-dev-sdk'

export interface MarketAnalysis {
  symbol: string
  trend: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  signals: string[]
  recommendation: 'buy' | 'sell' | 'hold'
  entryPrice?: number
  targetPrice?: number
  stopLoss?: number
  riskLevel: 'low' | 'medium' | 'high'
  summary: string
}

export interface AICoachTip {
  type: 'warning' | 'success' | 'info' | 'tip'
  title: string
  message: string
}

// Analyze market data and generate AI insights
export async function analyzeMarket(
  symbol: string,
  priceData: {
    open: number
    high: number
    low: number
    close: number
    volume?: number
    previousClose?: number
  }
): Promise<MarketAnalysis> {
  try {
    const zai = await ZAI.create()
    
    const prompt = `You are a professional trading analyst. Analyze the following market data and provide a detailed analysis.

Symbol: ${symbol}
Current Price: ${priceData.close}
Open: ${priceData.open}
High: ${priceData.high}
Low: ${priceData.low}
Volume: ${priceData.volume || 'N/A'}
Previous Close: ${priceData.previousClose || 'N/A'}

Provide a JSON response with the following structure (no markdown, just raw JSON):
{
  "trend": "bullish|bearish|neutral",
  "confidence": <number 0-100>,
  "signals": ["<array of technical signals detected>"],
  "recommendation": "buy|sell|hold",
  "entryPrice": <suggested entry price>,
  "targetPrice": <target take profit price>,
  "stopLoss": <suggested stop loss>,
  "riskLevel": "low|medium|high",
  "summary": "<brief analysis summary>"
}`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional trading analyst. Always respond with valid JSON only, no markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    })

    const responseText = completion.choices[0]?.message?.content || ''
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    // Fallback to default analysis
    return getDefaultAnalysis(symbol, priceData)
    
  } catch (error) {
    console.error('AI Analysis error:', error)
    return getDefaultAnalysis(symbol, priceData)
  }
}

// Generate AI coaching tips based on user trading behavior
export async function generateCoachingTips(
  tradingStats: {
    winRate: number
    totalTrades: number
    profitLoss: number
    avgHoldTime?: string
    favoritePairs?: string[]
    recentErrors?: string[]
  }
): Promise<AICoachTip[]> {
  try {
    const zai = await ZAI.create()
    
    const prompt = `You are an AI trading coach. Based on the following trading statistics, provide personalized coaching tips.

Trading Stats:
- Win Rate: ${tradingStats.winRate}%
- Total Trades: ${tradingStats.totalTrades}
- Profit/Loss: $${tradingStats.profitLoss}
- Average Hold Time: ${tradingStats.avgHoldTime || 'N/A'}
- Favorite Pairs: ${tradingStats.favoritePairs?.join(', ') || 'N/A'}
- Recent Errors: ${tradingStats.recentErrors?.join(', ') || 'None'}

Provide a JSON array of 3-4 coaching tips with this structure (no markdown, just raw JSON):
[
  {
    "type": "warning|success|info|tip",
    "title": "<tip title>",
    "message": "<detailed tip message>"
  }
]`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful trading coach. Always respond with valid JSON array only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 600
    })

    const responseText = completion.choices[0]?.message?.content || ''
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return getDefaultCoachingTips()
    
  } catch (error) {
    console.error('AI Coaching error:', error)
    return getDefaultCoachingTips()
  }
}

// Scan for trading opportunities
export async function scanOpportunities(
  marketData: Array<{
    symbol: string
    price: number
    change24h: number
    volume?: number
  }>
): Promise<Array<{
  symbol: string
  type: string
  direction: 'Long' | 'Short'
  confidence: number
  entry: number
  target: number
  stopLoss: number
  reasoning: string
}>> {
  try {
    const zai = await ZAI.create()
    
    const prompt = `You are a trading opportunity scanner. Analyze the following market data and identify the best trading opportunities.

Market Data:
${marketData.map(m => `- ${m.symbol}: $${m.price} (${m.change24h >= 0 ? '+' : ''}${m.change24h}%)`).join('\n')}

Provide a JSON array of 2-3 best opportunities with this structure (no markdown, just raw JSON):
[
  {
    "symbol": "<symbol>",
    "type": "<setup type e.g., Breakout, Reversal, Trend Follow>",
    "direction": "Long|Short",
    "confidence": <number 60-95>,
    "entry": <entry price>,
    "target": <target price>,
    "stopLoss": <stop loss price>,
    "reasoning": "<brief explanation>"
  }
]`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a trading scanner. Always respond with valid JSON array only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 800
    })

    const responseText = completion.choices[0]?.message?.content || ''
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return getDefaultOpportunities()
    
  } catch (error) {
    console.error('Opportunity scan error:', error)
    return getDefaultOpportunities()
  }
}

// Generate market summary
export async function generateMarketSummary(
  marketData: Array<{
    symbol: string
    price: number
    change24h: number
  }>
): Promise<string> {
  try {
    const zai = await ZAI.create()
    
    const prompt = `Provide a brief market summary based on these prices:

${marketData.map(m => `${m.symbol}: $${m.price} (${m.change24h >= 0 ? '+' : ''}${m.change24h}%)`).join('\n')}

Keep it concise (2-3 sentences) and actionable for traders.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a market analyst. Provide concise, actionable summaries.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 200
    })

    return completion.choices[0]?.message?.content || 'Market analysis unavailable. Please try again.'
    
  } catch (error) {
    console.error('Market summary error:', error)
    return 'Market analysis unavailable. Please check back later.'
  }
}

// Default fallback functions
function getDefaultAnalysis(symbol: string, priceData: any): MarketAnalysis {
  const change = priceData.close - priceData.open
  const percentChange = (change / priceData.open) * 100
  
  return {
    symbol,
    trend: percentChange > 0.5 ? 'bullish' : percentChange < -0.5 ? 'bearish' : 'neutral',
    confidence: 65,
    signals: ['Price action analysis', 'Volume confirmation needed'],
    recommendation: percentChange > 1 ? 'buy' : percentChange < -1 ? 'sell' : 'hold',
    entryPrice: priceData.close,
    targetPrice: priceData.close * (percentChange > 0 ? 1.02 : 0.98),
    stopLoss: priceData.close * (percentChange > 0 ? 0.98 : 1.02),
    riskLevel: 'medium',
    summary: `${symbol} showing ${percentChange > 0 ? 'bullish' : 'bearish'} momentum. Monitor for confirmation signals.`
  }
}

function getDefaultCoachingTips(): AICoachTip[] {
  return [
    {
      type: 'warning',
      title: 'Risk Management',
      message: 'Always use proper position sizing and never risk more than 2% of your account on a single trade.'
    },
    {
      type: 'success',
      title: 'Consistency is Key',
      message: 'Following your trading plan consistently leads to better long-term results.'
    },
    {
      type: 'info',
      title: 'Market Hours',
      message: 'Major market moves often happen during overlapping sessions (London/New York).'
    },
    {
      type: 'tip',
      title: 'Keep Learning',
      message: 'Review your trades weekly to identify patterns in your success and areas for improvement.'
    }
  ]
}

function getDefaultOpportunities() {
  return [
    {
      symbol: 'EUR/USD',
      type: 'Breakout',
      direction: 'Long' as const,
      confidence: 75,
      entry: 1.0892,
      target: 1.0950,
      stopLoss: 1.0860,
      reasoning: 'Ascending triangle pattern with increasing volume'
    },
    {
      symbol: 'BTC/USD',
      type: 'Support Bounce',
      direction: 'Long' as const,
      confidence: 68,
      entry: 66500,
      target: 68500,
      stopLoss: 65000,
      reasoning: 'Strong support zone with bullish divergence'
    }
  ]
}
