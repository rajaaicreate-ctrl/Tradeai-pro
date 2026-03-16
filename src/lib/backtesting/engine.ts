// Backtesting Engine
// Core engine for running strategy backtests

import {
  BacktestConfig,
  BacktestResults,
  BacktestSummary,
  Trade,
  Position,
  OHLCVCandle,
  EquityPoint,
  DrawdownPoint,
  MonthlyReturn,
  BacktestStatistics,
  PerformanceMetrics,
  TradingSignal,
  SignalType,
  StrategyDefinition
} from './types'

import {
  SMA, EMA, RSI, MACD, ATR, BollingerBands, Stochastic, ADX, OBV, MFI
} from './indicators'

// ============================================
// BACKTESTING ENGINE CLASS
// ============================================

export class BacktestEngine {
  private config: BacktestConfig
  private data: OHLCVCandle[] = []
  private indicators: Record<string, number[]> = {}
  private positions: Position[] = []
  private trades: Trade[] = []
  private equityCurve: EquityPoint[] = []
  private drawdownCurve: DrawdownPoint[] = []
  private capital: number = 0
  private cash: number = 0
  private peakEquity: number = 0
  private currentDrawdown: number = 0
  private tradeIdCounter: number = 0

  constructor(config: BacktestConfig) {
    this.config = config
    this.capital = config.initialCapital
    this.cash = config.initialCapital
  }

  // ============================================
  // DATA LOADING
  // ============================================

  loadData(data: OHLCVCandle[]): void {
    this.data = data
    this.calculateIndicators()
  }

  private calculateIndicators(): void {
    const closes = this.data.map(d => d.close)
    const highs = this.data.map(d => d.high)
    const lows = this.data.map(d => d.low)
    const volumes = this.data.map(d => d.volume)

    // Calculate common indicators
    this.indicators = {
      sma20: SMA(closes, 20),
      sma50: SMA(closes, 50),
      sma200: SMA(closes, 200),
      ema12: EMA(closes, 12),
      ema26: EMA(closes, 26),
      rsi14: RSI(closes, 14),
      atr14: ATR(highs, lows, closes, 14),
      obv: OBV(closes, volumes),
      mfi14: MFI(highs, lows, closes, volumes, 14)
    }

    // MACD
    const macd = MACD(closes)
    this.indicators.macd = macd.macd
    this.indicators.macdSignal = macd.signal
    this.indicators.macdHistogram = macd.histogram

    // Bollinger Bands
    const bb = BollingerBands(closes)
    this.indicators.bbUpper = bb.upper
    this.indicators.bbMiddle = bb.middle
    this.indicators.bbLower = bb.lower
    this.indicators.bbBandwidth = bb.bandwidth

    // Stochastic
    const stoch = Stochastic(highs, lows, closes)
    this.indicators.stochK = stoch.k
    this.indicators.stochD = stoch.d

    // ADX
    const adx = ADX(highs, lows, closes)
    this.indicators.adx = adx.adx
    this.indicators.plusDI = adx.plusDI
    this.indicators.minusDI = adx.minusDI
  }

  // ============================================
  // BACKTEST EXECUTION
  // ============================================

  async run(): Promise<BacktestResults> {
    const startTime = Date.now()

    // Reset state
    this.positions = []
    this.trades = []
    this.equityCurve = []
    this.drawdownCurve = []
    this.capital = this.config.initialCapital
    this.cash = this.config.initialCapital
    this.peakEquity = this.config.initialCapital
    this.currentDrawdown = 0
    this.tradeIdCounter = 0

    // Iterate through data
    for (let i = 0; i < this.data.length; i++) {
      const candle = this.data[i]
      
      // Skip warmup period for indicators
      if (i < 50) {
        this.recordEquity(i)
        continue
      }

      // Generate signals based on strategy
      const signal = this.generateSignal(i)

      // Execute trades based on signals
      if (signal) {
        this.executeSignal(signal, i)
      }

      // Update positions with current prices
      this.updatePositions(candle, i)

      // Check stop losses and take profits
      this.checkExits(candle, i)

      // Record equity
      this.recordEquity(i)
    }

    // Close any remaining positions
    this.closeAllPositions(this.data.length - 1)

    // Calculate results
    const results = this.calculateResults()

    return results
  }

