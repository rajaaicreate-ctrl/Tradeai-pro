import { NextRequest, NextResponse } from 'next/server'

// Test Email Endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    // Send test email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TradeAI Pro <onboarding@resend.dev>',
        to: [email],
        subject: '🎉 TradeAI Pro - Email Connected Successfully!',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-radius: 16px; border: 1px solid rgba(99, 102, 241, 0.2);">

          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #fff; font-size: 28px;">
                ⚡ TradeAI Pro
              </h1>
              <p style="margin: 10px 0 0; color: #a5b4fc; font-size: 14px;">
                Real-Time Trading Alerts
              </p>
            </td>
          </tr>

          <!-- Success Message -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">✓</span>
              </div>
              <h2 style="margin: 30px 0 15px; color: #10b981; font-size: 24px;">
                Email Connected!
              </h2>
              <p style="margin: 0; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                Your email is now connected to TradeAI Pro.<br>
                You will receive trading alerts here.
              </p>
            </td>
          </tr>

          <!-- Features -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 25px;">
                <h3 style="margin: 0 0 20px; color: #a5b4fc; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Alert Types You'll Receive
                </h3>
                <table width="100%">
                  <tr>
                    <td style="padding: 10px 0; color: #10b981; font-size: 14px;">Price Alerts</td>
                    <td style="padding: 10px 0; color: #10b981; font-size: 14px;">RSI Alerts</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #10b981; font-size: 14px;">Pattern Alerts</td>
                    <td style="padding: 10px 0; color: #10b981; font-size: 14px;">Volume Alerts</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #10b981; font-size: 14px;">Breakout Alerts</td>
                    <td style="padding: 10px 0; color: #10b981; font-size: 14px;">Trade Signals</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                This is a test email from TradeAI Pro<br>
                <a href="https://tradeai-live.vercel.app" style="color: #a5b4fc;">Open Dashboard</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Resend error:', result)
      return NextResponse.json({
        success: false,
        error: result.message || 'Failed to send email'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messageId: result.id,
      message: 'Test email sent successfully!'
    })

  } catch (error: any) {
    console.error('Email test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// GET - Check if Resend is configured
export async function GET() {
  const apiKey = process.env.RESEND_API_KEY

  return NextResponse.json({
    configured: !!apiKey,
    keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : null
  })
}
