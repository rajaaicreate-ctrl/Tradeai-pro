// Alert Monitor API Route
// Runs the alert checking process

import { NextRequest, NextResponse } from 'next/server'
import { runAlertMonitor } from '@/lib/alert-monitoring'

export const dynamic = 'force-dynamic'

// GET - Run alert monitor
export async function GET(request: NextRequest) {
  try {
    // Verify API key for scheduled jobs (optional security)
    const authHeader = request.headers.get('authorization')
    const cronKey = process.env.CRON_SECRET
    
    // Allow if no cron secret is set (development) or if key matches
    if (cronKey && authHeader !== `Bearer ${cronKey}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Run the alert monitor
    const result = await runAlertMonitor()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    })

  } catch (error: any) {
    console.error('Alert monitor API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Alert monitor failed'
    }, { status: 500 })
  }
}

// POST - Check specific alerts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertIds, userId } = body

    if (!alertIds || !Array.isArray(alertIds)) {
      return NextResponse.json({
        success: false,
        error: 'alertIds array required'
      }, { status: 400 })
    }

    // For demo mode, simulate alert checking
    const results = alertIds.map(id => ({
      alertId: id,
      checked: true,
      timestamp: new Date().toISOString()
    }))

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error: any) {
    console.error('Alert check error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Alert check failed'
    }, { status: 500 })
  }
}
