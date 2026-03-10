import { NextRequest, NextResponse } from 'next/server'

// AI Opportunity Radar API
// Scans 100+ assets and detects high-probability trading setups

// Asset definitions - 100+ assets across markets
const ASSETS = {
  forex: [
    { symbol: 'EUR/USD', name: 'Euro/US Dollar', basePrice: 1.0850 },
    { symbol: 'GBP/USD', name: 'British Pound/US Dollar', basePrice: 1.2650 },
    { symbol: 'USD/JPY', name: 'US Dollar/Japanese Yen', basePrice: 149.50 },
    { symbol: 'USD/CHF', name: 'US Dollar/Swiss Franc', basePrice: 0.8750 },
    { symbol: 'AUD/USD', name: 'Australian Dollar/US Dollar', basePrice: 0.6550 },
    { symbol: 'USD/CAD', name: 'US Dollar/Canadian Dollar', basePrice: 1.3580 },
    { symbol: 'NZD/USD', name: 'New Zealand Dollar/US Dollar', basePrice: 0.6050 },
    { symbol: 'EUR/GBP', name: 'Euro/British Pound', basePrice: 0.8580 },
    { symbol: 'EUR/JPY', name: 'Euro/Japanese Yen', basePrice: 162.20 },
    { symbol: 'GBP/JPY', name: 'British Pound/Japanese Yen', basePrice: 188.90 },
    { symbol: 'AUD/JPY', name: 'Australian Dollar/Japanese Yen', basePrice: 97.90 },
    { symbol: 'USD/SGD', name: 'US Dollar/Singapore Dollar', basePrice: 1.3420 },
    { symbol: 'USD/HKD', name: 'US Dollar/Hong Kong Dollar', basePrice: 7.820 },
    { symbol: 'USD/INR', name: 'US Dollar/Indian Rupee', basePrice: 83.50 },
    { symbol: 'EUR/CHF', name: 'Euro/Swiss Franc', basePrice: 0.9500 },
    { symbol: 'AUD/NZD', name: 'Australian Dollar/New Zealand Dollar', basePrice: 1.0820 },
    { symbol: 'CAD/JPY', name: 'Canadian Dollar/Japanese Yen', basePrice: 110.10 },
    { symbol: 'CHF/JPY', name: 'Swiss Franc/Japanese Yen', basePrice: 170.80 },
    { symbol: 'EUR/AUD', name: 'Euro/Australian Dollar', basePrice: 1.6570 },
    { symbol: 'GBP/AUD', name: 'British Pound/Australian Dollar', basePrice: 1.9310 },
  ],
  crypto: [
    { symbol: 'BTC/USD', name: 'Bitcoin', basePrice: 94500 },
    { symbol: 'ETH/USD', name: 'Ethereum', basePrice: 3450 },
    { symbol: 'BNB/USD', name: 'Binance Coin', basePrice: 580 },
    { symbol: 'SOL/USD', name: 'Solana', basePrice: 175 },
    { symbol: 'XRP/USD', name: 'Ripple', basePrice: 2.35 },
    { symbol: 'ADA/USD', name: 'Cardano', basePrice: 0.85 },
    { symbol: 'DOGE/USD', name: 'Dogecoin', basePrice: 0.38 },
    { symbol: 'DOT/USD', name: 'Polkadot', basePrice: 7.50 },
    { symbol: 'MATIC/USD', name: 'Polygon', basePrice: 0.55 },
    { symbol: 'AVAX/USD', name: 'Avalanche', basePrice: 42 },
    { symbol: 'LINK/USD', name: 'Chainlink', basePrice: 18 },
    { symbol: 'ATOM/USD', name: 'Cosmos', basePrice: 9.20 },
    { symbol: 'UNI/USD', name: 'Uniswap', basePrice: 12.50 },
    { symbol: 'LTC/USD', name: 'Litecoin', basePrice: 95 },
    { symbol: 'NEAR/USD', name: 'NEAR Protocol', basePrice: 5.80 },
    { symbol: 'APT/USD', name: 'Aptos', basePrice: 9.50 },
    { symbol: 'ARB/USD', name: 'Arbitrum', basePrice: 0.92 },
    { symbol: 'OP/USD', name: 'Optimism', basePrice: 1.85 },
    { symbol: 'INJ/USD', name: 'Injective', basePrice: 22 },
    { symbol: 'SUI/USD', name: 'Sui', basePrice: 3.20 },
    { symbol: 'SEI/USD', name: 'Sei', basePrice: 0.45 },
    { symbol: 'TIA/USD', name: 'Celestia', basePrice: 8.50 },
    { symbol: 'FIL/USD', name: 'Filecoin', basePrice: 5.80 },
    { symbol: 'AAVE/USD', name: 'Aave', basePrice: 145 },
    { symbol: 'MKR/USD', name: 'Maker', basePrice: 2800 },
  ],
  gold: [
    { symbol: 'XAU/USD', name: 'Gold', basePrice: 2350 },
    { symbol: 'XAG/USD', name: 'Silver', basePrice: 27.80 },
    { symbol: 'XPT/USD', name: 'Platinum', basePrice: 985 },
    { symbol: 'XPD/USD', name: 'Palladium', basePrice: 1020 },
  ],
  usStocks: [
    { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 195 },
    { symbol: 'MSFT', name: 'Microsoft', basePrice: 420 },
    { symbol: 'GOOGL', name: 'Alphabet', basePrice: 175 },
    { symbol: 'AMZN', name: 'Amazon', basePrice: 185 },
    { symbol: 'NVDA', name: 'NVIDIA', basePrice: 920 },
    { symbol: 'TSLA', name: 'Tesla', basePrice: 245 },
    { symbol: 'META', name: 'Meta Platforms', basePrice: 505 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway', basePrice: 415 },
    { symbol: 'JPM', name: 'JPMorgan Chase', basePrice: 198 },
    { symbol: 'V', name: 'Visa', basePrice: 285 },
    { symbol: 'JNJ', name: 'Johnson & Johnson', basePrice: 158 },
    { symbol: 'UNH', name: 'UnitedHealth', basePrice: 495 },
    { symbol: 'HD', name: 'Home Depot', basePrice: 345 },
    { symbol: 'PG', name: 'Procter & Gamble', basePrice: 165 },
    { symbol: 'MA', name: 'Mastercard', basePrice: 465 },
    { symbol: 'DIS', name: 'Disney', basePrice: 112 },
    { symbol: 'PYPL', name: 'PayPal', basePrice: 62 },
    { symbol: 'NFLX', name: 'Netflix', basePrice: 620 },
    { symbol: 'ADBE', name: 'Adobe', basePrice: 580 },
    { symbol: 'CRM', name: 'Salesforce', basePrice: 275 },
    { symbol: 'AMD', name: 'AMD', basePrice: 165 },
    { symbol: 'INTC', name: 'Intel', basePrice: 32 },
    { symbol: 'QCOM', name: 'Qualcomm', basePrice: 175 },
    { symbol: 'COST', name: 'Costco', basePrice: 735 },
    { symbol: 'PEP', name: 'PepsiCo', basePrice: 175 },
  ],
  indianStocks: [
    { symbol: 'RELIANCE', name: 'Reliance Industries', basePrice: 2450 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', basePrice: 3850 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', basePrice: 1620 },
    { symbol: 'INFY', name: 'Infosys', basePrice: 1480 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', basePrice: 1050 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', basePrice: 1180 },
    { symbol: 'SBIN', name: 'State Bank of India', basePrice: 625 },
    { symbol: 'ITC', name: 'ITC Limited', basePrice: 445 },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', basePrice: 980 },
    { symbol: 'AXISBANK', name: 'Axis Bank', basePrice: 1120 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', basePrice: 2420 },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance', basePrice: 7250 },
    { symbol: 'MARUTI', name: 'Maruti Suzuki', basePrice: 12500 },
    { symbol: 'ASIANPAINT', name: 'Asian Paints', basePrice: 2950 },
    { symbol: 'SUNPHARMA', name: 'Sun Pharma', basePrice: 1650 },
    { symbol: 'TITAN', name: 'Titan Company', basePrice: 3650 },
    { symbol: 'DMART', name: 'Avenue Supermarts', basePrice: 3850 },
    { symbol: 'WIPRO', name: 'Wipro', basePrice: 450 },
    { symbol: 'HCLTECH', name: 'HCL Technologies', basePrice: 1380 },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', basePrice: 9850 },
    { symbol: 'NTPC', name: 'NTPC', basePrice: 320 },
    { symbol: 'POWERGRID', name: 'Power Grid Corp', basePrice: 280 },
    { symbol: 'TATASTEEL', name: 'Tata Steel', basePrice: 145 },
    { symbol: 'ONGC', name: 'ONGC', basePrice: 255 },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', basePrice: 1650 },
  ],
  indices: [
    { symbol: 'NIFTY50', name: 'NIFTY 50 Index', basePrice: 22500 },
    { symbol: 'SENSEX', name: 'BSE SENSEX', basePrice: 74000 },
    { symbol: 'NIFTYBANK', name: 'NIFTY Bank', basePrice: 48500 },
    { symbol: 'SPX', name: 'S&P 500', basePrice: 5200 },
    { symbol: 'DJI', name: 'Dow Jones', basePrice: 39500 },
    { symbol: 'NASDAQ', name: 'NASDAQ 100', basePrice: 18200 },
  ]
}

// Pattern types
type PatternType = 'breakout' | 'support_bounce' | 'trend_reversal' | 'volume_spike' | 'rsi_oversold' | 'rsi_overbought'
type OpportunityLevel = 'high' | 'medium' | 'watchlist'
type MarketType = 'forex' | 'crypto' | 'gold' | 'usStocks' | 'indianStocks' | 'indices'

interface Opportunity {
  id: string
  symbol: string
  name: string
  marketType: MarketType
  pattern: PatternType
  patternLabel: string
  price: number
  priceChange: number
  priceChangePercent: number
  indicators: {
    rsi: number
    macd: { trend: string; histogram: number }
    sma20: number
    sma50: number
    ema: number
    volumeChange: number
  }
  levels: {
    support: number
    resistance: number
  }
  trend: string
  confidence: number
  level: OpportunityLevel
  timestamp: string
}

// Generate simulated market data with indicators
function generateMarketData(asset: { symbol: string; name: string; basePrice: number }, marketType: string, timeframe: string) {
  const volatilityMap: Record<string, number> = {
    'forex': 0.002,
    'crypto': 0.04,
    'gold': 0.01,
    'usStocks': 0.015,
    'indianStocks': 0.018,
    'indices': 0.012
  }

  const timeframeMultiplier: Record<string, number> = {
    '5m': 0.3,
    '15m': 0.5,
    '1H': 1,
    '4H': 2,
    '1D': 3
  }

  const volatility = volatilityMap[marketType] || 0.01
  const multiplier = timeframeMultiplier[timeframe] || 1
  const adjustedVolatility = volatility * multiplier

  // Generate price data
  const prices: number[] = []
  const volumes: number[] = []
  let currentPrice = asset.basePrice

  for (let i = 0; i < 100; i++) {
    const change = currentPrice * adjustedVolatility * (Math.random() - 0.48)
    currentPrice = Math.max(currentPrice + change, currentPrice * 0.5)
    prices.push(currentPrice)
    volumes.push(Math.floor(Math.random() * 1000000) + 100000)
  }

  const latestPrice = prices[prices.length - 1]
  const previousPrice = prices[prices.length - 2]
  const priceChange = latestPrice - previousPrice
  const priceChangePercent = (priceChange / previousPrice) * 100

  // Calculate indicators
  const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20
  const sma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / 50

  // EMA 12
  const emaMultiplier = 2 / (12 + 1)
  let ema = prices[0]
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] - ema) * emaMultiplier + ema
  }

  // RSI
  let gains = 0, losses = 0
  for (let i = 1; i < 15; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1]
    if (change > 0) gains += change
    else losses -= change
  }
  const rs = losses === 0 ? 100 : gains / losses
  const rsi = 100 - (100 / (1 + rs))

  // MACD
  let ema12 = prices[0], ema26 = prices[0]
  const mult12 = 2 / (12 + 1), mult26 = 2 / (26 + 1)
  for (let i = 1; i < prices.length; i++) {
    ema12 = (prices[i] - ema12) * mult12 + ema12
    ema26 = (prices[i] - ema26) * mult26 + ema26
  }
  const macdValue = ema12 - ema26
  const macdSignal = macdValue * 0.85
  const macdHistogram = macdValue - macdSignal
  const macdTrend = macdHistogram > 0 ? 'Bullish' : 'Bearish'

  // Volume change
  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
  const lastVolume = volumes[volumes.length - 1]
  const volumeChange = ((lastVolume - avgVolume) / avgVolume) * 100

  // Support & Resistance
  const recentLow = Math.min(...prices.slice(-20))
  const recentHigh = Math.max(...prices.slice(-20))
  const support = recentLow * 0.995
  const resistance = recentHigh * 1.005

  // Trend
  const trend = latestPrice > sma20 && sma20 > sma50 ? 'Bullish' :
                latestPrice < sma20 && sma20 < sma50 ? 'Bearish' : 'Sideways'

  return {
    price: latestPrice,
    priceChange,
    priceChangePercent,
    rsi,
    macd: { trend: macdTrend, histogram: macdHistogram },
    sma20,
    sma50,
    ema,
    volumeChange,
    support,
    resistance,
    trend
  }
}