  // ============================================
  // SIGNAL GENERATION
  // ============================================

  private generateSignal(index: number): TradingSignal | null {
    const strategy = this.config.strategy
    const params = this.config.parameters
    
    // Get current indicator values
    const current: Record<string, number> = {}
    for (const [key, values] of Object.entries(this.indicators)) {
      current[key] = values[index]
    }

    const prev: Record<string, number> = {}
    for (const [key, values] of Object.entries(this.indicators)) {
      prev[key] = values[index - 1]
    }

    const candle = this.data[index]
    const prevCandle = this.data[index - 1]

    // Strategy-specific signal generation
    switch (strategy.id) {
      case 'sma_crossover':
        return this.smaCrossoverSignal(index, current, prev, params)
      
      case 'rsi_mean_reversion':
        return this.rsiMeanReversionSignal(index, current, params)
      
      case 'macd_strategy':
        return this.macdSignal(index, current, prev, params)
      
      case 'bollinger_bands':
        return this.bollingerBandSignal(index, current, candle, params)
      
      case 'trend_follow':
        return this.trendFollowSignal(index, current, params)
      
      case 'breakout':
        return this.breakoutSignal(index, current, candle, params)
      
      case 'scalping':
        return this.scalpingSignal(index, current, prev, candle, params)
      
      default:
        return this.defaultSignal(index, current, prev, params)
    }
  }

  // ============================================
  // STRATEGY SIGNALS
  // ============================================

  private smaCrossoverSignal(
    index: number,
    current: Record<string, number>,
    prev: Record<string, number>,
    params: Record<string, any>
  ): TradingSignal | null {
    const fastPeriod = params.fastPeriod || 20
    const slowPeriod = params.slowPeriod || 50
    
    const fastKey = `sma${fastPeriod}`
    const slowKey = `sma${slowPeriod}`
    
    // Calculate if not already computed
    if (!this.indicators[fastKey]) {
      this.indicators[fastKey] = SMA(this.data.map(d => d.close), fastPeriod)
    }
    if (!this.indicators[slowKey]) {
      this.indicators[slowKey] = SMA(this.data.map(d => d.close), slowPeriod)
    }
    
    const fastCurrent = this.indicators[fastKey][index]
    const slowCurrent = this.indicators[slowKey][index]
    const fastPrev = this.indicators[fastKey][index - 1]
    const slowPrev = this.indicators[slowKey][index - 1]

    if (isNaN(fastCurrent) || isNaN(slowCurrent)) return null

    // Golden cross - fast crosses above slow
    if (fastPrev <= slowPrev && fastCurrent > slowCurrent) {
      return {
        timestamp: this.data[index].timestamp,
        symbol: this.config.symbol,
        type: 'buy',
        price: this.data[index].close,
        strength: 0.8,
        reason: 'Golden Cross - SMA crossover bullish',
        indicators: current
      }
    }

    // Death cross - fast crosses below slow
    if (fastPrev >= slowPrev && fastCurrent < slowCurrent) {
      return {
        timestamp: this.data[index].timestamp,
        symbol: this.config.symbol,
        type: 'sell',
        price: this.data[index].close,
        strength: 0.8,
        reason: 'Death Cross - SMA crossover bearish',
        indicators: current
      }
    }

    return null
  }

