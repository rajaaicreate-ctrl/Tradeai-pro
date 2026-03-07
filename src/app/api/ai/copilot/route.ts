import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// AI Market Copilot API
// Analyzes market questions and generates AI-powered responses

// Asset detection patterns
const ASSET_PATTERNS: Record<string, { name: string; type: string; patterns: string[] }> = {
  'BTC': { name: 'BTC/USD', type: 'crypto', patterns: ['btc', 'bitcoin', 'btcusd', 'btc/usd'] },
  'ETH': { name: 'ETH/USD', type: 'crypto', patterns: ['eth', 'ethereum', 'ethusd', 'eth/usd'] },
  'EURUSD': { name: 'EUR/USD', type: 'forex', patterns: ['eurusd', 'eur/usd', 'euro dollar', 'euro'] },
  'GBPUSD': { name: 'GBP/USD', type: 'forex', patterns: ['gbpusd', 'gbp/usd', 'pound', 'cable'] },
  'USDJPY': { name: 'USD/JPY', type: 'forex', patterns: ['usdjpy', 'usd/jpy', 'yen', 'dollar yen'] },
  'XAU': { name: 'XAU/USD', type: 'commodity', patterns: ['gold', 'xau', 'xauusd', 'xau/usd'] },
  'XAG': { name: 'XAG/USD', type: 'commodity', patterns: ['silver', 'xag', 'xagusd', 'xag/usd'] },
  'NIFTY': { name: 'NIFTY 50', type: 'index_in', patterns: ['nifty', 'nifty50', 'nifty 50', 'nsei'] },
  'SENSEX': { name: 'SENSEX', type: 'index_in', patterns: ['sensex', 'bse', 'bsesn'] },
  'RELIANCE': { name: 'RELIANCE', type: 'stock_in', patterns: ['reliance', 'reliance industries'] },
  'TCS': { name: 'TCS', type: 'stock_in', patterns: ['tcs', 'tata consultancy'] },
  'HDFC': { name: 'HDFC', type: 'stock_in', patterns: ['hdfc', 'hdfc bank'] },
  'INFY': { name: 'INFY', type: 'stock_in', patterns: ['infy', 'infosys'] },
  'AAPL': { name: 'AAPL', type: 'stock_us', patterns: ['aapl', 'apple', 'apple inc'] },
  'TSLA': { name: 'TSLA', type: 'stock_us', patterns: ['tsla', 'tesla'] },
  'MSFT': { name: 'MSFT', type: 'stock_us', patterns: ['msft', 'microsoft'] },
  'GOOGL': { name: 'GOOGL', type: 'stock_us', patterns: ['googl', 'google', 'alphabet'] },
  'AMZN': { name: 'AMZN', type: 'stock_us', patterns: ['amzn', 'amazon'] },
  'SOL': { name: 'SOL/USD', type: 'crypto', patterns: ['sol', 'solana'] },
  'XRP': { name: 'XRP/USD', type: 'crypto', patterns: ['xrp', 'ripple'] },
  'BNB': { name: 'BNB/USD', type: 'crypto', patterns: ['bnb', 'binance coin'] },
}

// General market category detection
const MARKET_CATEGORIES: Record<string, { name: string; type: string; patterns: string[]; assets: string[] }> = {
  'crypto': { 
    name: 'Cryptocurrency', 
    type: 'crypto', 
    patterns: ['crypto', 'cryptocurrency', 'cryptocurrencies', 'altcoin', 'altcoins', 'coin', 'coins'],
    assets: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'BNB/USD']
  },
  'forex': { 
    name: 'Forex', 
    type: 'forex', 
    patterns: ['forex', 'currency', 'currencies', 'fx', 'foreign exchange'],
    assets: ['EUR/USD', 'GBP/USD', 'USD/JPY']
  },
  'gold': { 
    name: 'Gold & Silver', 
    type: 'commodity', 
    patterns: ['gold', 'silver', 'precious metals', 'metals', 'commodities'],
    assets: ['XAU/USD', 'XAG/USD']
  },
  'indian': { 
    name: 'Indian Markets', 
    type: 'index_in', 
    patterns: ['indian', 'india', 'nse', 'bse', 'indian stocks', 'indian market'],
    assets: ['NIFTY 50', 'SENSEX', 'RELIANCE', 'TCS', 'HDFC']
  },
  'us_stocks': { 
    name: 'US Stocks', 
    type: 'stock_us', 
    patterns: ['us stocks', 'us market', 'wall street', 'nasdaq', 'sp500', 's&p', 'dow'],
    assets: ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN']
  },
}

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

