// Strategy Templates Library
// Pre-built trading strategies for backtesting

import { StrategyDefinition } from './types'

// ============================================
// STRATEGY TEMPLATES
// ============================================

export const strategyTemplates: StrategyDefinition[] = [
  // ==========================================
  // TREND FOLLOWING STRATEGIES
  // ==========================================
  
  {
    id: 'sma_crossover',
    name: 'SMA Crossover',
    description: 'Classic trend-following strategy using Simple Moving Average crossovers. Generates buy signals when faster SMA crosses above slower SMA, and sell signals on the opposite crossover.',
    category: 'trend_following',
    assetClasses: ['forex', 'crypto', 'stocks', 'commodities'],
    parameters: [
      {
        name: 'fastPeriod',
        type: 'number',
        default: 20,
        min: 5,
        max: 100,
        step: 1,
        description: 'Fast SMA period'
      },
      {
        name: 'slowPeriod',
        type: 'number',
        default: 50,
        min: 20,
        max: 200,
        step: 1,
        description: 'Slow SMA period'
      }
    ],
    indicators: ['SMA'],
    entryRules: [
      'Buy when fast SMA crosses above slow SMA (Golden Cross)',
      'Sell when fast SMA crosses below slow SMA (Death Cross)'
    ],
    exitRules: [
      'Exit long on death cross',
      'Exit short on golden cross',
      'Optional stop loss/take profit'
    ],
    riskManagement: {
      stopLoss: 2,
      takeProfit: 4,
      trailingStop: true,
      positionSizing: 'fixed'
    },
    timeframes: ['1h', '4h', '1d']
  },

  {
    id: 'ema_trend',
    name: 'EMA Trend Following',
    description: 'Trend following strategy using Exponential Moving Averages with faster response to recent price changes. Better suited for volatile markets.',
    category: 'trend_following',
    assetClasses: ['forex', 'crypto', 'stocks'],
    parameters: [
      {
        name: 'fastPeriod',
        type: 'number',
        default: 9,
        min: 5,
        max: 50,
        step: 1,
        description: 'Fast EMA period'
      },
      {
        name: 'slowPeriod',
        type: 'number',
        default: 21,
        min: 10,
        max: 100,
        step: 1,
        description: 'Slow EMA period'
      },
      {
        name: 'trendFilter',
        type: 'number',
        default: 200,
        min: 100,
        max: 300,
        step: 1,
        description: 'Trend filter EMA period'
      }
    ],
    indicators: ['EMA'],
    entryRules: [
      'Buy when fast EMA crosses above slow EMA AND price is above trend filter EMA',
      'Sell when fast EMA crosses below slow EMA AND price is below trend filter EMA'
    ],
    exitRules: [
      'Exit on opposite crossover',
      'Exit when price crosses trend filter EMA'
    ],
    riskManagement: {
      stopLoss: 'atr',
      takeProfit: 'atr',
      trailingStop: true,
      positionSizing: 'fixed'
    },
    timeframes: ['1h', '4h', '1d']
  },

  {
    id: 'trend_follow',
    name: 'ADX Trend Following',
    description: 'Uses ADX indicator to identify strong trends, only taking positions when ADX is above threshold. Combines with SMA for direction.',
    category: 'trend_following',
    assetClasses: ['forex', 'crypto', 'stocks'],
    parameters: [
      {
        name: 'adxThreshold',
        type: 'number',
        default: 25,
        min: 15,
        max: 40,
        step: 1,
        description: 'Minimum ADX for trend confirmation'
      },
      {
        name: 'smaFast',
        type: 'number',
        default: 20,
        min: 10,
        max: 50,
        step: 1,
        description: 'Fast SMA for direction'
      },
      {
        name: 'smaSlow',
        type: 'number',
        default: 50,
        min: 30,
        max: 100,
        step: 1,
        description: 'Slow SMA for direction'
      }
    ],
    indicators: ['ADX', 'SMA'],
    entryRules: [
      'Enter long when ADX > threshold, price > SMA fast > SMA slow',
      'Enter short when ADX > threshold, price < SMA fast < SMA slow'
    ],
    exitRules: [
      'Exit when ADX falls below threshold',
      'Exit on SMA crossover reversal'
    ],
    riskManagement: {
      stopLoss: 'atr',
      takeProfit: 'atr',
      trailingStop: true,
      positionSizing: 'fixed'
    },
    timeframes: ['1h', '4h', '1d']
  },

  // ==========================================
  // MEAN REVERSION STRATEGIES
  // ==========================================

  {
    id: 'rsi_mean_reversion',
    name: 'RSI Mean Reversion',
    description: 'Classic mean reversion strategy using RSI overbought/oversold levels. Buys when RSI is oversold and sells when overbought.',
    category: 'mean_reversion',
    assetClasses: ['forex', 'stocks', 'commodities'],
    parameters: [
      {
        name: 'rsiPeriod',
        type: 'number',
        default: 14,
        min: 7,
        max: 21,
        step: 1,
        description: 'RSI period'
      },
      {
        name: 'oversold',
        type: 'number',
        default: 30,
        min: 20,
        max: 40,
        step: 1,
        description: 'Oversold threshold'
      },
      {
        name: 'overbought',
        type: 'number',
        default: 70,
        min: 60,
        max: 80,
        step: 1,
        description: 'Overbought threshold'
      }
    ],
    indicators: ['RSI'],
    entryRules: [
      'Buy when RSI crosses below oversold level and starts turning up',
      'Sell when RSI crosses above overbought level and starts turning down'
    ],
    exitRules: [
      'Exit long when RSI reaches 50 or overbought',
      'Exit short when RSI reaches 50 or oversold'
    ],
    riskManagement: {
      stopLoss: 'atr',
      takeProfit: 'atr',
      trailingStop: false,
      positionSizing: 'fixed'
    },
    timeframes: ['1h', '4h']
  },

  {
    id: 'bollinger_bands',
    name: 'Bollinger Band Bounce',
    description: 'Mean reversion strategy using Bollinger Bands. Buys at lower band expecting bounce, sells at upper band expecting reversal.',
    category: 'mean_reversion',
    assetClasses: ['forex', 'crypto', 'stocks'],
    parameters: [
      {
        name: 'bbPeriod',
        type: 'number',
        default: 20,
        min: 10,
        max: 30,
        step: 1,
        description: 'Bollinger Band period'
      },
      {
        name: 'bbStdDev',
        type: 'number',
        default: 2,
        min: 1,
        max: 3,
        step: 0.5,
        description: 'Standard deviation multiplier'
      }
    ],
    indicators: ['Bollinger Bands'],
    entryRules: [
      'Buy when price touches or closes below lower band',
      'Sell when price touches or closes above upper band'
    ],
    exitRules: [
      'Exit long when price reaches middle band or upper band',
      'Exit short when price reaches middle band or lower band'
    ],
    riskManagement: {
      stopLoss: 1,
      takeProfit: 'resistance',
      trailingStop: false,
      positionSizing: 'fixed'
    },
    timeframes: ['1h', '4h', '1d']
  },

  {
    id: 'stochastic_reversal',
    name: 'Stochastic Reversal',
    description: 'Combines Stochastic oscillator with RSI for more reliable reversal signals. Best in ranging markets.',
    category: 'mean_reversion',
    assetClasses: ['forex', 'stocks'],
    parameters: [
      {
        name: 'stochK',
        type: 'number',
        default: 14,
        min: 5,
        max: 21,
        step: 1,
        description: 'Stochastic K period'
      },
      {
        name: 'stochD',
        type: 'number',
        default: 3,
        min: 1,
        max: 5,
        step: 1,
        description: 'Stochastic D period'
      },
      {
        name: 'rsiConfirm',
        type: 'number',
        default: 14,
        min: 7,
        max: 21,
        step: 1,
        description: 'RSI confirmation period'
      }
    ],
    indicators: ['Stochastic', 'RSI'],
    entryRules: [
      'Buy when Stochastic K crosses above D from oversold AND RSI < 40',
      'Sell when Stochastic K crosses below D from overbought AND RSI > 60'
    ],
    exitRules: [
      'Exit long when Stochastic reaches overbought',
      'Exit short when Stochastic reaches oversold'
    ],
    riskManagement: {
      stopLoss: 1.5,
      takeProfit: 2,
      trailingStop: false,
      positionSizing: 'fixed'
    },
    timeframes: ['15m', '1h', '4h']
  },

  // ==========================================
  // MOMENTUM STRATEGIES
  // ==========================================

  {
    id: 'macd_strategy',
    name: 'MACD Momentum',
    description: 'Classic momentum strategy using MACD crossovers. Buys when MACD crosses above signal line, sells when crosses below.',
    category: 'momentum',
    assetClasses: ['forex', 'crypto', 'stocks'],
    parameters: [
      {
        name: 'fastPeriod',
        type: 'number',
        default: 12,
        min: 5,
        max: 20,
        step: 1,
        description: 'MACD fast period'
      },
      {
        name: 'slowPeriod',
        type: 'number',
        default: 26,
        min: 15,
        max: 40,
        step: 1,
        description: 'MACD slow period'
      },
      {
        name: 'signalPeriod',
        type: 'number',
        default: 9,
        min: 5,
        max: 15,
        step: 1,
        description: 'Signal line period'
      }
    ],
    indicators: ['MACD'],
    entryRules: [
      'Buy when MACD crosses above signal line (bullish crossover)',
      'Sell when MACD crosses below signal line (bearish crossover)'
    ],
    exitRules: [
      'Exit on opposite crossover',
      'Consider histogram divergence'
    ],
    riskManagement: {
      stopLoss: 1.5,
      takeProfit: 3,
      trailingStop: true,
      positionSizing: 'fixed'
    },
    timeframes: ['1h', '4h', '1d']
  },

  {
    id: 'momentum_breakout',
    name: 'Momentum Breakout',
    description: 'Identifies strong momentum moves using volume and price action. Enters on breakouts with volume confirmation.',
    category: 'momentum',
    assetClasses: ['crypto', 'stocks'],
    parameters: [
      {
        name: 'lookback',
        type: 'number',
        default: 20,
        min: 10,
        max: 50,
        step: 1,
        description: 'Lookback period for high/low'
      },
      {
        name: 'volumeMultiplier',
        type: 'number',
        default: 1.5,
        min: 1,
        max: 3,
        step: 0.1,
        description: 'Volume multiplier for confirmation'
      }
    ],
    indicators: ['Volume', 'ATR'],
    entryRules: [
      'Buy when price breaks above recent high with above-average volume',
      'Sell when price breaks below recent low with above-average volume'
    ],
    exitRules: [
      'Exit with trailing stop based on ATR',
      'Exit if momentum weakens'
    ],
    riskManagement: {
      stopLoss: 'atr',
      takeProfit: 0,
      trailingStop: true,
      positionSizing: 'fixed'
    },
    timeframes: ['1h', '4h']
  },

  // ==========================================
  // BREAKOUT STRATEGIES
  // ==========================================

  {
    id: 'breakout',
    name: 'Price Breakout',
    description: 'Simple breakout strategy that enters when price breaks above resistance or below support levels.',
    category: 'breakout',
    assetClasses: ['forex', 'crypto', 'stocks', 'commodities'],
    parameters: [
      {
        name: 'lookback',
        type: 'number',
        default: 20,
        min: 10,
        max: 50,
        step: 1,
        description: 'Lookback period for levels'
      },
      {
        name: 'confirmation',
        type: 'number',
        default: 0.5,
        min: 0.1,
        max: 1,
        step: 0.1,
        description: 'Confirmation percentage above/below level'
      }
    ],
    indicators: ['Support', 'Resistance'],
    entryRules: [
      'Buy when price breaks and closes above resistance',
      'Sell when price breaks and closes below support'
    ],
    exitRules: [
      'Exit long on stop loss or if price falls back below breakout level',
      'Exit short on stop loss or if price rises back above breakdown level'
    ],
    riskManagement: {
      stopLoss: 'support',
      takeProfit: 'resistance',
      trailingStop: true,
      positionSizing: 'fixed'
    },
    timeframes: ['1h', '4h', '1d']
  },

  {
    id: 'donchian_breakout',
    name: 'Donchian Channel Breakout',
    description: 'Classic Turtle Trading strategy using Donchian Channels. Enters on 20-day highs/lows and exits on 10-day opposite signals.',
    category: 'breakout',
    assetClasses: ['forex', 'crypto', 'commodities'],
    parameters: [
      {
        name: 'entryPeriod',
        type: 'number',
        default: 20,
        min: 10,
        max: 50,
        step: 1,
        description: 'Entry channel period'
      },
      {
        name: 'exitPeriod',
        type: 'number',
        default: 10,
        min: 5,
        max: 20,
        step: 1,
        description: 'Exit channel period'
      }
    ],
    indicators: ['Donchian Channel'],
    entryRules: [
      'Buy when price breaks above entry period high',
      'Sell when price breaks below entry period low'
    ],
    exitRules: [
      'Exit long when price breaks below exit period low',
      'Exit short when price breaks above exit period high'
    ],
    riskManagement: {
      stopLoss: 0,
      takeProfit: 0,
      trailingStop: false,
      positionSizing: 'fixed'
    },
    timeframes: ['1d']
  },

  // ==========================================
  // SCALPING STRATEGIES
  // ==========================================

  {
    id: 'scalping',
    name: 'RSI + Stochastic Scalper',
    description: 'Fast-paced scalping strategy combining RSI and Stochastic for quick entries and exits. Best for high liquidity pairs.',
    category: 'scalping',
    assetClasses: ['forex', 'crypto'],
    parameters: [
      {
        name: 'rsiPeriod',
        type: 'number',
        default: 7,
        min: 5,
        max: 14,
        step: 1,
        description: 'Fast RSI period'
      },
      {
        name: 'stochPeriod',
        type: 'number',
        default: 5,
        min: 3,
        max: 10,
        step: 1,
        description: 'Fast Stochastic period'
      },
      {
        name: 'profitTarget',
        type: 'number',
        default: 0.5,
        min: 0.2,
        max: 1,
        step: 0.1,
        description: 'Profit target percentage'
      }
    ],
    indicators: ['RSI', 'Stochastic'],
    entryRules: [
      'Buy when RSI < 40 and turning up, Stochastic K crosses above D from oversold',
      'Sell when RSI > 60 and turning down, Stochastic K crosses below D from overbought'
    ],
    exitRules: [
      'Exit at profit target',
      'Exit on opposite signal',
      'Quick stop loss execution'
    ],
    riskManagement: {
      stopLoss: 0.5,
      takeProfit: 0.5,
      trailingStop: false,
      positionSizing: 'fixed'
    },
    timeframes: ['1m', '5m', '15m']
  },

  // ==========================================
  // SWING TRADING STRATEGIES
  // ==========================================

  {
    id: 'swing_trader',
    name: 'Swing Trade Setup',
    description: 'Multi-day swing trading strategy looking for pullback entries in established trends. Uses Fibonacci and moving averages.',
    category: 'swing',
    assetClasses: ['forex', 'stocks', 'commodities'],
    parameters: [
      {
        name: 'trendMa',
        type: 'number',
        default: 50,
        min: 30,
        max: 100,
        step: 1,
        description: 'Trend-defining MA'
      },
      {
        name: 'pullbackMa',
        type: 'number',
        default: 20,
        min: 10,
        max: 30,
        step: 1,
        description: 'Pullback entry MA'
      },
      {
        name: 'rsiConfirm',
        type: 'number',
        default: 14,
        min: 7,
        max: 21,
        step: 1,
        description: 'RSI confirmation period'
      }
    ],
    indicators: ['SMA', 'RSI', 'Fibonacci'],
    entryRules: [
      'Buy pullback to MA in uptrend when RSI < 50',
      'Sell pullback to MA in downtrend when RSI > 50'
    ],
    exitRules: [
      'Exit at previous swing high/low',
      'Exit on trend reversal'
    ],
    riskManagement: {
      stopLoss: 'support',
      takeProfit: 'resistance',
      trailingStop: true,
      positionSizing: 'fixed'
    },
    timeframes: ['4h', '1d']
  }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getStrategyById(id: string): StrategyDefinition | undefined {
  return strategyTemplates.find(s => s.id === id)
}

export function getStrategiesByCategory(category: StrategyDefinition['category']): StrategyDefinition[] {
  return strategyTemplates.filter(s => s.category === category)
}

export function getStrategiesByAssetClass(assetClass: StrategyDefinition['assetClasses'][0]): StrategyDefinition[] {
  return strategyTemplates.filter(s => s.assetClasses.includes(assetClass))
}

export function getDefaultParameters(strategyId: string): Record<string, any> {
  const strategy = getStrategyById(strategyId)
  if (!strategy) return {}
  
  return strategy.parameters.reduce((params, param) => {
    params[param.name] = param.default
    return params
  }, {} as Record<string, any>)
}

// Strategy categories for UI
export const strategyCategories = [
  { id: 'trend_following', name: 'Trend Following', description: 'Follow the trend with moving averages and momentum' },
  { id: 'mean_reversion', name: 'Mean Reversion', description: 'Trade against extremes expecting return to mean' },
  { id: 'breakout', name: 'Breakout', description: 'Enter on breakouts from consolidation ranges' },
  { id: 'momentum', name: 'Momentum', description: 'Trade strong momentum moves' },
  { id: 'scalping', name: 'Scalping', description: 'Quick trades with small profit targets' },
  { id: 'swing', name: 'Swing Trading', description: 'Multi-day positions capturing swing moves' },
]
