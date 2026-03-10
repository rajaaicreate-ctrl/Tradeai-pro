// Supabase Client Configuration for TradeAI Pro
// Supports: Authentication, Database, Real-time subscriptions

import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallback to hardcoded values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqukyvrluighcivtyhmw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdWt5dnJsdWlnaGNpdnR5aG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzE4OTEsImV4cCI6MjA4ODM0Nzg5MX0.I_WokIBLvuoNo_JBPIlvVZaMnzUiyGFH0MN3_eN5eCI'

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey &&
  supabaseUrl.length > 10 &&
  supabaseAnonKey.length > 20
)

// Create the Supabase client only if configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null

// Database Types
export interface DatabaseUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  telegram_chat_id?: string
  notification_preferences: {
    email: boolean
    telegram: boolean
    app: boolean
  }
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  balance: number
  currency: string
  created_at: string
}

export interface Trade {
  id: string
  user_id: string
  portfolio_id: string
  symbol: string
  type: 'long' | 'short'
  entry_price: number
  exit_price?: number
  quantity: number
  status: 'open' | 'closed'
  pnl?: number
  notes?: string
  created_at: string
  closed_at?: string
}

export interface Alert {
  id: string
  user_id: string
  symbol: string
  type: 'price' | 'rsi' | 'breakout' | 'volume' | 'support' | 'resistance'
  condition: 'above' | 'below' | 'crosses_up' | 'crosses_down' | 'enters_zone'
  value: number
  status: 'active' | 'triggered' | 'disabled'
  notification_methods: ('email' | 'telegram' | 'app')[]
  message?: string
  created_at: string
  triggered_at?: string
  last_checked?: string
}

export interface AlertHistory {
  id: string
  alert_id: string
  user_id: string
  symbol: string
  type: string
  condition: string
  trigger_value: number
  target_value: number
  message: string
  notification_sent: boolean
  created_at: string
}

export interface Strategy {
  id: string
  user_id: string
  name: string
  description?: string
  parameters: Record<string, any>
  is_active: boolean
  backtest_results?: Record<string, any>
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired'
  current_period_start: string
  current_period_end: string
  stripe_subscription_id?: string
  razorpay_subscription_id?: string
}

// SQL Schema for Supabase
export const databaseSchema = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  telegram_chat_id TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "telegram": false, "app": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios Table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades Table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT CHECK (type IN ('long', 'short')),
  entry_price DECIMAL(15, 6) NOT NULL,
  exit_price DECIMAL(15, 6),
  quantity DECIMAL(15, 6) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  pnl DECIMAL(15, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT CHECK (type IN ('price', 'rsi', 'breakout', 'volume', 'support', 'resistance')),
  condition TEXT CHECK (condition IN ('above', 'below', 'crosses_up', 'crosses_down', 'enters_zone')),
  value DECIMAL(15, 6) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'disabled')),
  notification_methods TEXT[] DEFAULT ARRAY['app'],
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  triggered_at TIMESTAMP WITH TIME ZONE,
  last_checked TIMESTAMP WITH TIME ZONE
);

-- Alert History Table
CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  condition TEXT NOT NULL,
  trigger_value DECIMAL(15, 6) NOT NULL,
  target_value DECIMAL(15, 6) NOT NULL,
  message TEXT NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategies Table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parameters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  backtest_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  razorpay_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Alerts Policies
CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own alerts" ON alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON alerts FOR DELETE USING (auth.uid() = user_id);

-- Alert History Policies
CREATE POLICY "Users can view own alert history" ON alert_history FOR SELECT USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_alert_history_user_id ON alert_history(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_created_at ON alert_history(created_at DESC);
`

// Helper functions
export async function getCurrentUser(): Promise<DatabaseUser | null> {
  if (!supabase) return null
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data as DatabaseUser
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function upsertUser(authUser: { id: string; email: string; full_name?: string }): Promise<DatabaseUser | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.full_name,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error
    return data as DatabaseUser
  } catch (error) {
    console.error('Error upserting user:', error)
    return null
  }
}

export async function updateUserNotificationPreferences(
  userId: string,
  preferences: { email?: boolean; telegram?: boolean; app?: boolean }
): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('users')
      .update({
        notification_preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return false
  }
}

export async function updateUserTelegramChatId(userId: string, chatId: string): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('users')
      .update({
        telegram_chat_id: chatId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating Telegram chat ID:', error)
    return false
  }
}

// Real-time subscription for alerts
export function subscribeToAlerts(userId: string, callback: (alert: Alert) => void) {
  if (!supabase) return { unsubscribe: () => {} }
  return supabase
    .channel('alerts-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'alerts',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as Alert)
      }
    )
    .subscribe()
}

// Real-time subscription for alert history
export function subscribeToAlertHistory(userId: string, callback: (history: AlertHistory) => void) {
  if (!supabase) return { unsubscribe: () => {} }
  return supabase
    .channel('alert-history-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'alert_history',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as AlertHistory)
      }
    )
    .subscribe()
}
