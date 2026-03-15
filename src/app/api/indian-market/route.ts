import { NextResponse, NextRequest } from 'next/server'

// Upstox API Configuration
const UPSTOX_ACCESS_TOKEN = process.env.UPSTOX_ACCESS_TOKEN || ''

// Indian stocks with instrument keys for Upstox
const NSE_STOCKS: Record<string, { instrumentKey: string; name: string; sector: string }> = {
  'RELIANCE': { instrumentKey: 'NSE_EQ|INE002A01018', name: 'Reliance Industries', sector: 'Energy' },
  'TCS': { instrumentKey: 'NSE_EQ|INE467B01029', name: 'Tata Consultancy Services', sector: 'IT' },
  'INFY': { instrumentKey: 'NSE_EQ|INE009A01021', name: 'Infosys', sector: 'IT' },
  'HDFCBANK': { instrumentKey: 'NSE_EQ|INE040A01026', name: 'HDFC Bank', sector: 'Banking' },
  'ICICIBANK': { instrumentKey: 'NSE_EQ|INE090A01013', name: 'ICICI Bank', sector: 'Banking' },
  'SBIN': { instrumentKey: 'NSE_EQ|INE062A01020', name: 'State Bank of India', sector: 'Banking' },
  'BHARTIARTL': { instrumentKey: 'NSE_EQ|INE397D01024', name: 'Bharti Airtel', sector: 'Telecom' },
  'ITC': { instrumentKey: 'NSE_EQ|INE154A01025', name: 'ITC Limited', sector: 'FMCG' },
  'KOTAKBANK': { instrumentKey: 'NSE_EQ|INE237A01028', name: 'Kotak Mahindra Bank', sector: 'Banking' },
  'LT': { instrumentKey: 'NSE_EQ|INE018A01030', name: 'Larsen & Toubro', sector: 'Infrastructure' },
  'AXISBANK': { instrumentKey: 'NSE_EQ|INE238A01034', name: 'Axis Bank', sector: 'Banking' },
  'BAJFINANCE': { instrumentKey: 'NSE_EQ|INE296A01024', name: 'Bajaj Finance', sector: 'Finance' },
  'MARUTI': { instrumentKey: 'NSE_EQ|INE585B01010', name: 'Maruti Suzuki', sector: 'Auto' },
  'ASIANPAINT': { instrumentKey: 'NSE_EQ|INE021A01026', name: 'Asian Paints', sector: 'FMCG' },
  'SUNPHARMA': { instrumentKey: 'NSE_EQ|INE044A01028', name: 'Sun Pharma', sector: 'Pharma' },
  'TATASTEEL': { instrumentKey: 'NSE_EQ|INE081A01012', name: 'Tata Steel', sector: 'Metals' },
  'HINDALCO': { instrumentKey: 'NSE_EQ|INE038A01020', name: 'Hindalco', sector: 'Metals' },
  'NTPC': { instrumentKey: 'NSE_EQ|INE733A01031', name: 'NTPC', sector: 'Power' },
  'TATAMOTORS': { instrumentKey: 'NSE_EQ|INE715A01026', name: 'Tata Motors', sector: 'Auto' },
  'WIPRO': { instrumentKey: 'NSE_EQ|INE075A01022', name: 'Wipro', sector: 'IT' },
  'HINDUNILVR': { instrumentKey: 'NSE_EQ|INE030A01027', name: 'Hindustan Unilever', sector: 'FMCG' },
  'POWERGRID': { instrumentKey: 'NSE_EQ|INE752E01010', name: 'Power Grid Corp', sector: 'Power' },
  'ADANIENT': { instrumentKey: 'NSE_EQ|INE423A01024', name: 'Adani Enterprises', sector: 'Conglomerate' },
  'DMART': { instrumentKey: 'NSE_EQ|INE192R01022', name: 'Avenue Supermarts', sector: 'Retail' },
}

// Index instrument keys
const INDICES = {
  'NIFTY 50': 'NSE_INDEX|Nifty 50',
  'NIFTY BANK': 'NSE_INDEX|Nifty Bank',
  'NIFTY IT': 'NSE_INDEX|Nifty IT',
  'SENSEX': 'BSE_INDEX|SENSEX',
}

interface MarketQuote {
  symbol: string
  name: string
  sector: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  isLive: boolean
}

