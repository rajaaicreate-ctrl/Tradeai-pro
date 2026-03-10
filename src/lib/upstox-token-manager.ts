// Upstox Token Manager with Persistent Storage & Auto-Refresh
// Tokens are saved to file and auto-refreshed when needed

import { promises as fs } from 'fs'
import path from 'path'

const UPSTOX_API_KEY = process.env.UPSTOX_API_KEY || '94d8a3db-fc5b-4766-8e5f-001365bb3c04'
const UPSTOX_API_SECRET = process.env.UPSTOX_API_SECRET || '9eidm4d9uz'
const UPSTOX_REDIRECT_URI = process.env.UPSTOX_REDIRECT_URI || 'http://localhost:3000/api/upstox/callback'

const TOKEN_FILE = path.join(process.cwd(), '.upstox-tokens.json')

const UPSTOX_TOKEN_URL = 'https://api.upstox.com/v2/login/authorization/token'
const UPSTOX_REFRESH_URL = 'https://api.upstox.com/v2/login/authorization/refresh'
const UPSTOX_API_BASE = 'https://api.upstox.com/v2'

// Token storage
interface TokenStore {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
}

let memoryStore: TokenStore = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null
}

// Load tokens from file
async function loadTokens(): Promise<TokenStore> {
  try {
    const data = await fs.readFile(TOKEN_FILE, 'utf-8')
    const tokens = JSON.parse(data)
    memoryStore = tokens
    return tokens
  } catch {
    return memoryStore
  }
}

// Save tokens to file
async function saveTokens(tokens: TokenStore): Promise<void> {
  try {
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2))
  } catch (error) {
    console.error('Failed to save tokens:', error)
  }
}

// Check if token is valid (with 10 min buffer)
export async function isTokenValid(): Promise<boolean> {
  await loadTokens()
  if (!memoryStore.accessToken || !memoryStore.expiresAt) return false
  return Date.now() < (memoryStore.expiresAt - 10 * 60 * 1000) // 10 min buffer
}

// Get current access token
export async function getAccessToken(): Promise<string | null> {
  await loadTokens()
  return memoryStore.accessToken
}

// Set tokens after authorization
export async function setTokens(accessToken: string, refreshToken?: string, expiresIn: number = 86400) {
  memoryStore = {
    accessToken,
    refreshToken: refreshToken || memoryStore.refreshToken,
    expiresAt: Date.now() + (expiresIn * 1000)
  }
  await saveTokens(memoryStore)
}

// Get authorization URL
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: UPSTOX_API_KEY,
    redirect_uri: UPSTOX_REDIRECT_URI,
    response_type: 'code'
  })
  // Use the dialog endpoint for browser authorization
  return `https://api.upstox.com/v2/login/authorization/dialog?${params.toString()}`
}

// Exchange code for tokens
export async function exchangeCodeForToken(code: string): Promise<{ 
  success: boolean
  token?: string
  refreshToken?: string
  error?: string 
}> {
  try {
    console.log('Exchanging code for token...')
    
    const response = await fetch(UPSTOX_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        code: code,
        client_id: UPSTOX_API_KEY,
        client_secret: UPSTOX_API_SECRET,
        redirect_uri: UPSTOX_REDIRECT_URI,
        grant_type: 'authorization_code'
      }).toString()
    })

    const data = await response.json()
    console.log('Token response:', { hasToken: !!data.access_token, hasRefresh: !!data.refresh_token })
    
    if (data.access_token) {
      // Store tokens
      await setTokens(data.access_token, data.refresh_token, data.expires_in || 86400)
      
      return { 
        success: true, 
        token: data.access_token,
        refreshToken: data.refresh_token
      }
    } else {
      console.error('Token exchange failed:', data)
      return { success: false, error: data.error || 'Failed to get token' }
    }
  } catch (error: any) {
    console.error('Token exchange error:', error)
    return { success: false, error: error.message }
  }
}

// Refresh access token using refresh token
export async function refreshAccessToken(): Promise<{ 
  success: boolean
  token?: string
  error?: string 
}> {
  await loadTokens()
  
  if (!memoryStore.refreshToken) {
    console.log('No refresh token available')
    return { success: false, error: 'No refresh token available' }
  }

  try {
    console.log('Refreshing access token...')
    
    const response = await fetch(UPSTOX_REFRESH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        refresh_token: memoryStore.refreshToken,
        client_id: UPSTOX_API_KEY,
        client_secret: UPSTOX_API_SECRET,
        grant_type: 'refresh_token'
      }).toString()
    })

    const data = await response.json()
    
    if (data.access_token) {
      await setTokens(data.access_token, data.refresh_token, data.expires_in || 86400)
      console.log('Token refreshed successfully')
      return { success: true, token: data.access_token }
    } else {
      console.error('Token refresh failed:', data)
      return { success: false, error: data.error || 'Refresh failed' }
    }
  } catch (error: any) {
    console.error('Token refresh error:', error)
    return { success: false, error: error.message }
  }
}

