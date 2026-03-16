# TradeAI Pro - Environment Setup

## Required Environment Variables

Set these in your Vercel Dashboard (Settings → Environment Variables):

### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://lqukyvrluighcivtyhmw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdWt5dnJsdWlnaGNpdnR5aG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzE4OTEsImV4cCI6MjA4ODM0Nzg5MX0.I_WokIBLvuoNo_JBPIlvVZaMnzUiyGFH0MN3_eN5eCI
```

### Optional Services

**Stripe (Payments):**
```
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Alpha Vantage (Market Data):**
```
ALPHA_VANTAGE_KEY=your-key
```

**Telegram (Alerts):**
```
TELEGRAM_BOT_TOKEN=your-bot-token
```

## Database Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  telegram_chat_id TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "telegram": false, "app": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT,
  condition TEXT,
  value DECIMAL(15, 6) NOT NULL,
  status TEXT DEFAULT 'active',
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
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  razorpay_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all" ON users FOR ALL USING (true);
CREATE POLICY "Allow all" ON alerts FOR ALL USING (true);
CREATE POLICY "Allow all" ON alert_history FOR ALL USING (true);
CREATE POLICY "Allow all" ON strategies FOR ALL USING (true);
CREATE POLICY "Allow all" ON subscriptions FOR ALL USING (true);
```