  private rsiMeanReversionSignal(
    index: number,
    current: Record<string, number>,
    params: Record<string, any>
  ): TradingSignal | null {
    const rsi = current.rsi14
    const oversold = params.oversold || 30
    const overbought = params.overbought || 70

    if (isNaN(rsi)) return null

    // RSI oversold - buy signal
    if (rsi < oversold) {
      return {
        timestamp: this.data[index].timestamp,
        symbol: this.config.symbol,
        type: 'buy',
        price: this.data[index].close,
        strength: 1 - (rsi / oversold),
        reason: `RSI oversold at ${rsi.toFixed(1)}`,
        indicators: current
      }
    }

    // RSI overbought - sell signal
    if (rsi > overbought) {
      return {
        timestamp: this.data[index].timestamp,
        symbol: this.config.symbol,
        type: 'sell',
        price: this.data[index].close,
        strength: (rsi - overbought) / (100 - overbought),
        reason: `RSI overbought at ${rsi.toFixed(1)}`,
        indicators: current
      }
    }

    return null
  }

  private macdSignal(
    index: number,
    current: Record<string, number>,
    prev: Record<string, number>,
    params: Record<string, any>
  ): TradingSignal | null {
    const macd = current.macd
    const signal = current.macdSignal
    const histogram = current.macdHistogram
    const prevHistogram = prev.macdHistogram

    if (isNaN(macd) || isNaN(signal)) return null

    // MACD crosses above signal - bullish
    if (prevHistogram <= 0 && histogram > 0) {
      return {
        timestamp: this.data[index].timestamp,
        symbol: this.config.symbol,
        type: 'buy',
        price: this.data[index].close,
        strength: Math.min(1, Math.abs(histogram) * 10),
        reason: 'MACD bullish crossover',
        indicators: current
      }
    }

    // MACD crosses below signal - bearish
    if (prevHistogram >= 0 && histogram < 0) {
      return {
        timestamp: this.data[index].timestamp,
        symbol: this.config.symbol,
        type: 'sell',
        price: this.data[index].close,
        strength: Math.min(1, Math.abs(histogram) * 10),
        reason: 'MACD bearish crossover',
        indicators: current
      }
    }

    return null
  }

  private bollingerBandSignal(
    index: number,
    current: Record<string, number>,
    candle: OHLCVCandle,
    params: Record<string, any>
  ): TradingSignal | null {
    const { bbUpper, bbLower, bbMiddle } = current
    
    if (isNaN(bbUpper) || isNaN(bbLower)) return null

    // Price touches lower band - potential bounce
    if (candle.close <= bbLower) {
      return {
        timestamp: candle.timestamp,
        symbol: this.config.symbol,
        type: 'buy',
        price: candle.close,
        strength: 0.7,
        reason: 'Price at lower Bollinger Band',
        indicators: current
      }
    }

    // Price touches upper band - potential reversal
    if (candle.close >= bbUpper) {
      return {
        timestamp: candle.timestamp,
        symbol: this.config.symbol,
        type: 'sell',
        price: candle.close,
        strength: 0.7,
        reason: 'Price at upper Bollinger Band',
        indicators: current
      }
    }

    return null
  }

  private trendFollowSignal(
    index: number,
    current: Record<string, number>,
    params: Record<string, any>
  ): TradingSignal | null {
    const { sma20, sma50, sma200, adx } = current
    const candle = this.data[index]

    if (isNaN(sma20) || isNaN(sma50) || isNaN(adx)) return null

    // Strong trend required (ADX > 25)
    if (adx < (params.adxThreshold || 25)) return null

    // Uptrend - price above both SMAs
    if (candle.close > sma20 && sma20 > sma50) {
      return {
        timestamp: candle.timestamp,
        symbol: this.config.symbol,
        type: 'buy',
        price: candle.close,
        strength: adx / 100,
        reason: `Trend following long (ADX: ${adx.toFixed(1)})`,
        indicators: current
      }
    }

    // Downtrend - price below both SMAs
    if (candle.close < sma20 && sma20 < sma50) {
      return {
        timestamp: candle.timestamp,
        symbol: this.config.symbol,
        type: 'sell',
        price: candle.close,
        strength: adx / 100,
        reason: `Trend following short (ADX: ${adx.toFixed(1)})`,
        indicators: current
      }
    }

    return null
  }

