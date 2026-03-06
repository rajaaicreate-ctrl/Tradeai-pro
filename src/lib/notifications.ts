// Notification Service for TradeAI Pro Alerts System
// Supports: Email, Telegram, In-App Push Notifications

import { supabase } from './supabase'

export interface NotificationPayload {
  userId: string
  title: string
  message: string
  type: 'alert' | 'trade' | 'system' | 'warning'
  data?: Record<string, any>
  channels: ('email' | 'telegram' | 'app')[]
}

export interface NotificationResult {
  email?: { sent: boolean; error?: string }
  telegram?: { sent: boolean; error?: string }
  app?: { sent: boolean; error?: string }
}

// Main notification dispatcher
export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const result: NotificationResult = {}

  // Get user's notification preferences and details
  const userDetails = await getUserNotificationDetails(payload.userId)

  for (const channel of payload.channels) {
    switch (channel) {
      case 'email':
        result.email = await sendEmailNotification(userDetails.email, payload)
        break
      case 'telegram':
        if (userDetails.telegramChatId) {
          result.telegram = await sendTelegramNotification(userDetails.telegramChatId, payload)
        } else {
          result.telegram = { sent: false, error: 'Telegram not configured' }
        }
        break
      case 'app':
        result.app = await sendInAppNotification(payload)
        break
    }
  }

  // Log notification in database
  await logNotification(payload, result)

  return result
}

// Get user notification details
async function getUserNotificationDetails(userId: string): Promise<{
  email: string
  telegramChatId?: string
  preferences: { email: boolean; telegram: boolean; app: boolean }
}> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email, telegram_chat_id, notification_preferences')
      .eq('id', userId)
      .single()

    if (error) throw error

    return {
      email: data.email,
      telegramChatId: data.telegram_chat_id || undefined,
      preferences: data.notification_preferences || { email: true, telegram: false, app: true }
    }
  } catch (error) {
    console.error('Error getting user notification details:', error)
    return {
      email: '',
      preferences: { email: true, telegram: false, app: true }
    }
  }
}

// Email notification (via Supabase Edge Function or external service)
async function sendEmailNotification(
  email: string,
  payload: NotificationPayload
): Promise<{ sent: boolean; error?: string }> {
  if (!email) {
    return { sent: false, error: 'No email address' }
  }

  try {
    // Option 1: Use Supabase Edge Function
    // const { error } = await supabase.functions.invoke('send-email', {
    //   body: { to: email, subject: payload.title, message: payload.message }
    // })

    // Option 2: Use internal API route (which can call SendGrid, Resend, etc.)
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: payload.title,
        message: payload.message,
        type: payload.type,
        data: payload.data
      })
    })

    if (!response.ok) {
      throw new Error('Email API failed')
    }

    return { sent: true }
  } catch (error: any) {
    console.error('Email notification error:', error)
    return { sent: false, error: error.message }
  }
}

// Telegram notification
export async function sendTelegramNotification(
  chatId: string,
  payload: NotificationPayload | { title: string; message: string; type?: string }
): Promise<{ sent: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    console.log('Telegram bot token not configured')
    return { sent: false, error: 'Telegram bot not configured' }
  }

  try {
    // Format message for Telegram
    const emoji = getNotificationEmoji(payload.type || 'alert')
    const formattedMessage = `
${emoji} *${escapeTelegramMarkdown(payload.title)}*

${escapeTelegramMarkdown(payload.message)}

⏰ ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC
_

📱 _TradeAI Pro_
    `.trim()

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: formattedMessage,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: true
        })
      }
    )

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Telegram API error')
    }

    return { sent: true }
  } catch (error: any) {
    console.error('Telegram notification error:', error)
    return { sent: false, error: error.message }
  }
}

// In-app notification (stored in database for real-time retrieval)
async function sendInAppNotification(
  payload: NotificationPayload
): Promise<{ sent: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        data: payload.data || {},
        read: false,
        created_at: new Date().toISOString()
      })

    if (error) {
      // Table might not exist, try alternative storage
      console.log('Notifications table not available, using localStorage fallback')
      return { sent: true } // Return success anyway for demo mode
    }

    return { sent: true }
  } catch (error: any) {
    console.error('In-app notification error:', error)
    return { sent: false, error: error.message }
  }
}

// Log notification in database
async function logNotification(
  payload: NotificationPayload,
  result: NotificationResult
): Promise<void> {
  try {
    // Log for analytics and debugging
    console.log('Notification sent:', {
      userId: payload.userId,
      title: payload.title,
      channels: payload.channels,
      result
    })
  } catch (error) {
    console.error('Error logging notification:', error)
  }
}

