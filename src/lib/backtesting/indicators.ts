// Technical Indicators for Strategy Backtesting
// Comprehensive library of technical analysis indicators

import { OHLCVCandle } from './types'

// ============================================
// MOVING AVERAGES
// ============================================

/**
 * Simple Moving Average (SMA)
 */
export function SMA(data: number[], period: number): number[] {
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
      continue
    }
    
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j]
    }
    result.push(sum / period)
  }
  
  return result
}

/**
 * Exponential Moving Average (EMA)
 */
export function EMA(data: number[], period: number): number[] {
  const result: number[] = []
  const multiplier = 2 / (period + 1)
  
  // First EMA is SMA
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i]
    result.push(NaN)
  }
  result[period - 1] = sum / period
  
  // Calculate EMA
  for (let i = period; i < data.length; i++) {
    result.push((data[i] - result[i - 1]) * multiplier + result[i - 1])
  }
  
  return result
}

/**
 * Weighted Moving Average (WMA)
 */
export function WMA(data: number[], period: number): number[] {
  const result: number[] = []
  const weights = Array.from({ length: period }, (_, i) => i + 1)
  const weightSum = weights.reduce((a, b) => a + b, 0)
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
      continue
    }
    
    let weightedSum = 0
    for (let j = 0; j < period; j++) {
      weightedSum += data[i - j] * weights[period - 1 - j]
    }
    result.push(weightedSum / weightSum)
  }
  
  return result
}

/**
 * Hull Moving Average (HMA)
 */
export function HMA(data: number[], period: number): number[] {
  const halfPeriod = Math.floor(period / 2)
  const sqrtPeriod = Math.floor(Math.sqrt(period))
  
  const wmaHalf = WMA(data, halfPeriod)
  const wmaFull = WMA(data, period)
  
  const rawHMA = data.map((_, i) => {
    if (isNaN(wmaHalf[i]) || isNaN(wmaFull[i])) return NaN
    return 2 * wmaHalf[i] - wmaFull[i]
  })
  
  return WMA(rawHMA, sqrtPeriod)
}

/**
 * Volume Weighted Moving Average (VWMA)
 */
export function VWMA(closes: number[], volumes: number[], period: number): number[] {
  const result: number[] = []
  
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
      continue
    }
    
    let sumPV = 0
    let sumV = 0
    for (let j = 0; j < period; j++) {
      sumPV += closes[i - j] * volumes[i - j]
      sumV += volumes[i - j]
    }
    result.push(sumPV / sumV)
  }
  
  return result
}

// ============================================
// MOMENTUM INDICATORS
// ============================================

/**
 * Relative Strength Index (RSI)
 */
export function RSI(data: number[], period: number = 14): number[] {
  const result: number[] = []
  const gains: number[] = []
  const losses: number[] = []
  
  // Calculate price changes
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      gains.push(0)
      losses.push(0)
      result.push(NaN)
      continue
    }
    
    const change = data[i] - data[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }
  
  // Calculate RSI
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(NaN)
      continue
    }
    
    let avgGain = 0
    let avgLoss = 0
    
    if (i === period) {
      // First RSI - simple average
      for (let j = 1; j <= period; j++) {
        avgGain += gains[j]
        avgLoss += losses[j]
      }
      avgGain /= period
      avgLoss /= period
    } else {
      // Subsequent RSI - exponential smoothing
      avgGain = (result[i - 1] !== NaN ? 
        (gains[i] + (period - 1) * (100 - (result[i - 1] || 50)) * avgLoss / 100) / period : 
        gains[i])
      avgLoss = (losses[i] + (period - 1) * avgLoss) / period
    }
    
    if (avgLoss === 0) {
      result.push(100)
    } else {
      const rs = avgGain / avgLoss
      result.push(100 - (100 / (1 + rs)))
    }
  }
  
  return result
}

/**
 * Stochastic Oscillator
 */
export function Stochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: number[]; d: number[] } {
  const k: number[] = []
  
  for (let i = 0; i < closes.length; i++) {
    if (i < kPeriod - 1) {
      k.push(NaN)
      continue
    }
    
    let highestHigh = -Infinity
    let lowestLow = Infinity
    
    for (let j = 0; j < kPeriod; j++) {
      highestHigh = Math.max(highestHigh, highs[i - j])
      lowestLow = Math.min(lowestLow, lows[i - j])
    }
    
    const stochastic = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100
    k.push(stochastic)
  }
  
  const d = SMA(k.filter(v => !isNaN(v)), dPeriod)
  
  // Align D with K
  const alignedD: number[] = []
  let dIndex = 0
  for (let i = 0; i < k.length; i++) {
    if (isNaN(k[i])) {
      alignedD.push(NaN)
    } else {
      alignedD.push(d[dIndex] || NaN)
      dIndex++
    }
  }
  
  return { k, d: alignedD }
}

