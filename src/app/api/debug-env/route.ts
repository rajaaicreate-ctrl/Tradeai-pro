import { NextResponse } from 'next/server'

// Debug endpoint to check environment variables
export async function GET() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  return NextResponse.json({
    hasToken: !!botToken,
    tokenLength: botToken?.length || 0,
    tokenPreview: botToken ? `${botToken.substring(0, 10)}...` : null,
    allEnvKeys: Object.keys(process.env).filter(k =>
      k.includes('TELEGRAM') ||
      k.includes('SUPABASE') ||
      k.includes('STRIPE')
    ).sort()
  })
}