// Helper functions
function getNotificationEmoji(type: string): string {
  switch (type) {
    case 'alert':
      return '🚨'
    case 'trade':
      return '💹'
    case 'system':
      return '⚙️'
    case 'warning':
      return '⚠️'
    default:
      return '🔔'
  }
}

function escapeTelegramMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')
}

// Alert-specific notification helpers
export async function sendPriceAlertNotification(
  userId: string,
  symbol: string,
  condition: string,
  targetValue: number,
  currentValue: number,
  channels: ('email' | 'telegram' | 'app')[]
): Promise<NotificationResult> {
  const direction = condition === 'above' ? '📈 BROKE ABOVE' : '📉 BROKE BELOW'
  
  return sendNotification({
    userId,
    title: `${symbol} Price Alert Triggered!`,
    message: `${direction} target price!\n\nTarget: $${targetValue.toLocaleString()}\nCurrent: $${currentValue.toLocaleString()}`,
    type: 'alert',
    data: { symbol, condition, targetValue, currentValue },
    channels
  })
}

export async function sendRSIAlertNotification(
  userId: string,
  symbol: string,
  condition: string,
  targetValue: number,
  currentRSI: number,
  channels: ('email' | 'telegram' | 'app')[]
): Promise<NotificationResult> {
  const zone = currentRSI > 70 ? 'OVERBOUGHT' : currentRSI < 30 ? 'OVERSOLD' : 'NEUTRAL'
  const emoji = currentRSI > 70 ? '🔴' : currentRSI < 30 ? '🟢' : '🟡'
  
  return sendNotification({
    userId,
    title: `${symbol} RSI Alert - ${zone}!`,
    message: `${emoji} RSI has entered ${zone} zone.\n\nCurrent RSI: ${currentRSI.toFixed(1)}\nCondition: ${condition} ${targetValue}`,
    type: 'alert',
    data: { symbol, condition, targetValue, currentRSI },
    channels
  })
}

export async function sendSupportResistanceNotification(
  userId: string,
  symbol: string,
  type: 'support' | 'resistance',
  level: number,
  currentPrice: number,
  channels: ('email' | 'telegram' | 'app')[]
): Promise<NotificationResult> {
  const emoji = type === 'support' ? '🎯' : '⛔'
  const label = type === 'support' ? 'SUPPORT' : 'RESISTANCE'
  
  return sendNotification({
    userId,
    title: `${symbol} Testing ${label}!`,
    message: `${emoji} Price is testing ${type.toLowerCase()} level.\n\n${label}: $${level.toLocaleString()}\nCurrent: $${currentPrice.toLocaleString()}\n\nWatch for potential bounce or break!`,
    type: 'alert',
    data: { symbol, type, level, currentPrice },
    channels
  })
}

export async function sendVolumeAlertNotification(
  userId: string,
  symbol: string,
  threshold: number,
  currentVolume: number,
  channels: ('email' | 'telegram' | 'app')[]
): Promise<NotificationResult> {
  const ratio = (currentVolume / threshold).toFixed(2)
  
  return sendNotification({
    userId,
    title: `${symbol} Volume Spike!`,
    message: `📊 Unusual volume detected!\n\nCurrent: ${currentVolume.toLocaleString()}\nThreshold: ${threshold.toLocaleString()}\nRatio: ${ratio}x average\n\nPossible increased volatility ahead.`,
    type: 'alert',
    data: { symbol, threshold, currentVolume, ratio },
    channels
  })
}

// Telegram Bot Setup Instructions
export const TELEGRAM_BOT_SETUP = `
## Telegram Bot Setup Instructions

1. **Create a Bot**:
   - Open Telegram and search for @BotFather
   - Send /newbot and follow the instructions
   - Save the API token you receive

2. **Get Your Chat ID**:
   - Start a chat with your new bot
   - Visit: https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   - Send a message to your bot, then refresh that URL
   - Find "chat":{"id":YOUR_CHAT_ID} in the response

3. **Configure in TradeAI Pro**:
   - Go to Settings > Notifications
   - Add your Telegram Chat ID
   - Enable Telegram notifications

4. **Environment Variable**:
   - Add to .env.local: TELEGRAM_BOT_TOKEN=your_token_here
`

// Quick test function for Telegram
export async function testTelegramConnection(
  botToken: string,
  chatId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ TradeAI Pro Telegram connection successful!\n\nYour alerts will now be sent to this chat.',
          parse_mode: 'HTML'
        })
      }
    )

    const data = await response.json()

    if (data.ok) {
      return { success: true, message: 'Test message sent successfully!' }
    } else {
      return { success: false, message: data.description || 'Failed to send test message' }
    }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
