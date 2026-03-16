import { NextRequest, NextResponse } from 'next/server'

// Upstox Access Token - Valid until token expiry
const UPSTOX_ACCESS_TOKEN = process.env.UPSTOX_ACCESS_TOKEN || 'eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI1QUM4RjkiLCJqdGkiOiI2OWFiYzg0ODMzOWUxNzViNmQ3OGJhMTIiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzcyODY1NjA4LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NzI5MjA4MDB9.Hr0cNw0skqNfKT1p9Ult1DG1iXROHH2D8QYYfilRw20'

const UPSTOX_API_BASE = 'https://api.upstox.com/v2'

// Popular Indian stock instrument keys for Upstox
const POPULAR_STOCKS = [
  'NSE_EQ|INE002A01018',  // RELIANCE
  'NSE_EQ|INE467B01029',  // TCS
  'NSE_EQ|INE040A01034',  // HDFC Bank
  'NSE_EQ|INE009A01021',  // INFOSYS
  'NSE_EQ|INE090A01021',  // ICICI Bank
  'NSE_EQ|INE154A01025',  // BHARTI AIRTEL
  'NSE_EQ|INE062A01020',  // SBI
  'NSE_EQ|INE108A01022',  // ITC
  'NSE_EQ|INE155A01022',  // TATA MOTORS
  'NSE_EQ|INE238A01034',  // AXIS Bank
]

// Stock symbol mapping
const STOCK_NAMES: Record<string, string> = {
  'INE002A01018': 'RELIANCE',
  'INE467B01029': 'TCS',
  'INE040A01034': 'HDFCBANK',
  'INE009A01021': 'INFY',
  'INE090A01021': 'ICICIBANK',
  'INE154A01025': 'BHARTIARTL',
  'INE062A01020': 'SBIN',
  'INE108A01022': 'ITC',
  'INE155A01022': 'TATAMOTORS',
  'INE238A01034': 'AXISBANK',
}

// Full stock names
const FULL_NAMES: Record<string, string> = {
  'RELIANCE': 'Reliance Industries Ltd',
  'TCS': 'Tata Consultancy Services',
  'HDFCBANK': 'HDFC Bank Ltd',
  'INFY': 'Infosys Ltd',
  'ICICIBANK': 'ICICI Bank Ltd',
  'BHARTIARTL': 'Bharti Airtel Ltd',
  'SBIN': 'State Bank of India',
  'ITC': 'ITC Ltd',
  'TATAMOTORS': 'Tata Motors Ltd',
  'AXISBANK': 'Axis Bank Ltd',
}

interface StockQuote {
  symbol: string
  name: string
  fullName: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  close: number
  volume: number
  timestamp: string
  trend: 'bullish' | 'bearish' | 'neutral'
}

// Fetch quotes from Upstox
async function fetchUpstoxQuotes(instrumentKeys: string[]): Promise<Record<string, any>> {
  try {
    const response = await fetch(`${UPSTOX_API_BASE}/market-quote/quotes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        instrument_keys: instrumentKeys
      })
    })

    if (!response.ok) {
      console.error('Upstox API error:', response.status)
      return {}
    }

    const data = await response.json()
    return data.data || {}
  } catch (error) {
    console.error('Error fetching Upstox quotes:', error)
    return {}
  }
}

// Fetch index data
async function fetchIndexData(indexKey: string): Promise<any> {
  try {
    const response = await fetch(`${UPSTOX_API_BASE}/market-quote/quotes?instrument_key=${indexKey}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data || null
  } catch (error) {
    console.error('Error fetching index:', error)
    return null
  }
}

// Get market status
function getMarketStatus(): { status: string; message: string; isOpen: boolean } {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset)
  
  const day = istTime.getDay()
  const hours = istTime.getHours()
  const minutes = istTime.getMinutes()
  const timeInMinutes = hours * 60 + minutes

  // Weekend
  if (day === 0 || day === 6) {
    return { status: 'closed', message: 'Market Closed (Weekend)', isOpen: false }
  }

  // Market hours: 9:15 AM - 3:30 PM IST
  if (timeInMinutes >= 9 * 60 + 15 && timeInMinutes < 15 * 60 + 30) {
    if (timeInMinutes < 9 * 60 + 30) {
      return { status: 'pre-open', message: 'Pre-Open Session', isOpen: true }
    }
    return { status: 'open', message: '🟢 Market Open', isOpen: true }
  }

  // After market hours
  if (timeInMinutes < 9 * 60 + 15) {
    return { status: 'closed', message: 'Market Not Yet Open', isOpen: false }
  }

  return { status: 'closed', message: '🔴 Market Closed', isOpen: false }
}