/**
 * MACD (Moving Average Convergence Divergence)
 */
export function MACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = EMA(data, fastPeriod)
  const slowEMA = EMA(data, slowPeriod)
  
  const macd = data.map((_, i) => {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) return NaN
    return fastEMA[i] - slowEMA[i]
  })
  
  const validMacd = macd.filter(v => !isNaN(v))
  const signalFull = EMA(validMacd, signalPeriod)
  
  // Align signal with macd
  const signal: number[] = []
  let signalIndex = 0
  const firstValid = macd.findIndex(v => !isNaN(v))
  
  for (let i = 0; i < macd.length; i++) {
    if (i < firstValid + signalPeriod - 1) {
      signal.push(NaN)
    } else {
      signal.push(signalFull[signalIndex] || NaN)
      signalIndex++
    }
  }
  
  const histogram = macd.map((m, i) => {
    if (isNaN(m) || isNaN(signal[i])) return NaN
    return m - signal[i]
  })
  
  return { macd, signal, histogram }
}

/**
 * Average Directional Index (ADX)
 */
export function ADX(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): { adx: number[]; plusDI: number[]; minusDI: number[] } {
  const trueRanges: number[] = []
  const plusDM: number[] = []
  const minusDM: number[] = []
  
  for (let i = 0; i < highs.length; i++) {
    if (i === 0) {
      trueRanges.push(NaN)
      plusDM.push(NaN)
      minusDM.push(NaN)
      continue
    }
    
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    )
    trueRanges.push(tr)
    
    const upMove = highs[i] - highs[i - 1]
    const downMove = lows[i - 1] - lows[i]
    
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0)
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0)
  }
  
  const smoothedTR = EMA(trueRanges.filter(v => !isNaN(v)), period)
  const smoothedPlusDM = EMA(plusDM.filter(v => !isNaN(v)), period)
  const smoothedMinusDM = EMA(minusDM.filter(v => !isNaN(v)), period)
  
  const plusDI: number[] = []
  const minusDI: number[] = []
  const dx: number[] = []
  
  for (let i = 0; i < smoothedTR.length; i++) {
    plusDI.push((smoothedPlusDM[i] / smoothedTR[i]) * 100)
    minusDI.push((smoothedMinusDM[i] / smoothedTR[i]) * 100)
    
    const diSum = plusDI[i] + minusDI[i]
    dx.push(diSum > 0 ? (Math.abs(plusDI[i] - minusDI[i]) / diSum) * 100 : 0)
  }
  
  const adx = EMA(dx, period)
  
  return { adx, plusDI, minusDI }
}

// ============================================
// VOLATILITY INDICATORS
// ============================================

/**
 * Bollinger Bands
 */
export function BollingerBands(
  data: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[]; bandwidth: number[] } {
  const middle = SMA(data, period)
  const upper: number[] = []
  const lower: number[] = []
  const bandwidth: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN)
      lower.push(NaN)
      bandwidth.push(NaN)
      continue
    }
    
    // Calculate standard deviation
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j]
    }
    const mean = sum / period
    
    let sqDiffSum = 0
    for (let j = 0; j < period; j++) {
      sqDiffSum += Math.pow(data[i - j] - mean, 2)
    }
    const sd = Math.sqrt(sqDiffSum / period)
    
    upper.push(middle[i] + stdDev * sd)
    lower.push(middle[i] - stdDev * sd)
    bandwidth.push(((upper[i] - lower[i]) / middle[i]) * 100)
  }
  
  return { upper, middle, lower, bandwidth }
}

/**
 * Average True Range (ATR)
 */
export function ATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number[] {
  const trueRanges: number[] = []
  
  for (let i = 0; i < highs.length; i++) {
    if (i === 0) {
      trueRanges.push(highs[i] - lows[i])
      continue
    }
    
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    )
    trueRanges.push(tr)
  }
  
  return EMA(trueRanges, period)
}

/**
 * Keltner Channels
 */
export function KeltnerChannels(
  highs: number[],
  lows: number[],
  closes: number[],
  emaPeriod: number = 20,
  atrPeriod: number = 10,
  multiplier: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = EMA(closes, emaPeriod)
  const atr = ATR(highs, lows, closes, atrPeriod)
  
  const upper = middle.map((m, i) => m + multiplier * atr[i])
  const lower = middle.map((m, i) => m - multiplier * atr[i])
  
  return { upper, middle, lower }
}

