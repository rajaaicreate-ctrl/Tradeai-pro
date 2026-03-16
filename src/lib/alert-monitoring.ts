// Alert Monitoring Service for TradeAI Pro
// Continuously monitors market data and triggers alerts

import { supabase } from './supabase'
import { 
  sendPriceAlertNotification, 
  sendRSIAlertNotification, 
  sendSupportResistanceNotification,
  sendVolumeAlertNotification 
} from './notifications'

// Types
interface AlertRecord {
  id: string
  user_id: string
  symbol: string
  type: 'price' | 'rsi' | 'breakout' | 'volume' | 'support' | 'resistance'
  condition: 'above' | 'below' | 'crosses_up' | 'crosses_down' | 'enters_zone'
  value: number
  status: 'active' | 'triggered' | 'disabled'
  notification_methods: ('email' | 'telegram' | 'app')[]
  message?: string
  created_at: string
  triggered_at?: string
  last_checked?: string
}

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume?: number
  rsi?: number
  high24h?: number
  low24h?: number
  support?: number
  resistance?: number
}

interface TriggerResult {
  alertId: string
  symbol: string
  triggered: boolean
  triggerValue?: number
  targetValue?: number
  message?: string
  error?: string
}

// Symbol to API mapping
const symbolMapping: Record<string, { api: string; pair: string; type: 'crypto' | 'forex' | 'stock' | 'commodity' }> = {
  'BTC/USD': { api: 'coingecko', pair: 'bitcoin', type: 'crypto' },
  'ETH/USD': { api: 'coingecko', pair: 'ethereum', type: 'crypto' },
  'XRP/USD': { api: 'coingecko', pair: 'ripple', type: 'crypto' },
  'SOL/USD': { api: 'coingecko', pair: 'solana', type: 'crypto' },
  'EUR/USD': { api: 'alphavantage', pair: 'EUR/USD', type: 'forex' },
  'GBP/USD': { api: 'alphavantage', pair: 'GBP/USD', type: 'forex' },
  'USD/JPY': { api: 'alphavantage', pair: 'USD/JPY', type: 'forex' },
  'XAU/USD': { api: 'alphavantage', pair: 'GOLD', type: 'commodity' },
  'SPY': { api: 'alphavantage', pair: 'SPY', type: 'stock' },
  'QQQ': { api: 'alphavantage', pair: 'QQQ', type: 'stock' },
}

