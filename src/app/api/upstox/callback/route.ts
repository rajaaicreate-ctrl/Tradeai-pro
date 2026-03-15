import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/upstox-token-manager'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle error from Upstox
  if (error) {
    const errorDesc = searchParams.get('error_description') || error
    return NextResponse.redirect(
      new URL(`/?upstox_error=${encodeURIComponent(errorDesc)}`, request.url)
    )
  }

  // No code provided
  if (!code) {
    return NextResponse.redirect(
      new URL('/?upstox_error=no_authorization_code', request.url)
    )
  }

  try {
    // Exchange code for tokens
    const result = await exchangeCodeForToken(code)

    if (result.success && result.token) {
      const response = NextResponse.redirect(
        new URL('/?upstox_connected=true', request.url)
      )
      
      // Set tokens in cookies
      response.cookies.set('upstox_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      if (result.refreshToken) {
        response.cookies.set('upstox_refresh_token', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/'
        })
      }

      return response
    } else {
      return NextResponse.redirect(
        new URL(`/?upstox_error=${encodeURIComponent(result.error || 'token_exchange_failed')}`, request.url)
      )
    }
  } catch (err: any) {
    console.error('Upstox callback error:', err)
    return NextResponse.redirect(
      new URL(`/?upstox_error=${encodeURIComponent(err.message || 'unknown_error')}`, request.url)
    )
  }
}