  private breakoutSignal(
    index: number,
    current: Record<string, number>,
    candle: OHLCVCandle,
    params: Record<string, any>
  ): TradingSignal | null {
    const lookback = params.lookback || 20
    
    // Find high/low over lookback period
    let highestHigh = -Infinity
    let lowestLow = Infinity
    
    for (let i = index - lookback; i < index; i++) {
      if (i >= 0) {
        highestHigh = Math.max(highestHigh, this.data[i].high)
        lowestLow = Math.min(lowestLow, this.data[i].low)
      }
    }

    // Breakout above resistance
    if (candle.close > highestHigh) {
      return {
        timestamp: candle.timestamp,
        symbol: this.config.symbol,
        type: 'buy',
        price: candle.close,
        strength: 0.8,
        reason: `Breakout above ${highestHigh.toFixed(2)}`,
        indicators: current
      }
    }

    // Breakdown below support
    if (candle.close < lowestLow) {
      return {
        timestamp: candle.timestamp,
        symbol: this.config.symbol,
        type: 'sell',
        price: candle.close,
        strength: 0.8,
        reason: `Breakdown below ${lowestLow.toFixed(2)}`,
        indicators: current
      }
    }

    return null
  }

  private scalpingSignal(
    index: number,
    current: Record<string, number>,
    prev: Record<string, number>,
    candle: OHLCVCandle,
    params: Record<string, any>
  ): TradingSignal | null {
    const { rsi14, stochK, stochD } = current
    const prevRsi = prev.rsi14
    const prevStochK = prev.stochK

    if (isNaN(rsi14) || isNaN(stochK)) return null

    // Combined RSI + Stochastic for scalping
    // Buy when RSI turns up from oversold and Stochastic confirms
    if (rsi14 < 40 && prevRsi < rsi14 && stochK < 30 && stochK > prevStochK) {
      return {
        timestamp: candle.timestamp,
        symbol: this.config.symbol,
        type: 'buy',
        price: candle.close,
        strength: 0.6,
        reason: 'Scalping long - RSI & Stochastic turning up',
        indicators: current
      }
    }

    // Sell when RSI turns down from overbought and Stochastic confirms
    if (rsi14 > 60 && prevRsi > rsi14 && stochK > 70 && stochK < prevStochK) {
      return {
        timestamp: candle.timestamp,
        symbol: this.config.symbol,
        type: 'sell',
        price: candle.close,
        strength: 0.6,
        reason: 'Scalping short - RSI & Stochastic turning down',
        indicators: current
      }
    }

    return null
  }

  private defaultSignal(
    index: number,
    current: Record<string, number>,
    prev: Record<string, number>,
    params: Record<string, any>
  ): TradingSignal | null {
    // Default: use SMA crossover with RSI confirmation
    const { sma20, sma50, rsi14 } = current
    const candle = this.data[index]

    if (isNaN(sma20) || isNaN(sma50) || isNaN(rsi14)) return null

    if (candle.close > sma20 && sma20 > sma50 && rsi14 < 70) {
      return {
        timestamp: candle.timestamp,
        symbol: this.config.symbol,
        type: 'buy',
        price: candle.close,
        strength: 0.5,
        reason: 'Default strategy - bullish conditions',
        indicators: current
      }
    }

    if (candle.close < sma20 && sma20 < sma50 && rsi14 > 30) {
      return {
        timestamp: candle.timestamp,
        symbol: this.config.symbol,
        type: 'sell',
        price: candle.close,
        strength: 0.5,
        reason: 'Default strategy - bearish conditions',
        indicators: current
      }
    }

    return null
  }

  // ============================================
  // TRADE EXECUTION
  // ============================================