// Process stock data
function processStockData(quotesData: Record<string, any>): StockQuote[] {
  return Object.entries(quotesData).map(([key, quote]: [string, any]) => {
    const isin = key.split('|')[1] || key
    const symbol = STOCK_NAMES[isin] || isin
    const changePercent = quote.ohlc?.close 
      ? ((quote.last_price - quote.ohlc.close) / quote.ohlc.close * 100)
      : 0
    
    return {
      symbol,
      name: quote.instrument_name || symbol,
      fullName: FULL_NAMES[symbol] || quote.instrument_name || symbol,
      price: quote.last_price || 0,
      change: quote.net_change || 0,
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: quote.ohlc?.high || quote.last_price || 0,
      low: quote.ohlc?.low || quote.last_price || 0,
      open: quote.ohlc?.open || quote.last_price || 0,
      close: quote.ohlc?.close || quote.last_price || 0,
      volume: quote.volume || 0,
      timestamp: quote.timestamp || new Date().toISOString(),
      trend: changePercent > 0.5 ? 'bullish' : changePercent < -0.5 ? 'bearish' : 'neutral'
    }
  })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'all'
  
  const marketStatus = getMarketStatus()

  try {
    if (type === 'quotes') {
      const quotesData = await fetchUpstoxQuotes(POPULAR_STOCKS)
      const stocks = processStockData(quotesData)

      return NextResponse.json({
        success: true,
        data: stocks,
        marketStatus,
        source: 'upstox',
        lastUpdate: new Date().toISOString()
      })
    }

    if (type === 'indices') {
      const [niftyData, sensexData] = await Promise.all([
        fetchIndexData('NSE_INDEX|Nifty 50'),
        fetchIndexData('BSE_INDEX|Sensex')
      ])

      return NextResponse.json({
        success: true,
        indices: {
          nifty50: niftyData ? {
            name: 'NIFTY 50',
            value: niftyData.last_price || 22450,
            change: niftyData.net_change || 0,
            changePercent: niftyData.ohlc?.close 
              ? parseFloat(((niftyData.last_price - niftyData.ohlc.close) / niftyData.ohlc.close * 100).toFixed(2))
              : 0
          } : null,
          sensex: sensexData ? {
            name: 'SENSEX',
            value: sensexData.last_price || 73800,
            change: sensexData.net_change || 0,
            changePercent: sensexData.ohlc?.close 
              ? parseFloat(((sensexData.last_price - sensexData.ohlc.close) / sensexData.ohlc.close * 100).toFixed(2))
              : 0
          } : null
        },
        marketStatus,
        source: 'upstox'
      })
    }

    // Fetch all data
    const [quotesData, niftyData, sensexData] = await Promise.all([
      fetchUpstoxQuotes(POPULAR_STOCKS),
      fetchIndexData('NSE_INDEX|Nifty 50'),
      fetchIndexData('BSE_INDEX|Sensex')
    ])

    const stocks = processStockData(quotesData)
    
    // Sort by volume for top traded
    const topTraded = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5)
    
    // Sort by change for gainers/losers
    const gainers = [...stocks].filter(s => s.change > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
    const losers = [...stocks].filter(s => s.change < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        indices: {
          nifty50: niftyData ? {
            name: 'NIFTY 50',
            value: niftyData.last_price || 22450,
            change: niftyData.net_change || 0,
            changePercent: niftyData.ohlc?.close 
              ? parseFloat(((niftyData.last_price - niftyData.ohlc.close) / niftyData.ohlc.close * 100).toFixed(2))
              : 0
          } : null,
          sensex: sensexData ? {
            name: 'SENSEX',
            value: sensexData.last_price || 73800,
            change: sensexData.net_change || 0,
            changePercent: sensexData.ohlc?.close 
              ? parseFloat(((sensexData.last_price - sensexData.ohlc.close) / sensexData.ohlc.close * 100).toFixed(2))
              : 0
          } : null
        },
        stocks,
        topTraded,
        gainers,
        losers,
        marketStatus
      },
      source: 'upstox',
      lastUpdate: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Upstox API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      marketStatus
    }, { status: 500 })
  }
}
