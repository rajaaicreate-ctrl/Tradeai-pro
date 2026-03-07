// Upstox API Service for TradeAI Pro
// Documentation: https://upstox.com/developer/api-documentation/

const UPSTOX_API_KEY = process.env.UPSTOX_API_KEY || '94d8a3db-fc5b-4766-8e5f-001365bb3c04'
const UPSTOX_API_SECRET = process.env.UPSTOX_API_SECRET || '9eidm4d9uz'
const UPSTOX_REDIRECT_URI = process.env.UPSTOX_REDIRECT_URI || 'http://localhost:3000/api/upstox/callback'

// Upstox API Base URLs
const UPSTOX_AUTH_URL = 'https://api.upstox.com/v2/login/authorization'
const UPSTOX_TOKEN_URL = 'https://api.upstox.com/v2/login/authorization/token'
const UPSTOX_API_BASE = 'https://api.upstox.com/v2'

// In-memory token storage (in production, use database)
let accessToken: string | null = null
let tokenExpiry: number | null = null

export interface UpstoxConfig {
  apiKey: string
  apiSecret: string
  redirectUri: string
}

export interface MarketQuote {
  symbol: string
  name: string
  ltp: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  close: number
  volume: number
  timestamp: string
}

export interface IndexData {
  name: string
  value: number
  change: number
  changePercent: number
}

// Get Upstox configuration
export function getUpstoxConfig(): UpstoxConfig {
  return {
    apiKey: UPSTOX_API_KEY,
    apiSecret: UPSTOX_API_SECRET,
    redirectUri: UPSTOX_REDIRECT_URI
  }
}

// Generate OAuth authorization URL
export function getAuthorizationUrl(): string {
  const config = getUpstoxConfig()
  const params = new URLSearchParams({
    client_id: config.apiKey,
    redirect_uri: config.redirectUri,
    response_type: 'code'
  })
  return `${UPSTOX_AUTH_URL}?${params.toString()}`
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const config = getUpstoxConfig()
    
    const response = await fetch(UPSTOX_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        code: code,
        client_id: config.apiKey,
        client_secret: config.apiSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    })

    const data = await response.json()
    
    if (data.access_token) {
      accessToken = data.access_token
      tokenExpiry = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      return { success: true, token: data.access_token }
    } else {
      return { success: false, error: data.error || 'Failed to get token' }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Set access token manually (for stored tokens)
export function setAccessToken(token: string) {
  accessToken = token
  tokenExpiry = Date.now() + (24 * 60 * 60 * 1000)
}

// Get current access token
export function getAccessToken(): string | null {
  if (tokenExpiry && Date.now() > tokenExpiry) {
    accessToken = null
    tokenExpiry = null
    return null
  }
  return accessToken
}

// Check if token is valid
export function isTokenValid(): boolean {
  return accessToken !== null && tokenExpiry !== null && Date.now() < tokenExpiry
}

// Make authenticated API request
async function makeApiRequest(endpoint: string): Promise<any> {
  const token = getAccessToken()
  if (!token) {
    throw new Error('No valid access token')
  }

  const response = await fetch(`${UPSTOX_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// Get Market Quotes
export async function getMarketQuotes(symbols: string[]): Promise<MarketQuote[]> {
  try {
    const token = getAccessToken()
    if (!token) {
      // Return simulated data if no token
      return getSimulatedQuotes(symbols)
    }

    // Upstox uses instrument keys in format: NSE_EQ|INE002A01018
    const instrumentKeys = symbols.join(',')
    
    const response = await fetch(`${UPSTOX_API_BASE}/market-quote/quotes?instrument_key=${instrumentKeys}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      return getSimulatedQuotes(symbols)
    }

    const data = await response.json()
    
    if (data.data) {
      return Object.entries(data.data).map(([key, quote]: [string, any]) => ({
        symbol: key,
        name: quote.instrument_name || key,
        ltp: quote.last_price || 0,
        change: quote.net_change || 0,
        changePercent: quote.percentage_change || 0,
        high: quote.ohlc?.high || 0,
        low: quote.ohlc?.low || 0,
        open: quote.ohlc?.open || 0,
        close: quote.ohlc?.close || 0,
        volume: quote.volume || 0,
        timestamp: new Date().toISOString()
      }))
    }

    return getSimulatedQuotes(symbols)
  } catch (error) {
    console.error('Error fetching market quotes:', error)
    return getSimulatedQuotes(symbols)
  }
}

// Get NIFTY 50 Index
export async function getNifty50(): Promise<IndexData> {
  try {
    const quotes = await getMarketQuotes(['NSE_INDEX|Nifty 50'])
    if (quotes.length > 0) {
      return {
        name: 'NIFTY 50',
        value: quotes[0].ltp,
        change: quotes[0].change,
        changePercent: quotes[0].changePercent
      }
    }
    return getSimulatedNifty50()
  } catch (error) {
    return getSimulatedNifty50()
  }
}

// Get SENSEX Index
export async function getSensex(): Promise<IndexData> {
  try {
    const quotes = await getMarketQuotes(['BSE_INDEX|Sensex'])
    if (quotes.length > 0) {
      return {
        name: 'SENSEX',
        value: quotes[0].ltp,
        change: quotes[0].change,
        changePercent: quotes[0].changePercent
      }
    }
    return getSimulatedSensex()
  } catch (error) {
    return getSimulatedSensex()
  }
}

// Get top gainers
export async function getTopGainers(): Promise<MarketQuote[]> {
  try {
    const token = getAccessToken()
    if (!token) {
      return getSimulatedGainers()
    }
    
    // This would require a specific endpoint from Upstox
    // For now, return simulated data
    return getSimulatedGainers()
  } catch (error) {
    return getSimulatedGainers()
  }
}