// Detect patterns
function detectPatterns(data: any): { pattern: PatternType; label: string; confidence: number }[] {
  const patterns: { pattern: PatternType; label: string; confidence: number }[] = []

  // RSI Oversold (< 30)
  if (data.rsi < 30) {
    patterns.push({
      pattern: 'rsi_oversold',
      label: 'RSI Oversold',
      confidence: 70 + Math.random() * 15
    })
  }

  // RSI Overbought (> 70)
  if (data.rsi > 70) {
    patterns.push({
      pattern: 'rsi_overbought',
      label: 'RSI Overbought',
      confidence: 70 + Math.random() * 15
    })
  }

  // Volume Spike (> 100% increase)
  if (data.volumeChange > 100) {
    patterns.push({
      pattern: 'volume_spike',
      label: 'Volume Spike',
      confidence: 65 + Math.random() * 20
    })
  }

  // Breakout (price near resistance with volume)
  const resistanceDistance = ((data.resistance - data.price) / data.price) * 100
  if (resistanceDistance < 0.5 && data.volumeChange > 50) {
    patterns.push({
      pattern: 'breakout',
      label: 'Breakout',
      confidence: 72 + Math.random() * 12
    })
  }

  // Support Bounce (price near support with bullish MACD)
  const supportDistance = ((data.price - data.support) / data.price) * 100
  if (supportDistance < 0.5 && data.macd.histogram > 0) {
    patterns.push({
      pattern: 'support_bounce',
      label: 'Support Bounce',
      confidence: 68 + Math.random() * 15
    })
  }

  // Trend Reversal (RSI divergence with MACD)
  if ((data.rsi > 60 && data.macd.histogram < 0) || (data.rsi < 40 && data.macd.histogram > 0)) {
    patterns.push({
      pattern: 'trend_reversal',
      label: 'Trend Reversal',
      confidence: 60 + Math.random() * 18
    })
  }

  return patterns
}