  private executeSignal(signal: TradingSignal, index: number): void {
    const candle = this.data[index]

    switch (signal.type) {
      case 'buy':
        if (this.positions.length < this.config.maxPositions) {
          this.openPosition('long', signal.price, index)
        }
        break

      case 'sell':
        // Close long positions first
        const longPositions = this.positions.filter(p => p.side === 'long')
        if (longPositions.length > 0) {
          longPositions.forEach(p => this.closePosition(p, signal.price, index, 'signal'))
        } else if (this.config.leverage > 1 && this.positions.length < this.config.maxPositions) {
          // Open short if leverage allowed
          this.openPosition('short', signal.price, index)
        }
        break

      case 'close_long':
        this.positions
          .filter(p => p.side === 'long')
          .forEach(p => this.closePosition(p, signal.price, index, 'signal'))
        break

      case 'close_short':
        this.positions
          .filter(p => p.side === 'short')
          .forEach(p => this.closePosition(p, signal.price, index, 'signal'))
        break
    }
  }

  private openPosition(side: 'long' | 'short', price: number, index: number): void {
    const atr = this.indicators.atr14[index]
    
    // Calculate position size based on risk
    const riskAmount = this.capital * (this.config.riskPerTrade / 100)
    const stopLossDistance = this.config.stopLoss || (atr * 2) || price * 0.02
    const size = Math.min(
      riskAmount / stopLossDistance,
      (this.cash * this.config.positionSize / 100) / price
    )

    // Apply slippage
    const executionPrice = side === 'long' 
      ? price * (1 + this.config.slippage)
      : price * (1 - this.config.slippage)

    // Calculate commission
    const commission = size * executionPrice * this.config.commission

    // Check if enough cash
    const marginRequired = (size * executionPrice / this.config.leverage) + commission
    if (marginRequired > this.cash) return

    const position: Position = {
      id: `pos-${++this.tradeIdCounter}`,
      symbol: this.config.symbol,
      side,
      size,
      entryPrice: executionPrice,
      currentPrice: executionPrice,
      stopLoss: side === 'long' 
        ? executionPrice - stopLossDistance
        : executionPrice + stopLossDistance,
      takeProfit: this.config.takeProfit 
        ? (side === 'long' 
          ? executionPrice + (executionPrice * this.config.takeProfit / 100)
          : executionPrice - (executionPrice * this.config.takeProfit / 100))
        : undefined,
      pnl: 0,
      pnlPercent: 0,
      openTime: this.data[index].timestamp,
      margin: marginRequired
    }

    this.positions.push(position)
    this.cash -= marginRequired
  }

  private closePosition(
    position: Position,
    price: number,
    index: number,
    reason: Trade['exitReason']
  ): void {
    // Apply slippage
    const executionPrice = position.side === 'long'
      ? price * (1 - this.config.slippage)
      : price * (1 + this.config.slippage)

    // Calculate PnL
    const pnl = position.side === 'long'
      ? (executionPrice - position.entryPrice) * position.size
      : (position.entryPrice - executionPrice) * position.size

    const pnlPercent = (pnl / position.margin) * 100

    // Calculate commission
    const commission = position.size * executionPrice * this.config.commission
    const totalPnl = pnl - commission

    // Create trade record
    const trade: Trade = {
      id: `trade-${position.id}`,
      symbol: position.symbol,
      side: position.side,
      size: position.size,
      entryPrice: position.entryPrice,
      exitPrice: executionPrice,
      entryTime: position.openTime,
      exitTime: this.data[index].timestamp,
      pnl: totalPnl,
      pnlPercent,
      commission,
      slippage: Math.abs(executionPrice - price) * position.size,
      stopLoss: position.stopLoss,
      takeProfit: position.takeProfit,
      exitReason: reason,
      metrics: {
        holdingPeriod: index - this.data.findIndex(d => d.timestamp === position.openTime),
        maxDrawdown: 0,
        maxProfit: 0,
        riskRewardRatio: position.stopLoss ? 
          Math.abs(position.takeProfit || price - position.entryPrice) / Math.abs(position.entryPrice - position.stopLoss) : 0,
        mfe: 0,
        mae: 0
      }
    }

    this.trades.push(trade)

    // Update capital
    this.cash += position.margin + totalPnl
    this.capital = this.cash

    // Remove position
    this.positions = this.positions.filter(p => p.id !== position.id)
  }