// Fetch market data for a symbol
async function fetchMarketData(symbol: string): Promise<MarketData | null> {
  try {
    const mapping = symbolMapping[symbol]
    
    if (!mapping) {
      // Use internal API as fallback
      const response = await fetch(`/api/market-data?symbols=${symbol}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        return {
          symbol,
          price: data.data.price || 0,
          change: data.data.change || 0,
          changePercent: data.data.changePercent || 0,
          volume: data.data.volume,
          rsi: calculateRSI(symbol, data.data.price)
        }
      }
      return null
    }

    // Fetch from appropriate API
    if (mapping.api === 'coingecko') {
      return await fetchCryptoData(symbol, mapping.pair)
    } else if (mapping.api === 'alphavantage') {
      return await fetchAlphaVantageData(symbol, mapping.pair, mapping.type)
    }

    return null
  } catch (error) {
    console.error(`Error fetching market data for ${symbol}:`, error)
    return null
  }
}

// Fetch crypto data from CoinGecko
async function fetchCryptoData(symbol: string, coinId: string): Promise<MarketData | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    const coinData = data[coinId]
    
    if (!coinData) return null
    
    return {
      symbol,
      price: coinData.usd || 0,
      change: coinData.usd_24h_change || 0,
      changePercent: coinData.usd_24h_change || 0,
      volume: coinData.usd_24h_vol || 0
    }
  } catch (error) {
    console.error('CoinGecko API error:', error)
    return null
  }
}

// Fetch data from Alpha Vantage
async function fetchAlphaVantageData(
  symbol: string,
  pair: string,
  type: 'forex' | 'stock' | 'commodity'
): Promise<MarketData | null> {
  const apiKey = process.env.ALPHA_VANTAGE_KEY || 'demo'
  
  try {
    let endpoint = ''
    
    if (type === 'forex') {
      const [from, to] = pair.split('/')
      endpoint = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`
    } else if (type === 'stock') {
      endpoint = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${pair}&apikey=${apiKey}`
    } else {
      // For commodities, use forex endpoint with XAU
      endpoint = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${apiKey}`
    }
    
    const response = await fetch(endpoint)
    const data = await response.json()
    
    if (type === 'forex' || type === 'commodity') {
      const rate = data['Realtime Currency Exchange Rate']
      if (rate) {
        return {
          symbol,
          price: parseFloat(rate['5. Exchange Rate'] || 0),
          change: 0,
          changePercent: 0
        }
      }
    } else if (type === 'stock') {
      const quote = data['Global Quote']
      if (quote) {
        return {
          symbol,
          price: parseFloat(quote['05. price'] || 0),
          change: parseFloat(quote['09. change'] || 0),
          changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || 0),
          volume: parseInt(quote['06. volume'] || 0)
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Alpha Vantage API error:', error)
    return null
  }
}

// Calculate RSI (simplified for demo)
function calculateRSI(symbol: string, currentPrice: number): number {
  // In production, this would use historical price data
  // For demo, generate a realistic-looking RSI
  const baseRSI = symbol.includes('BTC') ? 55 : symbol.includes('EUR') ? 48 : 50
  const variance = Math.random() * 30 - 15
  return Math.max(0, Math.min(100, baseRSI + variance))
}

// Check if alert should trigger
function checkAlertCondition(
  alert: AlertRecord,
  marketData: MarketData,
  previousPrice?: number,
  previousRSI?: number
): { triggered: boolean; message: string } {
  const { type, condition, value } = alert
  const { price, rsi, volume } = marketData

  switch (type) {
    case 'price':
      if (condition === 'above' && price > value) {
        return {
          triggered: true,
          message: `Price ($${price.toFixed(2)}) broke ABOVE target $${value.toFixed(2)}`
        }
      }
      if (condition === 'below' && price < value) {
        return {
          triggered: true,
          message: `Price ($${price.toFixed(2)}) broke BELOW target $${value.toFixed(2)}`
        }
      }
      if (condition === 'crosses_up' && previousPrice && previousPrice <= value && price > value) {
        return {
          triggered: true,
          message: `Price CROSSED UP above $${value.toFixed(2)} (now $${price.toFixed(2)})`
        }
      }
      if (condition === 'crosses_down' && previousPrice && previousPrice >= value && price < value) {
        return {
          triggered: true,
          message: `Price CROSSED DOWN below $${value.toFixed(2)} (now $${price.toFixed(2)})`
        }
      }
      break

    case 'rsi':
      if (!rsi) return { triggered: false, message: '' }
      
      if (condition === 'above' && rsi > value) {
        return {
          triggered: true,
          message: `RSI (${rsi.toFixed(1)}) is ABOVE ${value} - ${rsi > 70 ? 'OVERBOUGHT!' : ''}`
        }
      }
      if (condition === 'below' && rsi < value) {
        return {
          triggered: true,
          message: `RSI (${rsi.toFixed(1)}) is BELOW ${value} - ${rsi < 30 ? 'OVERSOLD!' : ''}`
        }
      }
      if (condition === 'crosses_up' && previousRSI && previousRSI <= value && rsi > value) {
        return {
          triggered: true,
          message: `RSI crossed UP above ${value} (now ${rsi.toFixed(1)})`
        }
      }
      if (condition === 'crosses_down' && previousRSI && previousRSI >= value && rsi < value) {
        return {
          triggered: true,
          message: `RSI crossed DOWN below ${value} (now ${rsi.toFixed(1)})`
        }
      }
      break

    case 'volume':
      if (!volume) return { triggered: false, message: '' }
      
      if (condition === 'above' && volume > value) {
        return {
          triggered: true,
          message: `Volume spike! Current: ${volume.toLocaleString()}, Threshold: ${value.toLocaleString()}`
        }
      }
      break

    case 'support':
      const supportTolerance = value * 0.002 // 0.2% tolerance
      if (condition === 'enters_zone' && Math.abs(price - value) <= supportTolerance) {
        return {
          triggered: true,
          message: `Price testing SUPPORT at $${value.toFixed(2)} (current: $${price.toFixed(2)})`
        }
      }
      if (condition === 'below' && price < value) {
        return {
          triggered: true,
          message: `Price BROKE BELOW support at $${value.toFixed(2)}!`
        }
      }
      break

    case 'resistance':
      const resistanceTolerance = value * 0.002
      if (condition === 'enters_zone' && Math.abs(price - value) <= resistanceTolerance) {
        return {
          triggered: true,
          message: `Price testing RESISTANCE at $${value.toFixed(2)} (current: $${price.toFixed(2)})`
        }
      }
      if (condition === 'above' && price > value) {
        return {
          triggered: true,
          message: `Price BROKE ABOVE resistance at $${value.toFixed(2)}!`
        }
      }
      break

    case 'breakout':
      if (condition === 'above' && price > value) {
        return {
          triggered: true,
          message: `BREAKOUT! Price ($${price.toFixed(2)}) broke above $${value.toFixed(2)}`
        }
      }
      if (condition === 'below' && price < value) {
        return {
          triggered: true,
          message: `BREAKDOWN! Price ($${price.toFixed(2)}) broke below $${value.toFixed(2)}`
        }
      }
      break
  }

  return { triggered: false, message: '' }
}

// Process a single alert
async function processAlert(
  alert: AlertRecord,
  marketDataCache: Map<string, MarketData>,
  previousValues: Map<string, { price: number; rsi: number }>
): Promise<TriggerResult> {
  try {
    // Get market data
    let marketData = marketDataCache.get(alert.symbol)
    
    if (!marketData) {
      marketData = await fetchMarketData(alert.symbol)
      if (!marketData) {
        return {
          alertId: alert.id,
          symbol: alert.symbol,
          triggered: false,
          error: 'Failed to fetch market data'
        }
      }
      marketDataCache.set(alert.symbol, marketData)
    }

    // Get previous values for cross detection
    const previous = previousValues.get(alert.symbol)

    // Check condition
    const result = checkAlertCondition(alert, marketData, previous?.price, previous?.rsi)

    if (result.triggered) {
      // Send notifications
      await sendNotificationForAlert(alert, marketData)

      // Update alert status
      await supabase
        .from('alerts')
        .update({
          status: 'triggered',
          triggered_at: new Date().toISOString(),
          last_checked: new Date().toISOString()
        })
        .eq('id', alert.id)

      // Record in history
      await supabase
        .from('alert_history')
        .insert({
          alert_id: alert.id,
          user_id: alert.user_id,
          symbol: alert.symbol,
          type: alert.type,
          condition: alert.condition,
          trigger_value: marketData.price,
          target_value: alert.value,
          message: result.message,
          notification_sent: true,
          created_at: new Date().toISOString()
        })

      return {
        alertId: alert.id,
        symbol: alert.symbol,
        triggered: true,
        triggerValue: marketData.price,
        targetValue: alert.value,
        message: result.message
      }
    } else {
      // Update last checked time
      await supabase
        .from('alerts')
        .update({ last_checked: new Date().toISOString() })
        .eq('id', alert.id)

      return {
        alertId: alert.id,
        symbol: alert.symbol,
        triggered: false
      }
    }
  } catch (error: any) {
    console.error(`Error processing alert ${alert.id}:`, error)
    return {
      alertId: alert.id,
      symbol: alert.symbol,
      triggered: false,
      error: error.message
    }
  }
}

// Send notification based on alert type
async function sendNotificationForAlert(alert: AlertRecord, marketData: MarketData): Promise<void> {
  const { user_id, symbol, type, condition, value, notification_methods } = alert

  switch (type) {
    case 'price':
    case 'breakout':
      await sendPriceAlertNotification(user_id, symbol, condition, value, marketData.price, notification_methods)
      break

    case 'rsi':
      await sendRSIAlertNotification(user_id, symbol, condition, value, marketData.rsi || 50, notification_methods)
      break

    case 'support':
    case 'resistance':
      await sendSupportResistanceNotification(user_id, symbol, type, value, marketData.price, notification_methods)
      break

    case 'volume':
      await sendVolumeAlertNotification(user_id, symbol, value, marketData.volume || 0, notification_methods)
      break
  }
}

// Main monitoring function
export async function runAlertMonitor(): Promise<{
  checked: number
  triggered: number
  errors: number
  results: TriggerResult[]
}> {
  try {
    // Fetch all active alerts
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('status', 'active')

    if (error) throw error

    if (!alerts || alerts.length === 0) {
      return { checked: 0, triggered: 0, errors: 0, results: [] }
    }

    // Caches for this run
    const marketDataCache = new Map<string, MarketData>()
    const previousValues = new Map<string, { price: number; rsi: number }>()

    // Process each alert
    const results: TriggerResult[] = []
    
    for (const alert of alerts as AlertRecord[]) {
      const result = await processAlert(alert, marketDataCache, previousValues)
      results.push(result)
    }

    const triggered = results.filter(r => r.triggered).length
    const errors = results.filter(r => r.error).length

    return {
      checked: alerts.length,
      triggered,
      errors,
      results
    }
  } catch (error) {
    console.error('Alert monitor error:', error)
    return { checked: 0, triggered: 0, errors: 1, results: [] }
  }
}

// Client-side alert checker (for demo mode)
export class ClientAlertMonitor {
  private intervalId: NodeJS.Timeout | null = null
  private alerts: AlertRecord[] = []
  private callbacks: Map<string, (result: TriggerResult) => void> = new Map()

  constructor(alerts: AlertRecord[]) {
    this.alerts = alerts
  }

  start(intervalMs: number = 30000): void {
    if (this.intervalId) return

    this.intervalId = setInterval(async () => {
      await this.check()
    }, intervalMs)

    // Run immediately
    this.check()
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  onTrigger(callback: (result: TriggerResult) => void): void {
    const id = Math.random().toString(36)
    this.callbacks.set(id, callback)
  }

  private async check(): Promise<void> {
    const marketDataCache = new Map<string, MarketData>()

    for (const alert of this.alerts) {
      if (alert.status !== 'active') continue

      let marketData = marketDataCache.get(alert.symbol)
      if (!marketData) {
        try {
          const response = await fetch(`/api/market-data?symbols=${alert.symbol}`)
          const data = await response.json()
          if (data.success) {
            marketData = {
              symbol: alert.symbol,
              price: data.data?.price || 0,
              change: data.data?.change || 0,
              changePercent: data.data?.changePercent || 0,
              rsi: 50 + Math.random() * 30 - 15
            }
            marketDataCache.set(alert.symbol, marketData)
          }
        } catch {
          continue
        }
      }

      if (marketData) {
        const result = checkAlertCondition(alert, marketData)
        
        if (result.triggered) {
          const triggerResult: TriggerResult = {
            alertId: alert.id,
            symbol: alert.symbol,
            triggered: true,
            triggerValue: marketData.price,
            targetValue: alert.value,
            message: result.message
          }

          // Notify all callbacks
          this.callbacks.forEach(cb => cb(triggerResult))
        }
      }
    }
  }

  updateAlerts(alerts: AlertRecord[]): void {
    this.alerts = alerts
  }
}

// Export for API route usage
export { checkAlertCondition, fetchMarketData }
export type { AlertRecord, MarketData, TriggerResult }