// Calculate opportunity level
function calculateLevel(confidence: number, pattern: PatternType): OpportunityLevel {
  if (confidence >= 75 && ['breakout', 'support_bounce'].includes(pattern)) {
    return 'high'
  }
  if (confidence >= 65 || ['volume_spike', 'trend_reversal'].includes(pattern)) {
    return 'medium'
  }
  return 'watchlist'
}

// Scan all assets
function scanMarkets(timeframe: string, filters: { marketType?: string; patternType?: string }): Opportunity[] {
  const opportunities: Opportunity[] = []

  const marketTypes: MarketType[] = ['forex', 'crypto', 'gold', 'usStocks', 'indianStocks', 'indices']

  for (const marketType of marketTypes) {
    // Apply market type filter
    if (filters.marketType && filters.marketType !== 'all' && filters.marketType !== marketType) {
      continue
    }

    const assets = ASSETS[marketType] || []

    for (const asset of assets) {
      const data = generateMarketData(asset, marketType, timeframe)
      const patterns = detectPatterns(data)

      for (const patternData of patterns) {
        // Apply pattern filter
        if (filters.patternType && filters.patternType !== 'all' && filters.patternType !== patternData.pattern) {
          continue
        }

        const level = calculateLevel(patternData.confidence, patternData.pattern)

        opportunities.push({
          id: `${asset.symbol}-${patternData.pattern}-${Date.now()}`,
          symbol: asset.symbol,
          name: asset.name,
          marketType,
          pattern: patternData.pattern,
          patternLabel: patternData.label,
          price: data.price,
          priceChange: data.priceChange,
          priceChangePercent: data.priceChangePercent,
          indicators: {
            rsi: Math.round(data.rsi),
            macd: { trend: data.macd.trend, histogram: data.macd.histogram },
            sma20: data.sma20,
            sma50: data.sma50,
            ema: data.ema,
            volumeChange: Math.round(data.volumeChange)
          },
          levels: {
            support: data.support,
            resistance: data.resistance
          },
          trend: data.trend,
          confidence: Math.round(patternData.confidence),
          level,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  // Sort by confidence
  return opportunities.sort((a, b) => b.confidence - a.confidence)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || '1H'
    const marketType = searchParams.get('marketType') || 'all'
    const patternType = searchParams.get('patternType') || 'all'

    // Scan markets
    const opportunities = scanMarkets(timeframe, { marketType, patternType })

    // Categorize opportunities
    const highOpportunities = opportunities.filter(o => o.level === 'high')
    const mediumOpportunities = opportunities.filter(o => o.level === 'medium')
    const watchlistOpportunities = opportunities.filter(o => o.level === 'watchlist')

    // Top 10 opportunities
    const topOpportunities = opportunities.slice(0, 10)

    // Trending markets (highest volume spikes)
    const trendingMarkets = opportunities
      .filter(o => o.indicators.volumeChange > 80)
      .slice(0, 5)

    // Generate alerts for high opportunities
    const alerts = highOpportunities.slice(0, 3).map(o => ({
      type: 'opportunity',
      message: `High Opportunity: ${o.symbol} - ${o.patternLabel}`,
      confidence: o.confidence,
      timestamp: new Date().toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: {
        opportunities,
        categories: {
          high: highOpportunities,
          medium: mediumOpportunities,
          watchlist: watchlistOpportunities
        },
        topOpportunities,
        trendingMarkets,
        alerts,
        stats: {
          totalScanned: Object.values(ASSETS).flat().length,
          opportunitiesFound: opportunities.length,
          highCount: highOpportunities.length,
          mediumCount: mediumOpportunities.length,
          watchlistCount: watchlistOpportunities.length
        },
        lastUpdate: new Date().toISOString(),
        nextUpdate: new Date(Date.now() + 30000).toISOString(),
        disclaimer: 'TradeAI Pro provides market analysis tools only. This platform does not provide financial or investment advice.'
      }
    })

  } catch (error: any) {
    console.error('Radar API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to scan markets'
    }, { status: 500 })
  }
}
