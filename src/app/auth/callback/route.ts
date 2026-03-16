import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqukyvrluighcivtyhmw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdWt5dnJsdWlnaGNpdnR5aG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzE4OTEsImV4cCI6MjA4ODM0Nzg5MX0.I_WokIBLvuoNo_JBPIlvVZaMnzUiyGFH0MN3_eN5eCI'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('[Auth Callback] Received:', { code: !!code, token_hash: !!token_hash, type, error })

  // Handle error from Supabase
  if (error) {
    console.error('[Auth Callback] Error:', error, error_description)
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error_description || error)}`)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })

  try {
    // Method 1: Exchange code for session (PKCE flow)
    if (code) {
      console.log('[Auth Callback] Exchanging code for session...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('[Auth Callback] Code exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(exchangeError.message)}`)
      }

      if (data.session) {
        console.log('[Auth Callback] Session created for:', data.session.user.email)
        
        // Create user profile if needed
        await createUserProfile(data.session.user)
        
        // Redirect to dashboard with success message
        return NextResponse.redirect(`${origin}/?email_confirmed=true`)
      }
    }

    // Method 2: Verify token hash (magic link / email verification)
    if (token_hash && type) {
      console.log('[Auth Callback] Verifying token hash for type:', type)
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      })

      if (verifyError) {
        console.error('[Auth Callback] Token verification error:', verifyError)
        return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(verifyError.message)}`)
      }

      if (data.session) {
        console.log('[Auth Callback] Session created via OTP for:', data.session.user.email)
        
        // Create user profile if needed
        await createUserProfile(data.session.user)
        
        return NextResponse.redirect(`${origin}/?email_confirmed=true`)
      }
    }

    // If we get here, something went wrong
    console.error('[Auth Callback] No valid session created')
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent('Failed to verify email. Please try again.')}`)

  } catch (err: any) {
    console.error('[Auth Callback] Exception:', err)
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(err.message || 'An unexpected error occurred')}`)
  }
}

// Helper to create user profile
async function createUserProfile(user: any) {
  try {
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdWt5dnJsdWlnaGNpdnR5aG13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc3MTg5MSwiZXhwIjoyMDg4MzQ3ODkxfQ.TyjMt9IiDESZqg0_s0-l27UBMiDrkmV8mSSAkG_f4Ps'
    
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check if user already exists
    const { data: existingUser } = await serviceClient
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      // Create new user profile
      await serviceClient
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          subscription_tier: 'free',
          notification_preferences: { email: true, telegram: false, app: true },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      console.log('[Auth Callback] Created profile for:', user.email)
    }
  } catch (err) {
    console.error('[Auth Callback] Profile creation error:', err)
    // Don't fail the auth flow if profile creation fails
  }
}
