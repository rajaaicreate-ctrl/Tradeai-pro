'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  Plus, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Volume2,
  Target,
  CheckCircle,
  XCircle,
  Mail,
  MessageCircle,
  Smartphone,
  Settings,
  History,
  Zap,
  Clock,
  AlertTriangle,
  ChevronDown,
  Edit2,
  Pause,
  Play,
  Send,
  ExternalLink
} from 'lucide-react'

// Types
interface Alert {
  id: string
  symbol: string
  type: 'price' | 'rsi' | 'breakout' | 'volume' | 'support' | 'resistance'
  condition: 'above' | 'below' | 'crosses_up' | 'crosses_down' | 'enters_zone'
  value: number
  status: 'active' | 'triggered' | 'disabled'
  notification_methods: ('email' | 'telegram' | 'app')[]
  message?: string
  created_at: string
  triggered_at?: string
}

interface AlertHistoryItem {
  id: string
  alert_id: string
  symbol: string
  type: string
  condition: string
  trigger_value: number
  target_value: number
  message: string
  notification_sent: boolean
  created_at: string
}

// Symbol options
const SYMBOLS = [
  { symbol: 'BTC/USD', name: 'Bitcoin', category: 'crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum', category: 'crypto' },
  { symbol: 'XRP/USD', name: 'Ripple', category: 'crypto' },
  { symbol: 'SOL/USD', name: 'Solana', category: 'crypto' },
  { symbol: 'EUR/USD', name: 'Euro/US Dollar', category: 'forex' },
  { symbol: 'GBP/USD', name: 'British Pound/US Dollar', category: 'forex' },
  { symbol: 'USD/JPY', name: 'US Dollar/Japanese Yen', category: 'forex' },
  { symbol: 'XAU/USD', name: 'Gold', category: 'commodities' },
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'stocks' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', category: 'stocks' },
]

// Alert types with conditions
const ALERT_TYPES = [
  { type: 'price', name: 'Price Alert', icon: TrendingUp, conditions: ['above', 'below', 'crosses_up', 'crosses_down'] },
  { type: 'rsi', name: 'RSI Alert', icon: Activity, conditions: ['above', 'below', 'crosses_up', 'crosses_down'] },
  { type: 'support', name: 'Support Level', icon: Target, conditions: ['enters_zone', 'below'] },
  { type: 'resistance', name: 'Resistance Level', icon: Target, conditions: ['enters_zone', 'above'] },
  { type: 'volume', name: 'Volume Spike', icon: Volume2, conditions: ['above'] },
  { type: 'breakout', name: 'Breakout Alert', icon: Zap, conditions: ['above', 'below'] },
]

// Quick templates
const QUICK_TEMPLATES = [
  { label: 'BTC > $70K', symbol: 'BTC/USD', type: 'price' as const, condition: 'above' as const, value: 70000 },
  { label: 'ETH > $4K', symbol: 'ETH/USD', type: 'price' as const, condition: 'above' as const, value: 4000 },
  { label: 'EUR < 1.08', symbol: 'EUR/USD', type: 'price' as const, condition: 'below' as const, value: 1.08 },
  { label: 'Gold < $2300', symbol: 'XAU/USD', type: 'price' as const, condition: 'below' as const, value: 2300 },
  { label: 'RSI Oversold', symbol: 'BTC/USD', type: 'rsi' as const, condition: 'below' as const, value: 30 },
  { label: 'RSI Overbought', symbol: 'BTC/USD', type: 'rsi' as const, condition: 'above' as const, value: 70 },
]

