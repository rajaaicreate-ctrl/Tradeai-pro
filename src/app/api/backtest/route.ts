// Backtest API Route
// Handles backtest execution and results

import { NextRequest, NextResponse } from 'next/server'
import { BacktestEngine, runBacktest } from '@/lib/backtesting/engine'
import { BacktestConfig, OHLCVCandle, BacktestResults } from '@/lib/backtesting/types'
import { strategyTemplates, getStrategyById, getDefaultParameters } from '@/lib/backtesting/strategies'

export const dynamic = 'force-dynamic'

// ============================================
// GENERATE DEMO DATA
// ============================================

function generateDemoData(
  symbol: string,
  startDate: Date,
  endDate: Date,
  timeframe: string
): OHLCVCandle[] {
  const candles: OHLCVCandle[] = []
  
  // Determine interval in minutes
  const intervalMinutes: Record<string, number> = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '4h': 240,
    '1d': 1440,
    '1w': 10080
  }
  
  const interval = (intervalMinutes[timeframe] || 60) * 60 * 1000 // in ms
  
  // Base prices for different assets
  const basePrices: Record<string, number> = {
    'BTC/USD': 67000,
    'ETH/USD': 3500,
    'EUR/USD': 1.085,
    'GBP/USD': 1.27,
    'XAU/USD': 2340,
    'SPY': 520,
    'QQQ': 450
  }
  
  let price = basePrices[symbol] || 100
  let timestamp = startDate.getTime()
  const endTimestamp = endDate.getTime()
  
  // Generate candles
  while (timestamp < endTimestamp) {
    // Add some randomness and trend
    const trend = Math.sin(timestamp / (7 * 24 * 60 * 60 * 1000)) * 0.001 // Weekly cycle
    const noise = (Math.random() - 0.5) * 0.02 // 2% noise
    const momentum = (Math.random() - 0.5) * 0.005 // Momentum factor
    
    const change = price * (trend + noise + momentum)
    const open = price
    const close = price + change
    
    // High and low with some volatility
    const volatility = Math.abs(change) + price * 0.005
    const high = Math.max(open, close) + Math.random() * volatility
    const low = Math.min(open, close) - Math.random() * volatility
    
    // Volume with some correlation to price movement
    const baseVolume = symbol.includes('BTC') ? 1000000 : symbol.includes('EUR') ? 100000 : 500000
    const volume = baseVolume * (1 + Math.abs(change / price) * 10) * (0.5 + Math.random())
    
    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume
    })
    
    price = close
    timestamp += interval
  }
  
  return candles
}

// ============================================
// GET - List Strategies
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    // List all available strategies
    if (action === 'strategies') {
      return NextResponse.json({
        success: true,
        strategies: strategyTemplates.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          assetClasses: s.assetClasses,
          timeframes: s.timeframes,
          parameters: s.parameters
        }))
      })
    }
    
    // Get single strategy details
    if (action === 'strategy') {
      const strategyId = searchParams.get('id')
      if (!strategyId) {
        return NextResponse.json({
          success: false,
          error: 'Strategy ID required'
        }, { status: 400 })
      }
      
      const strategy = getStrategyById(strategyId)
      if (!strategy) {
        return NextResponse.json({
          success: false,
          error: 'Strategy not found'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        strategy
      })
    }
    
    // Get demo/backtest results
    if (action === 'demo') {
      const symbol = searchParams.get('symbol') || 'BTC/USD'
      const strategyId = searchParams.get('strategy') || 'sma_crossover'
      
      const demoResults = await runDemoBacktest(symbol, strategyId)
      return NextResponse.json({
        success: true,
        results: demoResults
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Backtest API. Use POST to run a backtest.',
      endpoints: {
        'GET ?action=strategies': 'List all strategies',
        'GET ?action=strategy&id={id}': 'Get strategy details',
        'GET ?action=demo&symbol={symbol}&strategy={id}': 'Run demo backtest',
        'POST': 'Run custom backtest'
      }
    })
    
  } catch (error: any) {
    console.error('Backtest API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Backtest failed'
    }, { status: 500 })
  }
}