// ============================================
// VOLUME INDICATORS
// ============================================

/**
 * On-Balance Volume (OBV)
 */
export function OBV(closes: number[], volumes: number[]): number[] {
  const result: number[] = [0]
  
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) {
      result.push(result[i - 1] + volumes[i])
    } else if (closes[i] < closes[i - 1]) {
      result.push(result[i - 1] - volumes[i])
    } else {
      result.push(result[i - 1])
    }
  }
  
  return result
}

/**
 * Volume Rate of Change
 */
export function VolumeROC(volumes: number[], period: number = 14): number[] {
  const result: number[] = []
  
  for (let i = 0; i < volumes.length; i++) {
    if (i < period) {
      result.push(NaN)
      continue
    }
    
    const roc = ((volumes[i] - volumes[i - period]) / volumes[i - period]) * 100
    result.push(roc)
  }
  
  return result
}

/**
 * Money Flow Index (MFI)
 */
export function MFI(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[],
  period: number = 14
): number[] {
  const typicalPrices = closes.map((c, i) => (highs[i] + lows[i] + c) / 3)
  const moneyFlows = typicalPrices.map((tp, i) => tp * volumes[i])
  
  const result: number[] = []
  
  for (let i = 0; i < closes.length; i++) {
    if (i < period) {
      result.push(NaN)
      continue
    }
    
    let positiveFlow = 0
    let negativeFlow = 0
    
    for (let j = 0; j < period; j++) {
      if (typicalPrices[i - j] > typicalPrices[i - j - 1]) {
        positiveFlow += moneyFlows[i - j]
      } else {
        negativeFlow += moneyFlows[i - j]
      }
    }
    
    if (negativeFlow === 0) {
      result.push(100)
    } else {
      const mfRatio = positiveFlow / negativeFlow
      result.push(100 - (100 / (1 + mfRatio)))
    }
  }
  
  return result
}

// ============================================
// SUPPORT/RESISTANCE
// ============================================

/**
 * Pivot Points
 */
export function PivotPoints(
  high: number,
  low: number,
  close: number
): { pp: number; r1: number; r2: number; r3: number; s1: number; s2: number; s3: number } {
  const pp = (high + low + close) / 3
  const r1 = 2 * pp - low
  const r2 = pp + (high - low)
  const r3 = high + 2 * (pp - low)
  const s1 = 2 * pp - high
  const s2 = pp - (high - low)
  const s3 = low - 2 * (high - pp)
  
  return { pp, r1, r2, r3, s1, s2, s3 }
}

/**
 * Support and Resistance Levels
 */
export function findSupportResistance(
  highs: number[],
  lows: number[],
  closes: number[],
  lookback: number = 20
): { supports: number[]; resistances: number[] } {
  const supports: number[] = []
  const resistances: number[] = []
  
  for (let i = lookback; i < highs.length - lookback; i++) {
    // Check for local minimum (support)
    let isSupport = true
    for (let j = 1; j <= lookback; j++) {
      if (lows[i] > lows[i - j] || lows[i] > lows[i + j]) {
        isSupport = false
        break
      }
    }
    if (isSupport) {
      supports.push(lows[i])
    }
    
    // Check for local maximum (resistance)
    let isResistance = true
    for (let j = 1; j <= lookback; j++) {
      if (highs[i] < highs[i - j] || highs[i] < highs[i + j]) {
        isResistance = false
        break
      }
    }
    if (isResistance) {
      resistances.push(highs[i])
    }
  }
  
  return {
    supports: supports.slice(-10), // Last 10 support levels
    resistances: resistances.slice(-10) // Last 10 resistance levels
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getNaN(): number {
  return Number.NaN
}

/**
 * Calculate all indicators for a dataset
 */
export function calculateAllIndicators(candles: OHLCVCandle[]): Record<string, number[]> {
  const closes = candles.map(c => c.close)
  const highs = candles.map(c => c.high)
  const lows = candles.map(c => c.low)
  const volumes = candles.map(c => c.volume)
  
  return {
    sma20: SMA(closes, 20),
    sma50: SMA(closes, 50),
    sma200: SMA(closes, 200),
    ema12: EMA(closes, 12),
    ema26: EMA(closes, 26),
    rsi14: RSI(closes, 14),
    atr14: ATR(highs, lows, closes, 14),
    obv: OBV(closes, volumes),
    mfi14: MFI(highs, lows, closes, volumes, 14),
    ...MACD(closes),
    ...BollingerBands(closes),
    ...Stochastic(highs, lows, closes),
    ...ADX(highs, lows, closes)
  }
}
