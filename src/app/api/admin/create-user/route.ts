import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqukyvrluighcivtyhmw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdWt5dnJsdWlnaGNpdnR5aG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzE4OTEsImV4cCI6MjA4ODM0Nzg5MX0.I_WokIBLvuoNo_JBPIlvVZaMnzUiyGFH0MN3_eN5eCI'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || 'Admin User',
          is_admin: true
        },
        emailRedirectTo: 'https://tradeai-live.vercel.app'
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Admin user created! Please check email for confirmation or try logging in.'
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
