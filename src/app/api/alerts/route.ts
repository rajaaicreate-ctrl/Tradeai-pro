import { NextRequest, NextResponse } from 'next/server';
import { createAlert, getUserAlerts, deleteAlert, updateAlertStatus, MarketAlert } from '@/lib/alerts';

// GET - Fetch user alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      // Return demo alerts if no userId
      return NextResponse.json({
        success: true,
        alerts: generateDemoAlerts()
      });
    }

    const alerts = await getUserAlerts(userId);
    
    return NextResponse.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch alerts'
    }, { status: 500 });
  }
}

// POST - Create new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, symbol, type, condition, value, notification_methods, message } = body;

    // Validate required fields
    if (!symbol || !type || !condition || value === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // If no user_id, create demo alert
    if (!user_id) {
      const demoAlert: MarketAlert = {
        id: `demo-${Date.now()}`,
        user_id: 'demo-user',
        symbol,
        type,
        condition,
        value: parseFloat(value),
        status: 'active',
        notification_methods: notification_methods || ['app'],
        message: message || `Alert for ${symbol}`,
        created_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        alert: demoAlert,
        message: 'Demo alert created (no user logged in)'
      });
    }

    const alert = await createAlert({
      user_id,
      symbol,
      type,
      condition,
      value: parseFloat(value),
      notification_methods: notification_methods || ['app'],
      message
    });

    if (!alert) {
      throw new Error('Failed to create alert');
    }

    return NextResponse.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create alert'
    }, { status: 500 });
  }
}

// DELETE - Remove alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json({
        success: false,
        error: 'Alert ID required'
      }, { status: 400 });
    }

    // For demo alerts, just return success
    if (alertId.startsWith('demo-')) {
      return NextResponse.json({
        success: true,
        message: 'Demo alert deleted'
      });
    }

    const success = await deleteAlert(alertId);

    if (!success) {
      throw new Error('Failed to delete alert');
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete alert'
    }, { status: 500 });
  }
}

// PATCH - Update alert status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, status } = body;

    if (!alertId || !status) {
      return NextResponse.json({
        success: false,
        error: 'Alert ID and status required'
      }, { status: 400 });
    }

    // For demo alerts, just return success
    if (alertId.startsWith('demo-')) {
      return NextResponse.json({
        success: true,
        message: 'Demo alert updated'
      });
    }

    const success = await updateAlertStatus(alertId, status);

    if (!success) {
      throw new Error('Failed to update alert');
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update alert'
    }, { status: 500 });
  }
}

// Generate demo alerts for preview
function generateDemoAlerts(): MarketAlert[] {
  return [
    {
      id: 'demo-1',
      user_id: 'demo',
      symbol: 'BTC/USD',
      type: 'price',
      condition: 'above',
      value: 70000,
      status: 'active',
      notification_methods: ['app', 'email'],
      message: 'Bitcoin above $70,000',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'demo-2',
      user_id: 'demo',
      symbol: 'EUR/USD',
      type: 'support',
      condition: 'enters_zone',
      value: 1.0820,
      status: 'active',
      notification_methods: ['app'],
      message: 'EUR/USD support test',
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'demo-3',
      user_id: 'demo',
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
      id: 'demo-4',
      user_id: 'demo',
      symbol: 'SPY',
      type: 'volume',
      condition: 'above',
      value: 100000000,
      status: 'active',
      notification_methods: ['app'],
      message: 'SPY volume spike',
      created_at: new Date(Date.now() - 43200000).toISOString()
    }
  ];
}
