import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin Users API - Real-time user management
// Requires admin authorization via secret key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Admin secret key for authorization
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'TradeAI@2024Admin#Secret'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization')
    const adminKey = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('key')
    
    if (adminKey !== ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid admin key' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const plan = searchParams.get('plan') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Calculate offset
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('users')
      .select('id, email, full_name, subscription_tier, created_at, updated_at, notification_preferences', { count: 'exact' })

    // Add search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    // Add plan filter
    if (plan && ['free', 'pro', 'enterprise'].includes(plan)) {
      query = query.eq('subscription_tier', plan)
    }

    // Add sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    query = query.range(offset, offset + limit - 1)

    const { data: users, error, count } = await query

    if (error) {
      throw error
    }

    // Get additional user stats (alerts, trades, portfolios)
    const userIds = users?.map(u => u.id) || []
    
    const [alertsResult, tradesResult, portfoliosResult] = await Promise.all([
      supabase.from('alerts').select('user_id, id').in('user_id', userIds),
      supabase.from('trades').select('user_id, id, pnl').in('user_id', userIds),
      supabase.from('portfolios').select('user_id, balance').in('user_id', userIds)
    ])

    // Build user activity map
    const alertsMap = new Map<string, number>()
    const tradesMap = new Map<string, { count: number; pnl: number }>()
    const portfoliosMap = new Map<string, number>()

    // Count alerts per user
    alertsResult.data?.forEach(a => {
      alertsMap.set(a.user_id, (alertsMap.get(a.user_id) || 0) + 1)
    })

    // Count trades and sum pnl per user
    tradesResult.data?.forEach(t => {
      const existing = tradesMap.get(t.user_id) || { count: 0, pnl: 0 }
      tradesMap.set(t.user_id, {
        count: existing.count + 1,
        pnl: existing.pnl + (Number(t.pnl) || 0)
      })
    })

    // Get portfolio balance per user
    portfoliosResult.data?.forEach(p => {
      portfoliosMap.set(p.user_id, (portfoliosMap.get(p.user_id) || 0) + (Number(p.balance) || 0))
    })

    // Format users with additional data
    const formattedUsers = users?.map(user => {
      const tradesData = tradesMap.get(user.id) || { count: 0, pnl: 0 }
      
      // Determine user status based on activity
      const lastActive = new Date(user.updated_at || user.created_at)
      const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      const status = daysSinceActive < 7 ? 'active' : daysSinceActive < 30 ? 'inactive' : 'dormant'

      return {
        id: user.id,
        email: user.email,
        name: user.full_name || 'Unknown',
        plan: user.subscription_tier || 'free',
        joined: new Date(user.created_at).toISOString().split('T')[0],
        lastActive: new Date(user.updated_at || user.created_at).toISOString().split('T')[0],
        status,
        alertsCount: alertsMap.get(user.id) || 0,
        tradesCount: tradesData.count,
        totalPnl: tradesData.pnl,
        portfolioValue: portfoliosMap.get(user.id) || 0,
        notificationPreferences: user.notification_preferences || { email: true, telegram: false, app: true }
      }
    }) || []

    // Calculate summary stats
    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasMore: page < totalPages
        },
        timestamp: new Date().toISOString(),
        source: 'live'
      }
    })

  } catch (error: any) {
    console.error('Admin users error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch users',
      data: {
        users: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasMore: false
        },
        timestamp: new Date().toISOString(),
        source: 'error'
      }
    })
  }
}

// Update user (plan change, etc.)
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization')
    const adminKey = authHeader?.replace('Bearer ', '')
    
    if (adminKey !== ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid admin key' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, updates } = body

    if (!userId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or updates' },
        { status: 400 }
      )
    }

    // Allowed update fields
    const allowedFields = ['subscription_tier', 'full_name', 'notification_preferences']
    const filteredUpdates: Record<string, any> = {}
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key]
      }
    })

    filteredUpdates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('users')
      .update(filteredUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'User updated successfully'
    })

  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update user'
    })
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization')
    const adminKey = authHeader?.replace('Bearer ', '')
    
    if (adminKey !== ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid admin key' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete user'
    })
  }
}
