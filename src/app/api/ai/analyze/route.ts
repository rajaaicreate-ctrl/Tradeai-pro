import { NextRequest, NextResponse } from 'next/server'
import { analyzeMarket, scanOpportunities, generateMarketSummary, generateCoachingTips } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'analyze': {
        const analysis = await analyzeMarket(data.symbol, data.priceData)
        return NextResponse.json({ success: true, analysis })
      }

      case 'scan': {
        const opportunities = await scanOpportunities(data.marketData)
        return NextResponse.json({ success: true, opportunities })
      }

      case 'summary': {
        const summary = await generateMarketSummary(data.marketData)
        return NextResponse.json({ success: true, summary })
      }

      case 'coaching': {
        const tips = await generateCoachingTips(data.tradingStats)
        return NextResponse.json({ success: true, tips })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('AI API error:', error)
    return NextResponse.json({
      error: error.message || 'AI analysis failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'EUR/USD'

    // Generate demo market data for the symbol
    const basePrice = getBasePrice(symbol)
    const volatility = Math.random() * 0.02
    const change = basePrice * volatility * (Math.random() > 0.5 ? 1 : -1)

    const priceData = {
      open: basePrice,
      high: basePrice + Math.abs(change) * 2,
      low: basePrice - Math.abs(change),
      close: basePrice + change,
      volume: Math.floor(Math.random() * 1000000),
      previousClose: basePrice - change * 0.5
    }

    const analysis = await analyzeMarket(symbol, priceData)

    return NextResponse.json({
      success: true,
      analysis,
      priceData
    })
  } catch (error: any) {
    console.error('AI GET error:', error)
    return NextResponse.json({
      error: error.message || 'Analysis failed'
    }, { status: 500 })
  }
}

function getBasePrice(symbol: string): number {
  const prices: Record<string, number> = {
    'EUR/USD': 1.0892,
    'GBP/USD': 1.2654,
    'USD/JPY': 149.85,
    'AUD/USD': 0.6543,
    'BTC/USD': 66543,
    'ETH/USD': 3421,
    'XAU/USD': 2342.50,
    'XAG/USD': 27.85,
  }
  return prices[symbol] || 100
}