// Fetch quotes from Upstox Market Quote API
async function fetchUpstoxQuotes(instrumentKeys: string[], token: string): Promise<Map<string, any>> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const url = `https://api.upstox.com/v2/market-quote/quotes?instrument_key=${instrumentKeys.join(',')}`
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error('Upstox API error:', response.status, response.statusText)
      return new Map()
    }

    const data = await response.json()
    
    if (data.status === 'error') {
      console.error('Upstox API returned error:', data)
      return new Map()
    }

    // Convert to map
    const quoteMap = new Map()
    if (data.data) {
      for (const [key, value] of Object.entries(data.data)) {
        quoteMap.set(key, value)
      }
    }
    
    return quoteMap
  } catch (error) {
    console.error('Upstox fetch error:', error)
    return new Map()
  }
}

// Fetch index data
async function fetchIndexData(token: string) {
  const indexKeys = Object.values(INDICES)
  const quotes = await fetchUpstoxQuotes(indexKeys, token)
  
  const indices: Record<string, any> = {}
  
  for (const [name, key] of Object.entries(INDICES)) {
    const quote = quotes.get(key)
    if (quote) {
      indices[name.toLowerCase().replace(' ', '')] = {
        name,
        value: quote.last_price || 0,
        change: quote.net_change || 0,
        changePercent: quote.percentage_change || 0,
        open: quote.ohlc?.open || 0,
        high: quote.ohlc?.high || 0,
        low: quote.ohlc?.low || 0,
      }
    }
  }
  
  return indices
}

// Generate simulated data as fallback
function generateSimulatedStock(symbol: string): MarketQuote {
  const stock = NSE_STOCKS[symbol]
  if (!stock) {
    return {
      symbol,
      name: symbol,
      sector: 'Unknown',
      price: 1000 + Math.random() * 500,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 3,
      open: 1000,
      high: 1020,
      low: 980,
      volume: Math.floor(Math.random() * 1000000),
      isLive: false
    }
  }

  // Base prices (approximate)
  const basePrices: Record<string, number> = {
    'RELIANCE': 1280, 'TCS': 3580, 'INFY': 1380, 'HDFCBANK': 1620,
    'ICICIBANK': 1080, 'SBIN': 625, 'BHARTIARTL': 1580, 'ITC': 435,
    'KOTAKBANK': 1720, 'LT': 3250, 'AXISBANK': 1020, 'BAJFINANCE': 6250,
    'MARUTI': 11250, 'ASIANPAINT': 2250, 'SUNPHARMA': 1680, 'TATASTEEL': 138,
    'HINDALCO': 485, 'NTPC': 340, 'TATAMOTORS': 680, 'WIPRO': 445,
    'HINDUNILVR': 2380, 'POWERGRID': 265, 'ADANIENT': 2180, 'DMART': 3650
  }

  const basePrice = basePrices[symbol] || 1000
  const changePercent = (Math.random() - 0.48) * 4
  const change = basePrice * (changePercent / 100)
  const price = basePrice + change

  return {
    symbol,
    name: stock.name,
    sector: stock.sector,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    open: parseFloat((basePrice - (Math.random() - 0.5) * basePrice * 0.01).toFixed(2)),
    high: parseFloat((price + Math.random() * price * 0.01).toFixed(2)),
    low: parseFloat((price - Math.random() * price * 0.01).toFixed(2)),
    volume: Math.floor(Math.random() * 5000000 + 500000),
    isLive: false
  }
}