// Detect asset from user question
function detectAsset(question: string): { asset: string; type: string } | null {
  const lowerQuestion = question.toLowerCase()
  
  for (const [key, data] of Object.entries(ASSET_PATTERNS)) {
    for (const pattern of data.patterns) {
      if (lowerQuestion.includes(pattern)) {
        return { asset: data.name, type: data.type }
      }
    }
  }
  
  return null
}

// Detect question intent
function detectIntent(question: string): string {
  const lowerQuestion = question.toLowerCase()
  
  if (lowerQuestion.includes('bullish') || lowerQuestion.includes('bearish') || lowerQuestion.includes('trend')) {
    return 'trend'
  }
  if (lowerQuestion.includes('support')) {
    return 'support'
  }
  if (lowerQuestion.includes('resistance')) {
    return 'resistance'
  }
  if (lowerQuestion.includes('buy') || lowerQuestion.includes('sell') || lowerQuestion.includes('trade')) {
    return 'trade'
  }
  if (lowerQuestion.includes('outlook') || lowerQuestion.includes('forecast') || lowerQuestion.includes('prediction')) {
    return 'outlook'
  }
  if (lowerQuestion.includes('rsi') || lowerQuestion.includes('macd') || lowerQuestion.includes('indicator')) {
    return 'indicators'
  }
  
  return 'general'
}

// Generate simulated market data with technical indicators
function generateMarketData(asset: string, type: string) {
  const basePrice = BASE_PRICES[asset] || 100
  const volatility = type === 'crypto' ? 0.05 : type === 'forex' ? 0.002 : 0.02
  
  // Generate price data (last 50 candles)
  const prices: number[] = []
  let currentPrice = basePrice
  
  for (let i = 0; i < 50; i++) {
    const change = currentPrice * volatility * (Math.random() - 0.45) // Slight bullish bias
    currentPrice = currentPrice + change
    prices.push(currentPrice)
  }
  
  const latestPrice = prices[prices.length - 1]
  
  // Calculate SMA20
  const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20
  
  // Calculate SMA50
  const sma50 = prices.reduce((a, b) => a + b, 0) / 50
  
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
  const macd = ema12 - ema26
  const macdSignal = macd * 0.8 // Simplified signal line
  const macdHistogram = macd - macdSignal
  
  // Determine trend
  const trend = latestPrice > sma20 && sma20 > sma50 ? 'Bullish' : 
                latestPrice < sma20 && sma20 < sma50 ? 'Bearish' : 'Sideways'
  
  // Calculate support and resistance
  const recentLow = Math.min(...prices.slice(-20))
  const recentHigh = Math.max(...prices.slice(-20))
  
  const support = recentLow * 0.995
  const resistance = recentHigh * 1.005
  
  // Volume trend
  const volumeTrend = Math.random() > 0.5 ? 'Increasing' : 'Decreasing'
  
  return {
    price: latestPrice,
    sma20,
    sma50,
    ema: ema12,
    rsi,
    macd: {
      value: macd,
      signal: macdSignal,
      histogram: macdHistogram,
      trend: macdHistogram > 0 ? 'Bullish crossover' : 'Bearish crossover'
    },
    trend,
    support,
    resistance,
    volumeTrend,
    volatility: volatility * 100
  }
}