  private closeAllPositions(index: number): void {
    const price = this.data[index].close
    this.positions.forEach(p => this.closePosition(p, price, index, 'signal'))
  }

  // ============================================
  // POSITION MANAGEMENT
  // ============================================

  private updatePositions(candle: OHLCVCandle, index: number): void {
    for (const position of this.positions) {
      position.currentPrice = candle.close

      // Calculate unrealized PnL
      const unrealizedPnl = position.side === 'long'
        ? (candle.close - position.entryPrice) * position.size
        : (position.entryPrice - candle.close) * position.size

      position.pnl = unrealizedPnl
      position.pnlPercent = (unrealizedPnl / position.margin) * 100

      // Update trailing stop if enabled
      if (this.config.trailingStop && position.stopLoss) {
        const atr = this.indicators.atr14[index]
        const trailDistance = atr * 2

        if (position.side === 'long') {
          const newStopLoss = Math.max(position.stopLoss, candle.close - trailDistance)
          position.trailingStop = newStopLoss
        } else {
          const newStopLoss = Math.min(position.stopLoss, candle.close + trailDistance)
          position.trailingStop = newStopLoss
        }
      }
    }
  }

  private checkExits(candle: OHLCVCandle, index: number): void {
    for (const position of [...this.positions]) {
      // Check stop loss
      if (position.stopLoss) {
        const stopPrice = position.trailingStop || position.stopLoss
        if (position.side === 'long' && candle.low <= stopPrice) {
          this.closePosition(position, stopPrice, index, 'stop_loss')
          continue
        }
        if (position.side === 'short' && candle.high >= stopPrice) {
          this.closePosition(position, stopPrice, index, 'stop_loss')
          continue
        }
      }

      // Check take profit
      if (position.takeProfit) {
        if (position.side === 'long' && candle.high >= position.takeProfit) {
          this.closePosition(position, position.takeProfit, index, 'take_profit')
          continue
        }
        if (position.side === 'short' && candle.low <= position.takeProfit) {
          this.closePosition(position, position.takeProfit, index, 'take_profit')
          continue
        }
      }

      // Check margin call
      if (position.pnlPercent < -50) {
        this.closePosition(position, candle.close, index, 'margin_call')
      }
    }
  }

  // ============================================
  // EQUITY TRACKING
  // ============================================

  private recordEquity(index: number): void {
    const candle = this.data[index]
    
    // Calculate positions value
    const positionsValue = this.positions.reduce((sum, p) => {
      return sum + p.size * p.currentPrice / this.config.leverage
    }, 0)

    const equity = this.cash + positionsValue

    // Update peak and drawdown
    this.peakEquity = Math.max(this.peakEquity, equity)
    this.currentDrawdown = this.peakEquity - equity
    const drawdownPercent = (this.currentDrawdown / this.peakEquity) * 100

    this.equityCurve.push({
      timestamp: candle.timestamp,
      equity,
      cash: this.cash,
      positionsValue,
      drawdown: this.currentDrawdown,
      drawdownPercent
    })

    this.drawdownCurve.push({
      timestamp: candle.timestamp,
      drawdown: this.currentDrawdown,
      drawdownPercent,
      duration: 0
    })

    // Update capital
    this.capital = equity
  }

  // ============================================
  // RESULTS CALCULATION
  // ============================================

