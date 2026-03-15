import { NextRequest, NextResponse } from 'next/server'
import { refreshAccessToken, isTokenValid } from '@/lib/upstox-token-manager'

export async function GET(request: NextRequest) {
  try {
    // Check if already valid
    if (await isTokenValid()) {
      return NextResponse.json({ 
        success: true, 
        message: 'Token already valid',
        tokenValid: true
      })
    }

    // Try to refresh
    const result = await refreshAccessToken()
    
    if (result.success) {
      const response = NextResponse.json({ 
        success: true, 
        message: 'Token refreshed successfully',
        tokenValid: true
      })
      
      // Update cookie
      if (result.token) {
        response.cookies.set('upstox_token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 30,
          path: '/'
        })
      }
      
      return response
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        tokenValid: false,
        needsReauth: true
      })
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      tokenValid: false,
      needsReauth: true
    })
  }
}