// Calculate confidence score
function calculateConfidence(marketData: any, intent: string): number {
  let confidence = 50
  
  // RSI confidence
  if (marketData.rsi > 70 || marketData.rsi < 30) {
    confidence += 15 // Strong signal
  } else if (marketData.rsi > 60 || marketData.rsi < 40) {
    confidence += 8
  }
  
  // MACD confidence
  if (Math.abs(marketData.macd.histogram) > 0.5) {
    confidence += 12
  }
  
  // Trend alignment
  if (marketData.trend === 'Bullish' && marketData.price > marketData.sma20) {
    confidence += 10
  } else if (marketData.trend === 'Bearish' && marketData.price < marketData.sma20) {
    confidence += 10
  }
  
  // Volume confirmation
  if (marketData.volumeTrend === 'Increasing') {
    confidence += 5
  }
  
  return Math.min(Math.max(confidence, 45), 85)
}

// Generate AI insight using z-ai-web-dev-sdk
async function generateAIInsight(
  asset: string,
  type: string,
  intent: string,
  marketData: any,
  question: string,
  history?: any[]
): Promise<string> {
  try {
    const zai = await ZAI.create()
    
    // Build conversation context if available
    let conversationContext = ''
    if (history && history.length > 1) {
      const recentHistory = history.slice(-4)
      conversationContext = '\n\nRecent conversation:\n' + recentHistory.map((m: any) => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.substring(0, 200)}`
      ).join('\n')
    }
    
    const prompt = `You are a professional market analyst for TradeAI Pro. Analyze the following market data and provide a concise, actionable insight.

Asset: ${asset}
Type: ${type}
Current Price: ${marketData.price.toFixed(2)}
Trend: ${marketData.trend}
RSI (14): ${marketData.rsi.toFixed(1)}
MACD: ${marketData.macd.trend}
SMA 20: ${marketData.sma20.toFixed(2)}
SMA 50: ${marketData.sma50.toFixed(2)}
Support Level: ${marketData.support.toFixed(2)}
Resistance Level: ${marketData.resistance.toFixed(2)}
Volume Trend: ${marketData.volumeTrend}
${conversationContext}

User Question: ${question}

Provide a brief, professional market insight (2-3 sentences) addressing the user's question. Focus on key levels, momentum, and potential scenarios. Do NOT give financial advice. Keep it educational. Be conversational if this is a follow-up question.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional market analyst providing educational market insights. Be conversational and helpful.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    })
    
    return completion.choices[0]?.message?.content || generateFallbackInsight(asset, marketData, intent)
  } catch (error) {
    console.error('AI insight generation failed:', error)
    return generateFallbackInsight(asset, marketData, intent)
  }
}

// Fallback insight if AI fails
function generateFallbackInsight(asset: string, marketData: any, intent: string): string {
  if (intent === 'trend') {
    if (marketData.trend === 'Bullish') {
      return `${asset} is showing bullish momentum with price trading above key moving averages. RSI at ${marketData.rsi.toFixed(0)} indicates room for further upside before overbought conditions.`
    } else if (marketData.trend === 'Bearish') {
      return `${asset} is in a bearish trend with price below major moving averages. RSI at ${marketData.rsi.toFixed(0)} suggests potential for further downside.`
    }
    return `${asset} is consolidating in a sideways pattern. Wait for a breakout above resistance or below support for clearer direction.`
  }
  
  if (intent === 'support') {
    return `Key support for ${asset} is at ${marketData.support.toFixed(2)}. A break below this level could signal further downside.`
  }
  
  if (intent === 'resistance') {
    return `Key resistance for ${asset} is at ${marketData.resistance.toFixed(2)}. A breakout above this level could trigger further upside.`
  }
  
  return `${asset} is currently trading at ${marketData.price.toFixed(2)} with ${marketData.trend.toLowerCase()} momentum. Watch the ${marketData.support.toFixed(2)} support and ${marketData.resistance.toFixed(2)} resistance levels.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, sessionId, history } = body
    
    if (!question) {
      return NextResponse.json({
        success: false,
        error: 'Question is required'
      }, { status: 400 })
    }
    
    // Check if this is a follow-up question based on conversation history
    const isFollowUp = history && history.length > 1
    let contextAsset: string | null = null
    
    // If follow-up, try to find context from previous messages
    if (isFollowUp) {
      // Look for mentioned assets in recent assistant messages
      const recentAssistantMessages = history
        .filter((m: any) => m.role === 'assistant')
        .slice(-3)
      
      for (const msg of recentAssistantMessages) {
        const content = msg.content.toLowerCase()
        // Check for specific asset mentions in previous responses
        for (const [key, data] of Object.entries(ASSET_PATTERNS)) {
          if (content.includes(data.name.toLowerCase()) || content.includes(key.toLowerCase())) {
            contextAsset = data.name
            break
          }
        }
        if (contextAsset) break
      }
    }
    
    // Detect asset from question
    let assetDetection = detectAsset(question)
    
    // Check for follow-up pronouns that reference previous context
    const lowerQuestion = question.toLowerCase()
    const followUpIndicators = ['it', 'that', 'this', 'the same', 'what about', 'how about', 'and', 'also']
    const isFollowUpQuestion = followUpIndicators.some(indicator => 
      lowerQuestion.startsWith(indicator + ' ') || 
      lowerQuestion.includes('is ' + indicator + ' ') ||
      lowerQuestion.includes('was ' + indicator + ' ') ||
      lowerQuestion.includes('will ' + indicator + ' ')
    )
    
    // If it's a follow-up question and we have context, use the context asset
    if (!assetDetection && isFollowUpQuestion && contextAsset) {
      // Find the asset data for the context asset
      for (const [key, data] of Object.entries(ASSET_PATTERNS)) {
        if (data.name === contextAsset) {
          assetDetection = { asset: data.name, type: data.type }
          break
        }
      }
    }
    
    // If no specific asset, check for market category
    if (!assetDetection) {
      
      // Check for market category
      for (const [key, category] of Object.entries(MARKET_CATEGORIES)) {
        for (const pattern of category.patterns) {
          if (lowerQuestion.includes(pattern)) {
            // Generate market overview for this category
            const assetsData = category.assets.map(asset => {
              const type = category.type
              const marketData = generateMarketData(asset, type)
              return {
                asset,
                price: marketData.price,
                trend: marketData.trend,
                rsi: Math.round(marketData.rsi)
              }
            })
            
            // Determine overall market sentiment
            const bullishCount = assetsData.filter(a => a.trend === 'Bullish').length
            const bearishCount = assetsData.filter(a => a.trend === 'Bearish').length
            const overallSentiment = bullishCount > bearishCount ? 'Bullish' : 
                                    bearishCount > bullishCount ? 'Bearish' : 'Mixed'
            
            const insight = `📊 **${category.name} Market Overview**\n\n` +
              `Overall Sentiment: **${overallSentiment}**\n\n` +
              assetsData.map(a => 
                `• **${a.asset}**: $${a.price.toLocaleString()} | ${a.trend} | RSI: ${a.rsi}`
              ).join('\n') +
              `\n\n💡 *Tip: Ask about a specific asset like "Is BTC bullish?" for detailed analysis.*`
            
            return NextResponse.json({
              success: true,
              data: {
                response: insight,
                category: category.name,
                assets: assetsData,
                suggestedQuestions: [
                  `Is ${category.assets[0].split('/')[0]} bullish today?`,
                  `What is the trend for ${category.assets[1]?.split('/')[0] || category.assets[0].split('/')[0]}?`,
                  `Where is support for ${category.assets[0]}?`
                ]
              }
            })
          }
        }
      }
      
      // Check for greeting or general questions
      if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('hey')) {
        return NextResponse.json({
          success: true,
          data: {
            response: "👋 Hello! I'm your AI Market Copilot. I can help you analyze:\n\n" +
              "• **Crypto**: BTC, ETH, SOL, XRP, BNB\n" +
              "• **Forex**: EUR/USD, GBP/USD, USD/JPY\n" +
              "• **Commodities**: Gold, Silver\n" +
              "• **Indian Markets**: NIFTY, SENSEX, Reliance, TCS\n" +
              "• **US Stocks**: AAPL, TSLA, MSFT, GOOGL, AMZN\n\n" +
              "Ask me anything like 'Is BTC bullish?' or 'What's the crypto market outlook?'",
            suggestedQuestions: [
              "How is the crypto market today?",
              "Is Bitcoin bullish?",
              "What is Gold's trend?"
            ]
          }
        })
      }
      
      // Check for general market questions
      if (lowerQuestion.includes('market') || lowerQuestion.includes('today') || lowerQuestion.includes('how')) {
        return NextResponse.json({
          success: true,
          data: {
            response: "📈 I can help you analyze specific markets! Try asking about:\n\n" +
              "**Cryptocurrencies**:\n• 'How is crypto today?'\n• 'Is BTC bullish?'\n\n" +
              "**Forex**:\n• 'What is EURUSD trend?'\n• 'Forex outlook'\n\n" +
              "**Indian Markets**:\n• 'How is NIFTY?'\n• 'Indian market today'\n\n" +
              "**Commodities**:\n• 'Gold analysis'\n• 'Silver price'",
            suggestedQuestions: [
              "How is the crypto market today?",
              "What is the trend for EURUSD?",
              "Is Gold bullish?"
            ]
          }
        })
      }
      
      return NextResponse.json({
        success: true,
        data: {
          response: "I couldn't identify a specific asset in your question. Please mention an asset like BTC, ETH, EURUSD, Gold, NIFTY, or specific stock names.\n\nYou can also ask about market categories:\n• 'How is crypto today?'\n• 'Forex outlook'\n• 'Indian market'",
          suggestedQuestions: [
            "How is the crypto market today?",
            "Is BTC bullish?",
            "What is the trend for EURUSD?",
            "Is Gold trending up?"
          ]
        }
      })
    }
    
    const { asset, type } = assetDetection
    
    // Detect question intent
    const intent = detectIntent(question)
    
    // Generate market data with technical indicators
    const marketData = generateMarketData(asset, type)
    
    // Calculate confidence score
    const confidence = calculateConfidence(marketData, intent)
    
    // Generate AI insight
    const insight = await generateAIInsight(asset, type, intent, marketData, question, history)
    
    // Generate suggested follow-up questions
    const suggestedQuestions = [
      `What is the outlook for ${asset}?`,
      `Where are key support and resistance levels for ${asset}?`,
      `What indicators suggest for ${asset}?`
    ]
    
    // Build response
    const response = {
      asset,
      type,
      intent,
      analysis: {
        price: marketData.price.toFixed(type === 'forex' ? 4 : 2),
        trend: marketData.trend,
        indicators: {
          rsi: Math.round(marketData.rsi),
          macd: {
            value: marketData.macd.value.toFixed(4),
            signal: marketData.macd.signal.toFixed(4),
            trend: marketData.macd.trend
          },
          sma20: marketData.sma20.toFixed(type === 'forex' ? 4 : 2),
          sma50: marketData.sma50.toFixed(type === 'forex' ? 4 : 2),
          ema: marketData.ema.toFixed(type === 'forex' ? 4 : 2),
          volumeTrend: marketData.volumeTrend
        },
        levels: {
          support: marketData.support.toFixed(type === 'forex' ? 4 : 2),
          resistance: marketData.resistance.toFixed(type === 'forex' ? 4 : 2)
        },
        insight,
        confidence,
        riskLevel: marketData.rsi > 70 ? 'High' : marketData.rsi < 30 ? 'High' : 'Medium',
        timestamp: new Date().toISOString()
      },
      suggestedQuestions,
      disclaimer: 'TradeAI Pro provides market analysis for educational purposes only. This platform does not provide investment advice.'
    }
    
    return NextResponse.json({
      success: true,
      data: response
    })
    
  } catch (error: any) {
    console.error('Copilot API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process question'
    }, { status: 500 })
  }
}