export default function AlertsCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [history, setHistory] = useState<AlertHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('alerts')
  
  // New alert form state
  const [newAlert, setNewAlert] = useState({
    symbol: 'BTC/USD',
    type: 'price' as Alert['type'],
    condition: 'above' as Alert['condition'],
    value: '',
    notification_email: false,
    notification_telegram: false,
    notification_app: true,
  })
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    telegramEnabled: false,
    appEnabled: true,
    telegramChatId: '',
  })

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/alerts')
      const data = await response.json()
      if (data.success) {
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      // Use demo data
      setAlerts(getDemoAlerts())
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts/history')
      const data = await response.json()
      if (data.success) {
        setHistory(data.history || [])
      }
    } catch {
      // Use demo history
      setHistory(getDemoHistory())
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
    fetchHistory()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [fetchAlerts, fetchHistory])

  // Create alert
  const createAlert = async () => {
    const notification_methods: ('email' | 'telegram' | 'app')[] = []
    if (newAlert.notification_email) notification_methods.push('email')
    if (newAlert.notification_telegram) notification_methods.push('telegram')
    if (newAlert.notification_app) notification_methods.push('app')

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: newAlert.symbol,
          type: newAlert.type,
          condition: newAlert.condition,
          value: parseFloat(newAlert.value),
          notification_methods,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setAlerts(prev => [data.alert, ...prev])
        setShowCreateDialog(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      // Add demo alert
      const demoAlert: Alert = {
        id: `demo-${Date.now()}`,
        symbol: newAlert.symbol,
        type: newAlert.type,
        condition: newAlert.condition,
        value: parseFloat(newAlert.value),
        status: 'active',
        notification_methods,
        message: `${newAlert.symbol} ${newAlert.type} alert`,
        created_at: new Date().toISOString(),
      }
      setAlerts(prev => [demoAlert, ...prev])
      setShowCreateDialog(false)
      resetForm()
    }
  }

  // Delete alert
  const deleteAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts?alertId=${id}`, { method: 'DELETE' })
      setAlerts(prev => prev.filter(a => a.id !== id))
    } catch (error) {
      console.error('Error deleting alert:', error)
      setAlerts(prev => prev.filter(a => a.id !== id))
    }
  }

  // Toggle alert status
  const toggleAlertStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active'
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: id, status: newStatus }),
      })
      setAlerts(prev => prev.map(a => 
        a.id === id ? { ...a, status: newStatus as Alert['status'] } : a
      ))
    } catch (error) {
      console.error('Error updating alert:', error)
      setAlerts(prev => prev.map(a => 
        a.id === id ? { ...a, status: newStatus as Alert['status'] } : a
      ))
    }
  }

  // Apply quick template
  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setNewAlert({
      ...newAlert,
      symbol: template.symbol,
      type: template.type,
      condition: template.condition,
      value: template.value.toString(),
    })
    setShowCreateDialog(true)
  }

  // Reset form
  const resetForm = () => {
    setNewAlert({
      symbol: 'BTC/USD',
      type: 'price',
      condition: 'above',
      value: '',
      notification_email: false,
      notification_telegram: false,
      notification_app: true,
    })
  }

  // Demo data
  const getDemoAlerts = (): Alert[] => [
    {
      id: '1',
      symbol: 'BTC/USD',
      type: 'price',
      condition: 'above',
      value: 70000,
      status: 'active',
      notification_methods: ['app', 'email'],
      message: 'Bitcoin above $70K',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2',
      symbol: 'EUR/USD',
      type: 'support',
      condition: 'enters_zone',
      value: 1.0820,
      status: 'active',
      notification_methods: ['app'],
      message: 'EUR support test',
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: '3',
      symbol: 'XAU/USD',
      type: 'rsi',
      condition: 'below',
      value: 30,
      status: 'triggered',
      notification_methods: ['app', 'telegram'],
      message: 'Gold RSI oversold',
      created_at: new Date(Date.now() - 259200000).toISOString(),
      triggered_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '4',
      symbol: 'SPY',
      type: 'volume',
      condition: 'above',
      value: 100000000,
      status: 'active',
      notification_methods: ['app'],
      message: 'SPY volume spike',
      created_at: new Date(Date.now() - 43200000).toISOString()
    },
  ]

  const getDemoHistory = (): AlertHistoryItem[] => [
    {
      id: 'h1',
      alert_id: '3',
      symbol: 'XAU/USD',
      type: 'rsi',
      condition: 'below',
      trigger_value: 28.5,
      target_value: 30,
      message: 'RSI (28.5) is BELOW 30 - OVERSOLD!',
      notification_sent: true,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'h2',
      alert_id: 'old-1',
      symbol: 'BTC/USD',
      type: 'price',
      condition: 'above',
      trigger_value: 67500,
      target_value: 67000,
      message: 'Price broke ABOVE target $67,000',
      notification_sent: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
  ]

  // Get icon for alert type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price': return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'rsi': return <Activity className="h-4 w-4 text-purple-400" />
      case 'support': return <Target className="h-4 w-4 text-blue-400" />
      case 'resistance': return <Target className="h-4 w-4 text-red-400" />
      case 'volume': return <Volume2 className="h-4 w-4 text-cyan-400" />
      case 'breakout': return <Zap className="h-4 w-4 text-yellow-400" />
      default: return <Bell className="h-4 w-4 text-gray-400" />
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'triggered':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Bell className="h-3 w-3 mr-1" />Triggered</Badge>
      case 'disabled':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30"><XCircle className="h-3 w-3 mr-1" />Disabled</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400"><XCircle className="h-3 w-3 mr-1" />Unknown</Badge>
    }
  }

  // Get condition label
  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'above': return '>'
      case 'below': return '<'
      case 'crosses_up': return '↗'
      case 'crosses_down': return '↘'
      case 'enters_zone': return '≈'
      default: return condition
    }
  }

  // Format value
  const formatValue = (type: string, value: number) => {
    if (type === 'rsi') return value.toFixed(0)
    if (type === 'volume') return (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000) return '$' + value.toLocaleString()
    return '$' + value.toFixed(4)
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-400" />
            Alerts Center
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {alerts.filter(a => a.status === 'active').length} Active
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchAlerts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Alert</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Symbol Selection */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Symbol</Label>
                    <select
                      value={newAlert.symbol}
                      onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                      className="w-full bg-gray-800 border-gray-700 text-white rounded-lg p-2.5"
                    >
                      {SYMBOLS.map((s) => (
                        <option key={s.symbol} value={s.symbol}>
                          {s.symbol} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Alert Type */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Alert Type</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {ALERT_TYPES.map((t) => (
                        <button
                          key={t.type}
                          onClick={() => setNewAlert({ ...newAlert, type: t.type as Alert['type'], condition: t.conditions[0] as Alert['condition'] })}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            newAlert.type === t.type
                              ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                              : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <t.icon className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-xs">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Condition</Label>
                    <select
                      value={newAlert.condition}
                      onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as Alert['condition'] })}
                      className="w-full bg-gray-800 border-gray-700 text-white rounded-lg p-2.5"
                    >
                      {ALERT_TYPES.find(t => t.type === newAlert.type)?.conditions.map((c) => (
                        <option key={c} value={c}>
                          {c === 'above' ? 'Goes Above' :
                           c === 'below' ? 'Goes Below' :
                           c === 'crosses_up' ? 'Crosses Up' :
                           c === 'crosses_down' ? 'Crosses Down' :
                           c === 'enters_zone' ? 'Enters Zone' : c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Value */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      {newAlert.type === 'rsi' ? 'RSI Value (0-100)' :
                       newAlert.type === 'volume' ? 'Volume Threshold' :
                       'Price Level'}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {newAlert.type === 'rsi' ? '' : '$'}
                      </span>
                      <Input
                        type="number"
                        placeholder={newAlert.type === 'rsi' ? 'e.g., 70' : '0.00'}
                        value={newAlert.value}
                        onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                        className="bg-gray-800 border-gray-700 pl-8"
                      />
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-3">
                    <Label className="text-gray-300">Notification Channels</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm text-gray-300">In-App</span>
                        </div>
                        <Switch
                          checked={newAlert.notification_app}
                          onCheckedChange={(checked) => setNewAlert({ ...newAlert, notification_app: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-gray-300">Email</span>
                        </div>
                        <Switch
                          checked={newAlert.notification_email}
                          onCheckedChange={(checked) => setNewAlert({ ...newAlert, notification_email: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-gray-300">Telegram</span>
                        </div>
                        <Switch
                          checked={newAlert.notification_telegram}
                          onCheckedChange={(checked) => setNewAlert({ ...newAlert, notification_telegram: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="ghost" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createAlert}
                    disabled={!newAlert.value}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Alerts */}
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((template, i) => (
            <Button 
              key={i} 
              variant="outline" 
              size="sm" 
              className="text-xs border-gray-700 hover:border-purple-500 hover:text-purple-400"
              onClick={() => applyTemplate(template)}
            >
              {template.label}
            </Button>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800/50 w-full">
            <TabsTrigger value="alerts" className="flex-1">
              <Bell className="h-4 w-4 mr-1" />
              Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              <History className="h-4 w-4 mr-1" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="mt-4">
            {/* Alerts List */}
            <ScrollArea className="max-h-[350px]">
              <div className="space-y-2">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse bg-gray-800/50 rounded p-4 h-20"></div>
                    ))}
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No alerts yet. Create your first alert!</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`bg-gray-800/50 rounded-lg p-3 border flex items-center justify-between group transition-all ${
                        alert.status === 'triggered' ? 'border-amber-500/50 bg-amber-500/5' :
                        alert.status === 'disabled' ? 'border-gray-700/30 opacity-60' :
                        'border-gray-700/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getTypeIcon(alert.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{alert.symbol}</span>
                            {getStatusBadge(alert.status)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <span className="capitalize">{alert.type}</span>
                            <span className="text-cyan-400">{getConditionLabel(alert.condition)}</span>
                            <span className="text-white font-mono">{formatValue(alert.type, alert.value)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 opacity-60">
                          {alert.notification_methods.map((m, i) => (
                            m === 'telegram' ? <MessageCircle key={i} className="h-3 w-3 text-green-400" /> :
                            m === 'email' ? <Mail key={i} className="h-3 w-3 text-blue-400" /> :
                            <Smartphone key={i} className="h-3 w-3 text-cyan-400" />
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAlertStatus(alert.id, alert.status)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        >
                          {alert.status === 'active' ? 
                            <Pause className="h-3 w-3 text-amber-400" /> :
                            <Play className="h-3 w-3 text-green-400" />
                          }
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ScrollArea className="max-h-[350px]">
              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No triggered alerts yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="text-white font-medium text-sm">{item.symbol}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{item.message}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4 text-gray-400">
                          <span>Target: <span className="text-white">{formatValue(item.type, item.target_value)}</span></span>
                          <span>Actual: <span className="text-green-400">{formatValue(item.type, item.trigger_value)}</span></span>
                        </div>
                        {item.notification_sent && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            <Send className="h-3 w-3 mr-1" />Sent
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{alerts.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{alerts.filter(a => a.status === 'active').length}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">{history.length}</div>
            <div className="text-xs text-gray-500">Triggered</div>
          </div>
        </div>
      </CardContent>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notification Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Telegram Setup */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-400" />
                  <span className="text-white font-medium">Telegram</span>
                </div>
                <Switch
                  checked={notificationSettings.telegramEnabled}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, telegramEnabled: checked })}
                />
              </div>
              {notificationSettings.telegramEnabled && (
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs">Chat ID</Label>
                  <Input
                    placeholder="Your Telegram Chat ID"
                    value={notificationSettings.telegramChatId}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, telegramChatId: e.target.value })}
                    className="bg-gray-900 border-gray-700"
                  />
                  <a 
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    How to get your Chat ID
                  </a>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">Email Notifications</span>
              </div>
              <Switch
                checked={notificationSettings.emailEnabled}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailEnabled: checked })}
              />
            </div>

            {/* In-App */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-cyan-400" />
                <span className="text-white font-medium">In-App Notifications</span>
              </div>
              <Switch
                checked={notificationSettings.appEnabled}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, appEnabled: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => setShowSettingsDialog(false)}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