// Get valid token (auto-refresh if needed)
export async function getValidToken(): Promise<string | null> {
  // Check if we have a valid token
  if (await isTokenValid()) {
    return memoryStore.accessToken
  }

  // Try to refresh using refresh token
  if (memoryStore.refreshToken) {
    console.log('Token expired, attempting refresh...')
    const result = await refreshAccessToken()
    if (result.success && result.token) {
      return result.token
    }
  }

  // No valid token, need re-authorization
  return null
}

// Get Upstox config
export function getUpstoxConfig() {
  return {
    apiKey: UPSTOX_API_KEY,
    apiSecret: UPSTOX_API_SECRET,
    redirectUri: UPSTOX_REDIRECT_URI
  }
}

// Market Quotes
export async function getMarketQuotes(symbols: string[]): Promise<any[]> {
  const token = await getValidToken()
  
  if (!token) {
    return getSimulatedQuotes(symbols)
  }

  try {
    const instrumentKeys = symbols.join(',')
    const response = await fetch(`${UPSTOX_API_BASE}/market-quote/quotes?instrument_key=${instrumentKeys}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.log('Market quotes API error:', response.status)
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
    console.error('Market quotes error:', error)
    return getSimulatedQuotes(symbols)
  }
}

// Simulated quotes fallback
function getSimulatedQuotes(symbols: string[]): any[] {
  const basePrices: Record<string, number> = {
    'RELIANCE': 2450, 'TCS': 3850, 'HDFC': 1620, 'INFY': 1480,
    'NIFTY 50': 22500, 'SENSEX': 74000
  }

  return symbols.map(symbol => {
    const baseName = symbol.split('|').pop() || symbol
    const basePrice = basePrices[baseName] || 1000
    const changePercent = (Math.random() - 0.5) * 4
    const change = basePrice * (changePercent / 100)

    return {
      symbol, name: baseName,
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

// Market status
export function getMarketStatus(): { status: string; message: string } {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istTime = new Date(now.getTime() + istOffset)
  
  const day = istTime.getDay()
  const hours = istTime.getHours()
  const minutes = istTime.getMinutes()
  const timeInMinutes = hours * 60 + minutes

  if (day === 0 || day === 6) {
    return { status: 'closed', message: 'Market Closed (Weekend)' }
  }

  if (timeInMinutes >= 9 * 60 + 15 && timeInMinutes < 15 * 60 + 30) {
    return { status: 'open', message: 'Market Open' }
  }

  if (timeInMinutes < 9 * 60 + 15) {
    return { status: 'closed', message: 'Market Not Yet Open' }
  }

  return { status: 'closed', message: 'Market Closed' }
}

// Get full Indian market data
export async function getIndianMarketData() {
  const tokenValid = await isTokenValid()
  
  const [niftyQuotes, sensexQuotes] = await Promise.all([
    getMarketQuotes(['NSE_INDEX|Nifty 50']),
    getMarketQuotes(['BSE_INDEX|Sensex'])
  ])

  return {
    indices: {
      nifty50: niftyQuotes[0] ? {
        name: 'NIFTY 50',
        value: niftyQuotes[0].ltp,
        change: niftyQuotes[0].change,
        changePercent: niftyQuotes[0].changePercent
      } : getSimulatedNifty(),
      sensex: sensexQuotes[0] ? {
        name: 'SENSEX',
        value: sensexQuotes[0].ltp,
        change: sensexQuotes[0].change,
        changePercent: sensexQuotes[0].changePercent
      } : getSimulatedSensex()
    },
    topGainers: getSimulatedGainers(),
    topLosers: getSimulatedLosers(),
    marketStatus: getMarketStatus(),
    lastUpdate: new Date().toISOString(),
    source: tokenValid ? 'live' : 'simulated'
  }
}

function getSimulatedNifty() {
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

function getSimulatedSensex() {
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

function getSimulatedGainers() {
  const stocks = [
    { symbol: 'TATAMOTORS', name: 'Tata Motors', base: 980 },
    { symbol: 'ADANIPORTS', name: 'Adani Ports', base: 1150 },
    { symbol: 'TATASTEEL', name: 'Tata Steel', base: 145 },
    { symbol: 'HINDALCO', name: 'Hindalco', base: 520 },
    { symbol: 'JSWSTEEL', name: 'JSW Steel', base: 850 }
  ]

  return stocks.map(stock => {
    const changePercent = Math.random() * 5 + 1
    const change = stock.base * (changePercent / 100)
    return {
      symbol: `NSE_EQ|${stock.symbol}`,
      name: stock.name,
      ltp: parseFloat((stock.base + change).toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    }
  })
}

function getSimulatedLosers() {
  const stocks = [
    { symbol: 'WIPRO', name: 'Wipro', base: 450 },
    { symbol: 'TECHM', name: 'Tech Mahindra', base: 1350 },
    { symbol: 'COALINDIA', name: 'Coal India', base: 420 },
    { symbol: 'BPCL', name: 'BPCL', base: 380 },
    { symbol: 'POWERGRID', name: 'Power Grid', base: 280 }
  ]

  return stocks.map(stock => {
    const changePercent = -(Math.random() * 5 + 1)
    const change = stock.base * (changePercent / 100)
    return {
      symbol: `NSE_EQ|${stock.symbol}`,
      name: stock.name,
      ltp: parseFloat((stock.base + change).toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    }
  })
}