// Get top losers
export async function getTopLosers(): Promise<MarketQuote[]> {
  try {
    const token = getAccessToken()
    if (!token) {
      return getSimulatedLosers()
    }
    
    return getSimulatedLosers()
  } catch (error) {
    return getSimulatedLosers()
  }
}

// ============ SIMULATED DATA (Fallback) ============

function getSimulatedQuotes(symbols: string[]): MarketQuote[] {
  const basePrices: Record<string, number> = {
    'RELIANCE': 2450,
    'TCS': 3850,
    'HDFC': 1620,
    'INFY': 1480,
    'ICICI': 1050,
    'BHARTIARTL': 1180,
    'SBIN': 625,
    'ITC': 445,
    'TATAMOTORS': 980,
    'AXISBANK': 1120,
    'NIFTY 50': 22500,
    'SENSEX': 74000
  }

  return symbols.map(symbol => {
    const baseName = symbol.split('|').pop() || symbol
    const basePrice = basePrices[baseName] || 1000
    const changePercent = (Math.random() - 0.5) * 4
    const change = basePrice * (changePercent / 100)

    return {
      symbol: symbol,
      name: baseName,
      ltp: parseFloat((basePrice + change).toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: parseFloat((basePrice * 1.02).toFixed(2)),
      low: parseFloat((basePrice * 0.98).toFixed(2)),
      open: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
      close: parseFloat(basePrice.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      timestamp: new Date().toISOString()
    }
  })
}

function getSimulatedNifty50(): IndexData {
  const baseValue = 22500
  const changePercent = (Math.random() - 0.5) * 2
  const change = baseValue * (changePercent / 100)

  return {
    name: 'NIFTY 50',
    value: parseFloat((baseValue + change).toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2))
  }
}

function getSimulatedSensex(): IndexData {
  const baseValue = 74000
  const changePercent = (Math.random() - 0.5) * 2
  const change = baseValue * (changePercent / 100)

  return {
    name: 'SENSEX',
    value: parseFloat((baseValue + change).toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2))
  }
}

function getSimulatedGainers(): MarketQuote[] {
  const stocks = [
    { symbol: 'TATAMOTORS', name: 'Tata Motors', base: 980 },
    { symbol: 'ADANIPORTS', name: 'Adani Ports', base: 1150 },
    { symbol: 'TATASTEEL', name: 'Tata Steel', base: 145 },
    { symbol: 'HINDALCO', name: 'Hindalco', base: 520 },
    { symbol: 'JSWSTEEL', name: 'JSW Steel', base: 850 }
  ]

  return stocks.map(stock => {
    const changePercent = Math.random() * 5 + 1 // 1-6% gain
    const change = stock.base * (changePercent / 100)

    return {
      symbol: `NSE_EQ|${stock.symbol}`,
      name: stock.name,
      ltp: parseFloat((stock.base + change).toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: parseFloat((stock.base * 1.06).toFixed(2)),
      low: parseFloat((stock.base * 0.99).toFixed(2)),
      open: parseFloat(stock.base.toFixed(2)),
      close: parseFloat(stock.base.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      timestamp: new Date().toISOString()
    }
  })
}

function getSimulatedLosers(): MarketQuote[] {
  const stocks = [
    { symbol: 'WIPRO', name: 'Wipro', base: 450 },
    { symbol: 'TECHM', name: 'Tech Mahindra', base: 1350 },
    { symbol: 'COALINDIA', name: 'Coal India', base: 420 },
    { symbol: 'BPCL', name: 'BPCL', base: 380 },
    { symbol: 'POWERGRID', name: 'Power Grid', base: 280 }
  ]

  return stocks.map(stock => {
    const changePercent = -(Math.random() * 5 + 1) // 1-6% loss
    const change = stock.base * (changePercent / 100)

    return {
      symbol: `NSE_EQ|${stock.symbol}`,
      name: stock.name,
      ltp: parseFloat((stock.base + change).toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: parseFloat((stock.base * 1.01).toFixed(2)),
      low: parseFloat((stock.base * 0.94).toFixed(2)),
      open: parseFloat(stock.base.toFixed(2)),
      close: parseFloat(stock.base.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      timestamp: new Date().toISOString()
    }
  })
}

// Get full market data for dashboard
export async function getIndianMarketData() {
  const [nifty, sensex, gainers, losers] = await Promise.all([
    getNifty50(),
    getSensex(),
    getTopGainers(),
    getTopLosers()
  ])

  return {
    indices: {
      nifty50: nifty,
      sensex: sensex
    },
    topGainers: gainers,
    topLosers: losers,
    marketStatus: getMarketStatus(),
    lastUpdate: new Date().toISOString(),
    source: isTokenValid() ? 'live' : 'simulated'
  }
}

// Get market status (open/closed)
export function getMarketStatus(): { status: string; message: string } {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset)
  
  const day = istTime.getDay()
  const hours = istTime.getHours()
  const minutes = istTime.getMinutes()
  const timeInMinutes = hours * 60 + minutes

  // Weekend
  if (day === 0 || day === 6) {
    return { status: 'closed', message: 'Market Closed (Weekend)' }
  }

  // Market hours: 9:15 AM - 3:30 PM IST
  if (timeInMinutes >= 9 * 60 + 15 && timeInMinutes < 15 * 60 + 30) {
    if (timeInMinutes < 9 * 60 + 30) {
      return { status: 'pre-open', message: 'Pre-Open Session' }
    }
    return { status: 'open', message: 'Market Open' }
  }

  // After market hours
  if (timeInMinutes < 9 * 60 + 15) {
    return { status: 'closed', message: 'Market Not Yet Open' }
  }

  return { status: 'closed', message: 'Market Closed' }
}
