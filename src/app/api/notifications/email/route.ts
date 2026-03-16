// Email Notification API Route
// Uses external email service (SendGrid, Resend, etc.)

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message, type, data } = body

    // Validate required fields
    if (!to || !subject || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: to, subject, message'
      }, { status: 400 })
    }

    // Check for email service configuration
    const emailService = process.env.EMAIL_SERVICE || 'resend'
    const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY

    if (!apiKey) {
      // Demo mode - just log the email
      console.log('📧 Email Notification (Demo Mode):', {
        to,
        subject,
        message,
        type,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: 'Email logged (demo mode - no API key configured)',
        demo: true
      })
    }

    // Send via Resend
    if (emailService === 'resend') {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'TradeAI Pro <alerts@tradeai.pro>',
          to: [to],
          subject: subject,
          html: generateEmailHTML(subject, message, type, data)
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Resend API error')
      }

      return NextResponse.json({
        success: true,
        messageId: result.id
      })
    }

    // Send via SendGrid
    if (emailService === 'sendgrid') {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: 'alerts@tradeai.pro', name: 'TradeAI Pro' },
          subject: subject,
          content: [
            {
              type: 'text/html',
              value: generateEmailHTML(subject, message, type, data)
            }
          ]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'SendGrid API error')
      }

      return NextResponse.json({
        success: true
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Email service not configured'
    }, { status: 500 })

  } catch (error: any) {
    console.error('Email notification error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send email'
    }, { status: 500 })
  }
}

// Generate HTML email content
function generateEmailHTML(
  subject: string,
  message: string,
  type: string,
  data: Record<string, any> | undefined
): string {
  const typeColors: Record<string, string> = {
    alert: '#f59e0b',
    trade: '#10b981',
    system: '#6366f1',
    warning: '#ef4444'
  }

  const color = typeColors[type] || '#6366f1'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(99, 102, 241, 0.2);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(90deg, ${color}22, transparent); border-bottom: 1px solid rgba(255,255,255,0.1);">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: 700;">
                      <span style="color: ${color};">⚡</span> TradeAI Pro
                    </h1>
                  </td>
                  <td align="right">
                    <span style="background: ${color}22; color: ${color}; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      ${type}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #fff; font-size: 20px; font-weight: 600;">
                ${subject}
              </h2>
              <p style="margin: 0; color: #94a3b8; font-size: 16px; line-height: 1.7;">
                ${message.replace(/\n/g, '<br>')}
              </p>
              
              ${data ? `
              <div style="margin-top: 30px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="margin: 0 0 15px; color: #a5b4fc; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Alert Details</h3>
                <table role="presentation" width="100%">
                  ${Object.entries(data).map(([key, value]) => `
                    <tr>
                      <td style="color: #64748b; font-size: 14px; padding: 8px 0;">${key.replace(/_/g, ' ').toUpperCase()}</td>
                      <td style="color: #fff; font-size: 14px; padding: 8px 0; text-align: right;">${value}</td>
                    </tr>
                  `).join('')}
                </table>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.1);">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0; color: #64748b; font-size: 12px;">
                      This is an automated alert from TradeAI Pro.
                    </p>
                  </td>
                  <td align="right">
                    <a href="https://tradeai.pro" style="color: #a5b4fc; text-decoration: none; font-size: 12px;">
                      View in Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
