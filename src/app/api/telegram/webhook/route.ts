import { NextRequest, NextResponse } from 'next/server'

// Telegram Webhook Handler
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      last_name?: string
      username?: string
      language_code: string
    }
    chat: {
      id: number
      type: string
      first_name?: string
      last_name?: string
      username?: string
    }
    date: number
    text?: string
  }
  callback_query?: {
    id: string
    from: {
      id: number
      is_bot: boolean
      first_name: string
      username?: string
    }
    message: any
    data: string
  }
}

async function sendMessage(chatId: number, text: string, parseMode: string = 'Markdown') {
  if (!BOT_TOKEN) return

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: true
      })
    })
  } catch (error) {
    console.error('Error sending Telegram message:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()

    if (update.message?.text) {
      const chatId = update.message.chat.id
      const text = update.message.text.toLowerCase()
      const firstName = update.message.from.first_name

      if (text === '/start') {
        const welcomeMessage = `
🎉 *Welcome to TradeAI Pro Alerts, ${firstName}!*

You're now connected to receive real-time trading alerts.

📋 *Your Chat ID:* \`${chatId}\`

🔗 *To link your account:*
1. Go to TradeAI Pro Dashboard
2. Navigate to Settings
3. Enter your Chat ID: \`${chatId}\`

📢 *Available Commands:*
/start - Show this message
/help - Get help
/status - Check connection status

📱 [Open TradeAI Pro](https://tradeai-live.vercel.app)
        `.trim()

        await sendMessage(chatId, welcomeMessage)
      }
      else if (text === '/help') {
        await sendMessage(chatId, `
📚 *TradeAI Pro Bot Help*

🔔 *Alert Types:*
• Price Alerts - Get notified when price hits target
• RSI Alerts - RSI overbought/oversold signals
• Pattern Alerts - Chart pattern detections

📱 *How to Use:*
1. Create alerts in TradeAI Pro dashboard
2. Select Telegram as notification channel
3. Receive instant alerts here!

💬 Need help? Contact support@tradeai.pro
        `.trim())
      }
      else if (text === '/status') {
        await sendMessage(chatId, `
📊 *Connection Status*

✅ Bot: Online
✅ Chat ID: \`${chatId}\`

🔄 Last checked: ${new Date().toLocaleString()}
        `.trim())
      }
      else {
        await sendMessage(chatId, `🤖 Unknown command. Type /help to see available commands.`)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })
  }

  if (action === 'set_webhook') {
    const webhookUrl = `${request.nextUrl.origin}/api/telegram/webhook`

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webhookUrl })
        }
      )

      const data = await response.json()

      return NextResponse.json({
        success: data.ok,
        result: data.result,
        webhookUrl: webhookUrl
      })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  if (action === 'info') {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
      )
      const data = await response.json()
      return NextResponse.json(data)
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Get bot info
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getMe`
    )
    const data = await response.json()

    return NextResponse.json({
      success: data.ok,
      bot: data.result,
      webhookSetupUrl: `${request.nextUrl.origin}/api/telegram/webhook?action=set_webhook`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