  private calculateResults(): BacktestResults {
    const summary = this.calculateSummary()
    const monthlyReturns = this.calculateMonthlyReturns()
    const statistics = this.calculateStatistics()
    const metrics = this.calculateMetrics()

    return {
      id: `backtest-${Date.now()}`,
      config: this.config,
      summary,
      trades: this.trades,
      equityCurve: this.equityCurve,
      drawdownCurve: this.drawdownCurve,
      monthlyReturns,
      statistics,
      metrics,
      generatedAt: new Date()
    }
  }

  private calculateSummary(): BacktestSummary {
    const finalEquity = this.equityCurve[this.equityCurve.length - 1]?.equity || this.config.initialCapital
    const totalReturn = finalEquity - this.config.initialCapital
    const totalReturnPercent = (totalReturn / this.config.initialCapital) * 100

    const winningTrades = this.trades.filter(t => t.pnl > 0)
    const losingTrades = this.trades.filter(t => t.pnl <= 0)

    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))

    const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0

    // Calculate max drawdown
    const maxDrawdown = Math.max(...this.drawdownCurve.map(d => d.drawdown))
    const maxDrawdownPercent = Math.max(...this.drawdownCurve.map(d => d.drawdownPercent))

    // Calculate Sharpe Ratio (assuming risk-free rate of 2%)
    const returns = this.trades.map(t => t.pnlPercent)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length || 0
    const stdReturn = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length) || 1
    const sharpeRatio = (avgReturn - 2/252) / stdReturn * Math.sqrt(252)

    // Calculate consecutive streaks
    let maxConsecWins = 0
    let maxConsecLosses = 0
    let currentWins = 0
    let currentLosses = 0

    for (const trade of this.trades) {
      if (trade.pnl > 0) {
        currentWins++
        currentLosses = 0
        maxConsecWins = Math.max(maxConsecWins, currentWins)
      } else {
        currentLosses++
        currentWins = 0
        maxConsecLosses = Math.max(maxConsecLosses, currentLosses)
      }
    }

    // Annualized return
    const days = (this.config.endDate.getTime() - this.config.startDate.getTime()) / (1000 * 60 * 60 * 24)
    const years = days / 365
    const annualizedReturn = years > 0 ? (Math.pow(finalEquity / this.config.initialCapital, 1 / years) - 1) * 100 : 0

    return {
      totalReturn,
      totalReturnPercent,
      annualizedReturn,
      totalTrades: this.trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: this.trades.length > 0 ? (winningTrades.length / this.trades.length) * 100 : 0,
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
      maxDrawdown,
      maxDrawdownPercent,
      sharpeRatio,
      sortinoRatio: sharpeRatio * 1.2, // Approximation
      calmarRatio: annualizedReturn / (maxDrawdownPercent || 1),
      averageWin: avgWin,
      averageLoss: avgLoss,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0,
      largestLoss: losingTrades.length > 0 ? Math.max(...losingTrades.map(t => Math.abs(t.pnl))) : 0,
      averageHoldingPeriod: this.trades.length > 0 
        ? this.trades.reduce((sum, t) => sum + t.metrics.holdingPeriod, 0) / this.trades.length 
        : 0,
      maxConsecutiveWins: maxConsecWins,
      maxConsecutiveLosses: maxConsecLosses,
      finalCapital: finalEquity
    }
  }

  private calculateMonthlyReturns(): MonthlyReturn[] {
    const monthlyData: Record<string, { trades: Trade[]; return: number }> = {}

    for (const trade of this.trades) {
      const date = new Date(trade.exitTime)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      
      if (!monthlyData[key]) {
        monthlyData[key] = { trades: [], return: 0 }
      }
      
      monthlyData[key].trades.push(trade)
      monthlyData[key].return += trade.pnl
    }

    return Object.entries(monthlyData).map(([key, data]) => {
      const [year, month] = key.split('-').map(Number)
      const wins = data.trades.filter(t => t.pnl > 0).length
      
      return {
        year,
        month,
        return: data.return,
        returnPercent: (data.return / this.config.initialCapital) * 100,
        trades: data.trades.length,
        winRate: data.trades.length > 0 ? (wins / data.trades.length) * 100 : 0
      }
    })
  }

  private calculateStatistics(): BacktestStatistics {
    const returns = this.trades.map(t => t.pnlPercent)
    
    const avgReturn = returns.length > 0 
      ? returns.reduce((a, b) => a + b, 0) / returns.length 
      : 0
    
    const sortedReturns = [...returns].sort((a, b) => a - b)
    const medianReturn = sortedReturns.length > 0
      ? sortedReturns[Math.floor(sortedReturns.length / 2)]
      : 0

    const stdDev = returns.length > 0
      ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
      : 0

    // Calculate skewness
    const skewness = returns.length > 0
      ? returns.reduce((sum, r) => sum + Math.pow((r - avgReturn) / (stdDev || 1), 3), 0) / returns.length
      : 0

    // Calculate kurtosis
    const kurtosis = returns.length > 0
      ? returns.reduce((sum, r) => sum + Math.pow((r - avgReturn) / (stdDev || 1), 4), 0) / returns.length - 3
      : 0

    const holdingPeriods = this.trades.map(t => t.metrics.holdingPeriod)

    return {
      dailyReturns: [],
      weeklyReturns: [],
      monthlyReturns: returns,
      volatilityDaily: stdDev,
      volatilityAnnualized: stdDev * Math.sqrt(252),
      valueAtRisk95: sortedReturns[Math.floor(sortedReturns.length * 0.05)] || 0,
      valueAtRisk99: sortedReturns[Math.floor(sortedReturns.length * 0.01)] || 0,
      expectedShortfall: 0,
      skewness,
      kurtosis,
      averageTradeReturn: avgReturn,
      medianTradeReturn: medianReturn,
      stdDevTradeReturn: stdDev,
      averageBarsInTrade: holdingPeriods.length > 0
        ? holdingPeriods.reduce((a, b) => a + b, 0) / holdingPeriods.length
        : 0,
      medianBarsInTrade: holdingPeriods.length > 0
        ? holdingPeriods.sort((a, b) => a - b)[Math.floor(holdingPeriods.length / 2)]
        : 0,
      maxBarsInTrade: Math.max(...holdingPeriods, 0),
      minBarsInTrade: Math.min(...holdingPeriods.filter(h => h > 0), 0),
      currentStreak: 0,
      longestWinStreak: 0,
      longestLoseStreak: 0
    }
  }

  private calculateMetrics(): PerformanceMetrics {
    const summary = this.calculateSummary()

    return {
      sharpeRatio: summary.sharpeRatio,
      sortinoRatio: summary.sortinoRatio,
      calmarRatio: summary.calmarRatio,
      treynorRatio: 0,
      informationRatio: 0,
      maxDrawdown: summary.maxDrawdown,
      maxDrawdownDuration: 0,
      recoveryFactor: summary.maxDrawdown > 0 ? summary.totalReturn / summary.maxDrawdown : 0,
      riskOfRuin: 0,
      profitFactor: summary.profitFactor,
      payoffRatio: summary.averageLoss > 0 ? summary.averageWin / summary.averageLoss : 0,
      expectancy: (summary.winRate / 100 * summary.averageWin) - ((100 - summary.winRate) / 100 * summary.averageLoss),
      alpha: 0,
      beta: 0,
      rSquared: 0,
      trackingError: 0,
      tradeEfficiency: 0,
      entryEfficiency: 0,
      exitEfficiency: 0
    }
  }
}

// Export helper function to run backtest
export async function runBacktest(
  config: BacktestConfig,
  data: OHLCVCandle[]
): Promise<BacktestResults> {
  const engine = new BacktestEngine(config)
  engine.loadData(data)
  return engine.run()
}