// ============================================
// POST - Run Backtest
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      strategyId,
      symbol,
      timeframe = '1h',
      startDate,
      endDate,
      initialCapital = 10000,
      commission = 0.001,
      slippage = 0.0005,
      leverage = 1,
      positionSize = 10,
      maxPositions = 1,
      riskPerTrade = 2,
      stopLoss,
      takeProfit,
      trailingStop = false,
      parameters = {}
    } = body
    
    // Validate required fields
    if (!strategyId || !symbol) {
      return NextResponse.json({
        success: false,
        error: 'Strategy ID and symbol are required'
      }, { status: 400 })
    }
    
    // Get strategy definition
    const strategy = getStrategyById(strategyId)
    if (!strategy) {
      return NextResponse.json({
        success: false,
        error: `Strategy '${strategyId}' not found`
      }, { status: 404 })
    }
    
    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
    const end = endDate ? new Date(endDate) : new Date()
    
    // Merge default parameters with provided parameters
    const finalParams = {
      ...getDefaultParameters(strategyId),
      ...parameters
    }
    
    // Build backtest config
    const config: BacktestConfig = {
      strategy,
      symbol,
      timeframe,
      startDate: start,
      endDate: end,
      initialCapital,
      commission,
      slippage,
      leverage,
      positionSize,
      maxPositions,
      riskPerTrade,
      stopLoss,
      takeProfit,
      trailingStop,
      parameters: finalParams
    }
    
    // Generate or fetch data
    const data = generateDemoData(symbol, start, end, timeframe)
    
    // Run backtest
    const results = await runBacktest(config, data)
    
    return NextResponse.json({
      success: true,
      results: {
        id: results.id,
        config: {
          strategy: strategy.name,
          symbol,
          timeframe,
          startDate: start,
          endDate: end,
          initialCapital,
          parameters: finalParams
        },
        summary: results.summary,
        statistics: {
          totalTrades: results.summary.totalTrades,
          winRate: results.summary.winRate,
          profitFactor: results.summary.profitFactor,
          sharpeRatio: results.summary.sharpeRatio,
          maxDrawdown: results.summary.maxDrawdownPercent
        },
        trades: results.trades.slice(-20), // Last 20 trades
        equityCurve: downsampleEquityCurve(results.equityCurve, 100),
        monthlyReturns: results.monthlyReturns
      }
    })
    
  } catch (error: any) {
    console.error('Backtest execution error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Backtest execution failed'
    }, { status: 500 })
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function runDemoBacktest(symbol: string, strategyId: string): Promise<any> {
  const strategy = getStrategyById(strategyId) || strategyTemplates[0]
  const end = new Date()
  const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
  
  const config: BacktestConfig = {
    strategy,
    symbol,
    timeframe: '1h',
    startDate: start,
    endDate: end,
    initialCapital: 10000,
    commission: 0.001,
    slippage: 0.0005,
    leverage: 1,
    positionSize: 10,
    maxPositions: 1,
    riskPerTrade: 2,
    stopLoss: 2,
    takeProfit: 4,
    trailingStop: true,
    parameters: getDefaultParameters(strategyId)
  }
  
  const data = generateDemoData(symbol, start, end, '1h')
  const results = await runBacktest(config, data)
  
  return {
    id: results.id,
    config: {
      strategy: strategy.name,
      symbol,
      timeframe: '1h',
      startDate: start,
      endDate: end,
      initialCapital: 10000
    },
    summary: results.summary,
    trades: results.trades.slice(-10),
    equityCurve: downsampleEquityCurve(results.equityCurve, 50),
    monthlyReturns: results.monthlyReturns
  }
}

function downsampleEquityCurve(curve: any[], maxPoints: number): any[] {
  if (curve.length <= maxPoints) return curve
  
  const step = Math.ceil(curve.length / maxPoints)
  const downsampled = []
  
  for (let i = 0; i < curve.length; i += step) {
    downsampled.push(curve[i])
  }
  
  return downsampled
}
