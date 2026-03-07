'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Loader2,
  Sparkles,
  BarChart3,
  Shield,
  AlertTriangle
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  analysis?: any
  timestamp: Date
}

interface CopilotProps {
  className?: string
}

export default function AIMarketCopilot({ className }: CopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Hello! I\'m your AI Market Copilot. Ask me anything about markets - trends, support/resistance levels, indicators, and more. I can analyze Forex, Crypto, Gold, US Stocks, and Indian Stocks.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestedQuestions = [
    "How is the crypto market today?",
    "Is BTC bullish?",
    "Indian stocks outlook",
    "What is the trend for Gold?",
    "Forex market analysis"
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (question?: string) => {
    const query = question || input.trim()
    if (!query || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Build conversation history for context (last 10 messages)
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))
      
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: query,
          history: conversationHistory
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response || formatAnalysisResponse(data.data),
          analysis: data.data.analysis,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const formatAnalysisResponse = (data: any): string => {
    if (!data.analysis) return data.response || 'Analysis complete.'
    
    const { asset, analysis } = data
    
    return `**${asset} Analysis**

📈 **Trend:** ${analysis.trend}
📊 **RSI:** ${analysis.indicators.rsi}
⚡ **MACD:** ${analysis.indicators.macd.trend}

🎯 **Support:** ${analysis.levels.support}
🎯 **Resistance:** ${analysis.levels.resistance}

💡 **Insight:** ${analysis.insight}

✅ **Confidence:** ${analysis.confidence}%`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderAnalysisCard = (analysis: any, asset: string) => {
    if (!analysis) return null

    return (
      <div className="mt-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
        {/* Asset and Trend */}
        <div className="flex items-center justify-between">
          <Badge className="bg-cyan-500/20 text-cyan-400 text-sm">
            {asset}
          </Badge>
          <Badge className={
            analysis.trend === 'Bullish' ? 'bg-green-500/20 text-green-400' :
            analysis.trend === 'Bearish' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }>
            {analysis.trend === 'Bullish' ? <TrendingUp className="h-3 w-3 mr-1" /> :
             analysis.trend === 'Bearish' ? <TrendingDown className="h-3 w-3 mr-1" /> :
             <Activity className="h-3 w-3 mr-1" />}
            {analysis.trend}
          </Badge>
        </div>

        {/* Indicators Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
            <span className="text-gray-400">RSI</span>
            <span className={`font-medium ${
              analysis.indicators.rsi > 70 ? 'text-red-400' :
              analysis.indicators.rsi < 30 ? 'text-green-400' :
              'text-white'
            }`}>{analysis.indicators.rsi}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
            <span className="text-gray-400">MACD</span>
            <span className={`font-medium text-xs ${
              analysis.indicators.macd.trend.includes('Bullish') ? 'text-green-400' : 'text-red-400'
            }`}>{analysis.indicators.macd.trend}</span>
          </div>
        </div>

        {/* Support & Resistance */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
            <div className="text-gray-400 text-xs">Support</div>
            <div className="text-green-400 font-medium">{analysis.levels.support}</div>
          </div>
          <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
            <div className="text-gray-400 text-xs">Resistance</div>
            <div className="text-red-400 font-medium">{analysis.levels.resistance}</div>
          </div>
        </div>

        {/* Insight */}
        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-400 text-xs mb-1">
            <Sparkles className="h-3 w-3" />
            AI Insight
          </div>
          <p className="text-gray-300 text-sm">{analysis.insight}</p>
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            <span className="text-gray-400">Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  analysis.confidence >= 70 ? 'bg-green-500' :
                  analysis.confidence >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${analysis.confidence}%` }}
              />
            </div>
            <span className="text-white font-medium text-sm">{analysis.confidence}%</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 flex items-start gap-1">
          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          Educational purposes only. Not investment advice.
        </div>
      </div>
    )
  }

  return (
    <Card className={`bg-gray-900/50 border-gray-800 h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">AI Market Copilot</CardTitle>
              <p className="text-gray-400 text-xs">Ask any market question</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Online
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-purple-500/20 text-white'
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.analysis && (
                    <div className="mt-2">
                      {renderAnalysisCard(message.analysis, message.analysis.asset || 'Asset')}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing market data...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about any market..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              disabled={loading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
