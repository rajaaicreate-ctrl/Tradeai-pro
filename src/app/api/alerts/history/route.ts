// Alert History API Route
// Fetches triggered alert history for users

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Fetch alert history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      // Return demo history
      return NextResponse.json({
        success: true,
        history: generateDemoHistory()
      })
    }

    const { data, error } = await supabase
      .from('alert_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      history: data || []
    })

  } catch (error) {
    console.error('Error fetching alert history:', error)
    return NextResponse.json({
      success: true,
      history: generateDemoHistory()
    })
  }
}

// Generate demo history for preview
function generateDemoHistory() {
  return [
    {
      id: 'h1',
      alert_id: '3',
      user_id: 'demo',
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
      user_id: 'demo',
      symbol: 'BTC/USD',
      type: 'price',
      condition: 'above',
      trigger_value: 67500,
      target_value: 67000,
      message: 'Price ($67,500.00) broke ABOVE target $67,000.00',
      notification_sent: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'h3',
      alert_id: 'old-2',
      user_id: 'demo',
      symbol: 'EUR/USD',
      type: 'support',
      condition: 'enters_zone',
      trigger_value: 1.0818,
      target_value: 1.0820,
      message: 'Price testing SUPPORT at $1.08 (current: $1.0818)',
      notification_sent: true,
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'h4',
      alert_id: 'old-3',
      user_id: 'demo',
      symbol: 'SPY',
      type: 'volume',
      condition: 'above',
      trigger_value: 125000000,
      target_value: 100000000,
      message: 'Volume spike! Current: 125,000,000, Threshold: 100,000,000',
      notification_sent: true,
      created_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 'h5',
      alert_id: 'old-4',
      user_id: 'demo',
      symbol: 'ETH/USD',
      type: 'price',
      condition: 'crosses_up',
      trigger_value: 3850,
      target_value: 3800,
      message: 'Price CROSSED UP above $3,800.00 (now $3,850.00)',
      notification_sent: true,
      created_at: new Date(Date.now() - 345600000).toISOString()
    }
  ]
}
