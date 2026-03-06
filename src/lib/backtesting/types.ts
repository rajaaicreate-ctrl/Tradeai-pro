// Strategy Backtesting Types and Interfaces
// Comprehensive type definitions for the backtesting engine

// ============================================
// CORE TYPES
// ============================================

export type AssetClass = 'forex' | 'crypto' | 'stocks' | 'commodities'
export type PositionSide = 'long' | 'short'
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit'
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'rejected'

// ============================================
// MARKET DATA TYPES
// ============================================

export interface OHLCVCandle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketDataPoint {
  symbol: string
  timestamp: number
  price: number
  volume?: number
  bid?: number
  ask?: number
}

export interface HistoricalDataRequest {
  symbol: string
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w'
  startDate: Date
  endDate: Date
  limit?: number
}

// ============================================
// STRATEGY TYPES
// ============================================

export interface StrategyParameter {
  name: string
  type: 'number' | 'select' | 'boolean' | 'string'
  default: any
  min?: number
  max?: number
  step?: number
  options?: string[]
  description: string
}

export interface StrategyDefinition {
  id: string
  name: string
  description: string
  category: 'trend_following' | 'mean_reversion' | 'breakout' | 'momentum' | 'scalping' | 'swing' | 'custom'
  assetClasses: AssetClass[]
  parameters: StrategyParameter[]
  indicators: string[]
  entryRules: string[]
  exitRules: string[]
  riskManagement: {
    stopLoss?: number | 'atr' | 'support'
    takeProfit?: number | 'atr' | 'resistance'
    trailingStop?: boolean
    positionSizing: 'fixed' | 'risk_parity' | 'kelly'
  }
  timeframes: string[]
}

export interface StrategyInstance {
  id: string
  userId: string
  strategyId: string
  name: string
  symbol: string
  timeframe: string
  parameters: Record<string, any>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================
// BACKTEST CONFIGURATION
// ============================================

export interface BacktestConfig {
  strategy: StrategyDefinition
  symbol: string
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w'
  startDate: Date
  endDate: Date
  initialCapital: number
  commission: number // e.g., 0.001 = 0.1%
  slippage: number // e.g., 0.0005 = 0.05%
  leverage: number
  positionSize: number // Percentage of capital or fixed amount
  maxPositions: number
  riskPerTrade: number // Percentage of capital to risk
  stopLoss?: number
  takeProfit?: number
  trailingStop?: boolean
  parameters: Record<string, any>
}

// ============================================
// POSITION & TRADE TYPES
// ============================================

export interface Position {
  id: string
  symbol: string
  side: PositionSide
  size: number
  entryPrice: number
  currentPrice: number
  stopLoss?: number
  takeProfit?: number
  trailingStop?: number
  pnl: number
  pnlPercent: number
  openTime: number
  margin: number
}

export interface Trade {
  id: string
  symbol: string
  side: PositionSide
  size: number
  entryPrice: number
  exitPrice: number
  entryTime: number
  exitTime: number
  pnl: number
  pnlPercent: number
  commission: number
  slippage: number
  stopLoss?: number
  takeProfit?: number
  exitReason: 'take_profit' | 'stop_loss' | 'signal' | 'time_exit' | 'margin_call'
  metrics: TradeMetrics
}

export interface TradeMetrics {
  holdingPeriod: number // in bars
  maxDrawdown: number
  maxProfit: number
  riskRewardRatio: number
  mfe: number // Maximum Favorable Excursion
  mae: number // Maximum Adverse Excursion
}

// ============================================
// BACKTEST RESULTS
// ============================================

export interface BacktestResults {
  id: string
  config: BacktestConfig
  summary: BacktestSummary
  trades: Trade[]
  equityCurve: EquityPoint[]
  drawdownCurve: DrawdownPoint[]
  monthlyReturns: MonthlyReturn[]
  statistics: BacktestStatistics
  metrics: PerformanceMetrics
  generatedAt: Date
}

export interface BacktestSummary {
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  profitFactor: number
  maxDrawdown: number
  maxDrawdownPercent: number
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
  averageWin: number
  averageLoss: number
  largestWin: number
  largestLoss: number
  averageHoldingPeriod: number
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
  finalCapital: number
}

export interface EquityPoint {
  timestamp: number
  equity: number
  cash: number
  positionsValue: number
  drawdown: number
  drawdownPercent: number
}

export interface DrawdownPoint {
  timestamp: number
  drawdown: number
  drawdownPercent: number
  duration: number
}

export interface MonthlyReturn {
  year: number
  month: number
  return: number
  returnPercent: number
  trades: number
  winRate: number
}

export interface BacktestStatistics {
  // Returns
  dailyReturns: number[]
  weeklyReturns: number[]
  monthlyReturns: number[]
  
  // Volatility
  volatilityDaily: number
  volatilityAnnualized: number
  
  // Risk Metrics
  valueAtRisk95: number
  valueAtRisk99: number
  expectedShortfall: number
  
  // Distribution
  skewness: number
  kurtosis: number
  
  // Trade Statistics
  averageTradeReturn: number
  medianTradeReturn: number
  stdDevTradeReturn: number
  
  // Time Statistics
  averageBarsInTrade: number
  medianBarsInTrade: number
  maxBarsInTrade: number
  minBarsInTrade: number
  
  // Streak Statistics
  currentStreak: number
  longestWinStreak: number
  longestLoseStreak: number
}

export interface PerformanceMetrics {
  // Risk-Adjusted Returns
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
  treynorRatio: number
  informationRatio: number
  
  // Risk Metrics
  maxDrawdown: number
  maxDrawdownDuration: number
  recoveryFactor: number
  riskOfRuin: number
  
  // Profit Metrics
  profitFactor: number
  payoffRatio: number
  expectancy: number
  
  // Efficiency Metrics
  alpha: number
  beta: number
  rSquared: number
  trackingError: number
  
  // Trade Metrics
  tradeEfficiency: number
  entryEfficiency: number
  exitEfficiency: number
}

// ============================================
// SIGNAL TYPES
// ============================================

export type SignalType = 'buy' | 'sell' | 'hold' | 'close_long' | 'close_short'

export interface TradingSignal {
  timestamp: number
  symbol: string
  type: SignalType
  price: number
  strength: number // 0-1
  reason: string
  indicators: Record<string, number>
}

export interface SignalGenerator {
  name: string
  generate: (data: OHLCVCandle[], indicators: Record<string, number[]>) => TradingSignal[]
}

// ============================================
// OPTIMIZATION TYPES
// ============================================

export interface OptimizationConfig {
  strategy: StrategyDefinition
  symbol: string
  timeframe: string
  startDate: Date
  endDate: Date
  parameters: {
    name: string
    min: number
    max: number
    step: number
  }[]
  optimizationMetric: 'sharpe' | 'return' | 'win_rate' | 'profit_factor' | 'calmar'
  walkForward: boolean
  inSampleRatio: number
}

export interface OptimizationResult {
  parameters: Record<string, any>
  metric: number
  trades: number
  winRate: number
  maxDrawdown: number
}

// ============================================
// REPORT TYPES
// ============================================

export interface BacktestReport {
  id: string
  name: string
  strategy: StrategyDefinition
  results: BacktestResults
  comparison?: {
    benchmark: string
    benchmarkReturn: number
    excessReturn: number
  }
  insights: string[]
  recommendations: string[]
  createdAt: Date
}