// Generate simulated index data
function generateSimulatedIndexData() {
  const niftyBase = 22450
  const niftyChange = (Math.random() - 0.48) * 350
  
  const sensexBase = 74000
  const sensexChange = (Math.random() - 0.48) * 1000

  const bankNiftyBase = 48500
  const bankNiftyChange = (Math.random() - 0.48) * 700

  return {
    nifty50: {
      name: 'NIFTY 50',
      value: parseFloat((niftyBase + niftyChange).toFixed(2)),
      change: parseFloat(niftyChange.toFixed(2)),
      changePercent: parseFloat(((niftyChange / niftyBase) * 100).toFixed(2)),
    },
    sensex: {
      name: 'SENSEX',
      value: parseFloat((sensexBase + sensexChange).toFixed(2)),
      change: parseFloat(sensexChange.toFixed(2)),
      changePercent: parseFloat(((sensexChange / sensexBase) * 100).toFixed(2)),
    },
    banknifty: {
      name: 'BANK NIFTY',
      value: parseFloat((bankNiftyBase + bankNiftyChange).toFixed(2)),
      change: parseFloat(bankNiftyChange.toFixed(2)),
      changePercent: parseFloat(((bankNiftyChange / bankNiftyBase) * 100).toFixed(2)),
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const symbol = searchParams.get('symbol')

  // Get token from cookie or header
  const tokenFromCookie = request.cookies.get('upstox_token')?.value
  const tokenFromHeader = request.headers.get('X-Upstox-Token')
  const upstoxToken = tokenFromCookie || tokenFromHeader || UPSTOX_ACCESS_TOKEN

  try {
    // If we have Upstox token, try to fetch live data
    if (upstoxToken) {
      console.log('[Indian Market] Using Upstox token for live data')
      
      if (type === 'index') {
        const indexData = await fetchIndexData(upstoxToken)
        return NextResponse.json({
          success: true,
          data: Object.keys(indexData).length > 0 ? indexData : generateSimulatedIndexData(),
          source: Object.keys(indexData).length > 0 ? 'upstox' : 'simulated',
          timestamp: new Date().toISOString()
        })
      }

      // Fetch stock quotes
      const stockSymbols = Object.keys(NSE_STOCKS)
      const instrumentKeys = stockSymbols.map(s => NSE_STOCKS[s].instrumentKey)
      
      const quotes = await fetchUpstoxQuotes(instrumentKeys, upstoxToken)
      const liveCount = quotes.size
      
      const stocks: MarketQuote[] = stockSymbols.map(symbol => {
        const stock = NSE_STOCKS[symbol]
        const quote = quotes.get(stock.instrumentKey)
        
        if (quote && quote.last_price) {
          return {
            symbol,
            name: stock.name,
            sector: stock.sector,
            price: quote.last_price,
            change: quote.net_change || 0,
            changePercent: quote.percentage_change || 0,
            open: quote.ohlc?.open || quote.last_price,
            high: quote.ohlc?.high || quote.last_price,
            low: quote.ohlc?.low || quote.last_price,
            volume: quote.volume || 0,
            isLive: true
          }
        }
        
        return generateSimulatedStock(symbol)
      })

      const indices = await fetchIndexData(upstoxToken)
      
      return NextResponse.json({
        success: true,
        data: {
          indices: Object.keys(indices).length > 0 ? indices : generateSimulatedIndexData(),
          stocks,
          topGainers: [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5),
          topLosers: [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5),
          sectors: generateSectorData(),
          liveCount,
          totalCount: stocks.length
        },
        source: liveCount > 0 ? 'upstox' : 'simulated',
        timestamp: new Date().toISOString()
      })
    }

    // Fallback to simulated data
    console.log('[Indian Market] No Upstox token, using simulated data')
    
    const stocks = Object.keys(NSE_STOCKS).map(s => generateSimulatedStock(s))
    
    return NextResponse.json({
      success: true,
      data: {
        indices: generateSimulatedIndexData(),
        stocks,
        topGainers: [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5),
        topLosers: [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5),
        sectors: generateSectorData(),
        liveCount: 0,
        totalCount: stocks.length
      },
      source: 'simulated',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[Indian Market] Error:', error)
    
    // Return simulated data on error
    const stocks = Object.keys(NSE_STOCKS).map(s => generateSimulatedStock(s))
    
    return NextResponse.json({
      success: true,
      data: {
        indices: generateSimulatedIndexData(),
        stocks,
        topGainers: [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5),
        topLosers: [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5),
        sectors: generateSectorData(),
      },
      source: 'simulated',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

function generateSectorData() {
  const sectors = ['Banking', 'IT', 'Energy', 'FMCG', 'Pharma', 'Auto', 'Metals', 'Power', 'Realty', 'Infrastructure']
  
  return sectors.map(sector => {
    const change = (Math.random() - 0.45) * 3
    return {
      name: sector,
      change: parseFloat(change.toFixed(2)),
      trend: change > 0.8 ? 'bullish' : change < -0.8 ? 'bearish' : 'neutral',
      stocks: Math.floor(Math.random() * 15 + 5)
    }
  })
}
