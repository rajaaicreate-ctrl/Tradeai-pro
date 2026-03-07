'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { sendTelegramNotification } from '@/lib/notifications'
import {
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'

interface TelegramSettingsProps {
  userId?: string
  currentChatId?: string
  onChatIdUpdate?: (chatId: string) => void
}

export default function TelegramSettings({ userId, currentChatId, onChatIdUpdate }: TelegramSettingsProps) {
  const [chatId, setChatId] = useState(currentChatId || '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const botUsername = '@tradeaipro_alert_bot'

  const handleTestNotification = async () => {
    if (!chatId) {
      setTestResult('error')
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const result = await sendTelegramNotification(chatId, {
        title: '🔔 Test Notification',
        message: 'Your Telegram is successfully connected to TradeAI Pro! You will receive trading alerts here.',
        type: 'system'
      })

      setTestResult(result.sent ? 'success' : 'error')
    } catch (error) {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!chatId || !userId) return

    setSaving(true)
    try {
      // Save to user preferences
      const response = await fetch('/api/user/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, chatId })
      })

      if (response.ok) {
        onChatIdUpdate?.(chatId)
      }
    } catch (error) {
      console.error('Failed to save chat ID:', error)
    } finally {
      setSaving(false)
    }
  }

  const copyBotLink = () => {
    navigator.clipboard.writeText(`https://t.me/${botUsername.replace('@', '')}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-400" />
          Telegram Notifications
        </CardTitle>
        <CardDescription>
          Receive instant trading alerts directly on Telegram
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          {currentChatId ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <h4 className="text-white font-medium flex items-center gap-2">
            📱 How to Connect
          </h4>
          <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
            <li>
              Open Telegram and search for{' '}
              <span className="text-blue-400 font-mono">{botUsername}</span>
            </li>
            <li>
              Click <span className="text-white">Start</span> or send{' '}
              <span className="text-white font-mono">/start</span>
            </li>
            <li>
              Copy your Chat ID from the bot's reply
            </li>
            <li>
              Paste it below and click Save
            </li>
          </ol>

          {/* Quick Links */}
          <div className="flex gap-2 pt-2">
            <a
              href={`https://t.me/${botUsername.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
            >
              <Send className="h-4 w-4" />
              Open Bot
              <ExternalLink className="h-3 w-3" />
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={copyBotLink}
              className="border-gray-700 text-gray-300"
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>

        {/* Chat ID Input */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Your Telegram Chat ID</label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., 123456789"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white font-mono"
            />
            <Button
              onClick={handleSave}
              disabled={!chatId || saving}
              className="bg-green-500 hover:bg-green-600 whitespace-nowrap"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Your Chat ID is a unique number. The bot will show it when you send /start
          </p>
        </div>

        {/* Test Button */}
        {chatId && (
          <div className="pt-4 border-t border-gray-800">
            <Button
              onClick={handleTestNotification}
              disabled={testing}
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              {testing ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                  Sending Test...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Notification
                </>
              )}
            </Button>

            {testResult === 'success' && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="h-4 w-4" />
                Test notification sent! Check your Telegram.
              </div>
            )}

            {testResult === 'error' && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                Failed to send. Please check your Chat ID.
              </div>
            )}
          </div>
        )}

        {/* Alert Types */}
        <div className="pt-4 border-t border-gray-800">
          <h4 className="text-white font-medium mb-3">🔔 Alert Types Supported</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-green-500/30 text-green-400">Price Alerts</Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400">RSI Alerts</Badge>
            <Badge variant="outline" className="border-purple-500/30 text-purple-400">Pattern Alerts</Badge>
            <Badge variant="outline" className="border-orange-500/30 text-orange-400">Volume Alerts</Badge>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">Breakout Alerts</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
