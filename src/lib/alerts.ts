// Alerts System - Real-time Market Alerts
// Supports: Price, RSI, Breakout, Volume alerts
// Notifications: Email, Telegram, In-App

import { supabase } from './supabase'

export type AlertType = 'price' | 'rsi' | 'breakout' | 'volume' | 'support' | 'resistance'
export type AlertCondition = 'above' | 'below' | 'crosses_up' | 'crosses_down' | 'enters_zone'
export type AlertStatus = 'active' | 'triggered' | 'disabled'
export type NotificationMethod = 'email' | 'telegram' | 'app'

export interface MarketAlert {
  id: string
  user_id: string
  symbol: string
  type: AlertType
  condition: AlertCondition
  value: number
  status: AlertStatus
  notification_methods: NotificationMethod[]
  message?: string
  created_at: string
  triggered_at?: string
  last_checked?: string
}

export interface AlertTrigger {
  alert_id: string
  symbol: string
  type: AlertType
  condition: AlertCondition
  trigger_value: number
  target_value: number
  message: string
  timestamp: string
}

// Create a new alert
export async function createAlert(alert: Omit<MarketAlert, 'id' | 'created_at' | 'status'>): Promise<MarketAlert | null> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        ...alert,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
    return data as MarketAlert
  } catch (error) {
    console.error('Error creating alert:', error)
    return null
  }
}

// Get all alerts for a user
export async function getUserAlerts(userId: string): Promise<MarketAlert[]> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as MarketAlert[]
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return []
  }
}

// Update alert status
export async function updateAlertStatus(alertId: string, status: AlertStatus): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('alerts')
      .update({ status })
      .eq('id', alertId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating alert:', error)
    return false
  }
}

// Delete alert
export async function deleteAlert(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting alert:', error)
    return false
  }
}

// Check if alert should trigger
export function checkAlertCondition(
  alert: MarketAlert,
  currentPrice: number,
  rsi?: number,
  volume?: number
): boolean {
  switch (alert.type) {
    case 'price':
      if (alert.condition === 'above') return currentPrice > alert.value
      if (alert.condition === 'below') return currentPrice < alert.value
      break

    case 'rsi':
      if (rsi === undefined) return false
      if (alert.condition === 'above') return rsi > alert.value
      if (alert.condition === 'below') return rsi < alert.value
      if (alert.condition === 'crosses_up') return rsi > alert.value
      if (alert.condition === 'crosses_down') return rsi < alert.value
      break

    case 'volume':
      if (volume === undefined) return false
      if (alert.condition === 'above') return volume > alert.value
      break

    case 'support':
    case 'resistance':
      const tolerance = alert.value * 0.001 // 0.1% tolerance
      if (alert.condition === 'enters_zone') {
        return Math.abs(currentPrice - alert.value) < tolerance
      }
      break
  }

  return false
}

// Generate alert message
export function generateAlertMessage(alert: MarketAlert, currentValue: number): string {
  const symbol = alert.symbol
  const type = alert.type.toUpperCase()
  
  switch (alert.type) {
    case 'price':
      if (alert.condition === 'above') {
        return `🚨 ${symbol} PRICE ALERT: Price $${currentValue.toFixed(2)} broke ABOVE $${alert.value}`
      }
      return `🚨 ${symbol} PRICE ALERT: Price $${currentValue.toFixed(2)} broke BELOW $${alert.value}`
    
    case 'rsi':
      return `📊 ${symbol} RSI ALERT: RSI at ${currentValue.toFixed(1)} - ${alert.condition.toUpperCase()} ${alert.value}`
    
    case 'volume':
      return `📈 ${symbol} VOLUME ALERT: Volume spike detected - ${currentValue.toLocaleString()}`
    
    case 'support':
      return `🎯 ${symbol} SUPPORT ALERT: Price testing support at $${alert.value}`
    
    case 'resistance':
      return `🎯 ${symbol} RESISTANCE ALERT: Price testing resistance at $${alert.value}`
    
    default:
      return `⚠️ ${symbol} ALERT TRIGGERED`
  }
}

// Send notification
export async function sendNotification(
  methods: NotificationMethod[],
  message: string,
  userEmail?: string,
  telegramChatId?: string
): Promise<void> {
  for (const method of methods) {
    switch (method) {
      case 'app':
        // In-app notification handled by real-time subscription
        console.log('App notification:', message)
        break

      case 'email':
        if (userEmail) {
          // Email sending would be done via Supabase Edge Functions or external service
          console.log('Email to:', userEmail, 'Message:', message)
        }
        break

      case 'telegram':
        if (telegramChatId) {
          await sendTelegramMessage(telegramChatId, message)
        }
        break
    }
  }
}

// Telegram Bot Integration
export async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  
  if (!botToken) {
    console.log('Telegram bot token not configured')
    return false
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      }
    )

    const data = await response.json()
    return data.ok
  } catch (error) {
    console.error('Telegram error:', error)
    return false
  }
}

// Pre-built alert templates
export const alertTemplates = [
  {
    name: 'Price Above',
    type: 'price' as AlertType,
    condition: 'above' as AlertCondition,
    description: 'Alert when price goes above a level'
  },
  {
    name: 'Price Below',
    type: 'price' as AlertType,
    condition: 'below' as AlertCondition,
    description: 'Alert when price goes below a level'
  },
  {
    name: 'RSI Overbought',
    type: 'rsi' as AlertType,
    condition: 'above' as AlertCondition,
    value: 70,
    description: 'Alert when RSI goes above 70'
  },
  {
    name: 'RSI Oversold',
    type: 'rsi' as AlertType,
    condition: 'below' as AlertCondition,
    value: 30,
    description: 'Alert when RSI goes below 30'
  },
  {
    name: 'Volume Spike',
    type: 'volume' as AlertType,
    condition: 'above' as AlertCondition,
    description: 'Alert on unusual volume'
  },
  {
    name: 'Support Test',
    type: 'support' as AlertType,
    condition: 'enters_zone' as AlertCondition,
    description: 'Alert when price tests support'
  },
  {
    name: 'Resistance Test',
    type: 'resistance' as AlertType,
    condition: 'enters_zone' as AlertCondition,
    description: 'Alert when price tests resistance'
  }
]

// Popular symbols for quick alert creation
export const popularSymbols = [
  { symbol: 'EUR/USD', name: 'Euro/US Dollar', category: 'forex' },
  { symbol: 'GBP/USD', name: 'British Pound/US Dollar', category: 'forex' },
  { symbol: 'USD/JPY', name: 'US Dollar/Japanese Yen', category: 'forex' },
  { symbol: 'BTC/USD', name: 'Bitcoin', category: 'crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum', category: 'crypto' },
  { symbol: 'XAU/USD', name: 'Gold', category: 'commodities' },
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'stocks' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', category: 'stocks' }
]
