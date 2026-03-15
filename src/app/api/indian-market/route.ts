import { NextResponse } from 'next/server'

// Indian stocks data with realistic prices (updated 2024)
const INDIAN_STOCKS = {
  'RELIANCE.NS': { name: 'Reliance Industries', basePrice: 1280, sector: 'Energy' },
  'TCS.NS': { name: 'Tata Consultancy Services', basePrice: 3580, sector: 'IT' },
  'INFY.NS': { name: 'Infosys', basePrice: 1380, sector: 'IT' },
  'HDFCBANK.NS': { name: 'HDFC Bank', basePrice: 1620, sector: 'Banking' },
  'ICICIBANK.NS': { name: 'ICICI Bank', basePrice: 1080, sector: 'Banking' },
  'WIPRO.NS': { name: 'Wipro', basePrice: 445, sector: 'IT' },
  'SBIN.NS': { name: 'State Bank of India', basePrice: 625, sector: 'Banking' },
  'BHARTIARTL.NS': { name: 'Bharti Airtel', basePrice: 1580, sector: 'Telecom' },
  'ITC.NS': { name: 'ITC Limited', basePrice: 435, sector: 'FMCG' },
  'KOTAKBANK.NS': { name: 'Kotak Mahindra Bank', basePrice: 1720, sector: 'Banking' },
  'LT.NS': { name: 'Larsen & Toubro', basePrice: 3250, sector: 'Infrastructure' },
  'AXISBANK.NS': { name: 'Axis Bank', basePrice: 1020, sector: 'Banking' },
  'BAJFINANCE.NS': { name: 'Bajaj Finance', basePrice: 6250, sector: 'Finance' },
  'MARUTI.NS': { name: 'Maruti Suzuki', basePrice: 11250, sector: 'Auto' },
  'ASIANPAINT.NS': { name: 'Asian Paints', basePrice: 2250, sector: 'FMCG' },
  'SUNPHARMA.NS': { name: 'Sun Pharma', basePrice: 1680, sector: 'Pharma' },
  'TATASTEEL.NS': { name: 'Tata Steel', basePrice: 138, sector: 'Metals' },
  'HINDALCO.NS': { name: 'Hindalco', basePrice: 485, sector: 'Metals' },
  'NTPC.NS': { name: 'NTPC', basePrice: 340, sector: 'Power' },
  'POWERGRID.NS': { name: 'Power Grid Corp', basePrice: 265, sector: 'Power' },
  'TATAMOTORS.NS': { name: 'Tata Motors', basePrice: 680, sector: 'Auto' },
  'HINDUNILVR.NS': { name: 'Hindustan Unilever', basePrice: 2380, sector: 'FMCG' },
  'ADANIENT.NS': { name: 'Adani Enterprises', basePrice: 2180, sector: 'Conglomerate' },
  'ADANIGREEN.NS': { name: 'Adani Green Energy', basePrice: 920, sector: 'Power' },
  'DMART.NS': { name: 'Avenue Supermarts', basePrice: 3650, sector: 'Retail' },
}

// Fetch live data from Yahoo Finance
async function fetchYahooFinanceData(symbols: string[]) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    // Yahoo Finance API endpoint
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error('Yahoo Finance API error')
    }

    const data = await response.json()
    return data.quoteResponse?.result || []
  } catch (error) {
    console.error('Yahoo Finance API error:', error)
    return []
  }
}

// Generate stock data with live prices or fallback
async function generateStockData(symbol: string, liveData?: any) {
  const stock = INDIAN_STOCKS[symbol as keyof typeof INDIAN_STOCKS]
  if (!stock) return null

  // If we have live data from Yahoo
  if (liveData && liveData.regularMarketPrice) {
    return {
      symbol,
      name: liveData.shortName || stock.name,
      sector: stock.sector,
      price: parseFloat(liveData.regularMarketPrice.toFixed(2)),
      change: parseFloat((liveData.regularMarketChange || 0).toFixed(2)),
      changePercent: parseFloat((liveData.regularMarketChangePercent || 0).toFixed(2)),
      open: parseFloat((liveData.regularMarketOpen || stock.basePrice).toFixed(2)),
      high: parseFloat((liveData.regularMarketDayHigh || stock.basePrice * 1.02).toFixed(2)),
      low: parseFloat((liveData.regularMarketDayLow || stock.basePrice * 0.98).toFixed(2)),
      volume: liveData.regularMarketVolume || Math.floor(Math.random() * 10000000 + 1000000),
      marketCap: formatMarketCap(liveData.marketCap),
      pe: parseFloat((liveData.trailingPE || 15 + Math.random() * 15).toFixed(2)),
      week52High: parseFloat((liveData.fiftyTwoWeekHigh || stock.basePrice * 1.25).toFixed(2)),
      week52Low: parseFloat((liveData.fiftyTwoWeekLow || stock.basePrice * 0.75).toFixed(2)),
      isLive: true
    }
  }

  // Fallback to simulated data
  const volatility = 0.025
  const changePercent = (Math.random() - 0.48) * 5
  const change = stock.basePrice * (changePercent / 100)
  const price = stock.basePrice + change

  return {
    symbol,
    name: stock.name,
    sector: stock.sector,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    open: parseFloat((stock.basePrice - (Math.random() - 0.5) * stock.basePrice * 0.01).toFixed(2)),
    high: parseFloat((price + Math.random() * price * 0.012).toFixed(2)),
    low: parseFloat((price - Math.random() * price * 0.012).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000 + 1000000),
    marketCap: `${(Math.random() * 10 + 1).toFixed(1)}L Cr`,
    pe: parseFloat((Math.random() * 25 + 12).toFixed(2)),
    week52High: parseFloat((stock.basePrice * 1.25).toFixed(2)),
    week52Low: parseFloat((stock.basePrice * 0.75).toFixed(2)),
    isLive: false
  }
}

function formatMarketCap(marketCap?: number): string {
  if (!marketCap) return 'N/A'
  if (marketCap > 1e14) return `${(marketCap / 1e14).toFixed(1)}L Cr`
  if (marketCap > 1e12) return `${(marketCap / 1e12).toFixed(1)}T`
  if (marketCap > 1e9) return `${(marketCap / 1e9).toFixed(1)}B`
  return `${(marketCap / 1e6).toFixed(1)}M`
}

// Generate index data
function generateIndexData() {
  // Approximate current levels (March 2024)
  const niftyBase = 22450
  const niftyChange = (Math.random() - 0.48) * 350
  
  const sensexBase = 74000
  const sensexChange = (Math.random() - 0.48) * 1000

  const bankNiftyBase = 48500
  const bankNiftyChange = (Math.random() - 0.48) * 700

  const finNiftyBase = 20500
  const finNiftyChange = (Math.random() - 0.48) * 300

  return {
    nifty50: {
      name: 'NIFTY 50',
      value: parseFloat((niftyBase + niftyChange).toFixed(2)),
      change: parseFloat(niftyChange.toFixed(2)),
      changePercent: parseFloat(((niftyChange / niftyBase) * 100).toFixed(2)),
      open: niftyBase - 50 + (Math.random() - 0.5) * 30,
      high: niftyBase + Math.max(niftyChange, 0) + 80,
      low: niftyBase + Math.min(niftyChange, 0) - 60,
    },
    sensex: {
      name: 'SENSEX',
      value: parseFloat((sensexBase + sensexChange).toFixed(2)),
      change: parseFloat(sensexChange.toFixed(2)),
      changePercent: parseFloat(((sensexChange / sensexBase) * 100).toFixed(2)),
      open: sensexBase - 150 + (Math.random() - 0.5) * 100,
      high: sensexBase + Math.max(sensexChange, 0) + 250,
      low: sensexBase + Math.min(sensexChange, 0) - 180,
    },
    bankNifty: {
      name: 'BANK NIFTY',
      value: parseFloat((bankNiftyBase + bankNiftyChange).toFixed(2)),
      change: parseFloat(bankNiftyChange.toFixed(2)),
      changePercent: parseFloat(((bankNiftyChange / bankNiftyBase) * 100).toFixed(2)),
      open: bankNiftyBase - 100 + (Math.random() - 0.5) * 50,
      high: bankNiftyBase + Math.max(bankNiftyChange, 0) + 150,
      low: bankNiftyBase + Math.min(bankNiftyChange, 0) - 120,
    },
    finNifty: {
      name: 'FIN NIFTY',
      value: parseFloat((finNiftyBase + finNiftyChange).toFixed(2)),
      change: parseFloat(finNiftyChange.toFixed(2)),
      changePercent: parseFloat(((finNiftyChange / finNiftyBase) * 100).toFixed(2)),
      open: finNiftyBase - 50 + (Math.random() - 0.5) * 30,
      high: finNiftyBase + Math.max(finNiftyChange, 0) + 80,
      low: finNiftyBase + Math.min(finNiftyChange, 0) - 60,
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const symbol = searchParams.get('symbol')

  try {
    // Try to fetch live data from Yahoo Finance
    const topSymbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 
                        'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'LT.NS']
    
    const liveQuotes = await fetchYahooFinanceData(topSymbols)
    const liveDataMap = new Map(liveQuotes.map((q: any) => [q.symbol, q]))

    if (type === 'index') {
      return NextResponse.json({
        success: true,
        data: generateIndexData(),
        timestamp: new Date().toISOString()
      })
    }

    if (type === 'stock' && symbol) {
      const liveQuote = liveDataMap.get(symbol)
      const stockData = await generateStockData(symbol, liveQuote)
      if (!stockData) {
        return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        data: stockData,
        timestamp: new Date().toISOString()
      })
    }

    // Default: return all data
    const allStocks = await Promise.all(
      Object.keys(INDIAN_STOCKS).map(async (s) => {
        const liveQuote = liveDataMap.get(s)
        return generateStockData(s, liveQuote)
      })
    )
    const validStocks = allStocks.filter(Boolean)
    
    return NextResponse.json({
      success: true,
      data: {
        indices: generateIndexData(),
        stocks: validStocks,
        topGainers: [...validStocks].sort((a: any, b: any) => b.changePercent - a.changePercent).slice(0, 5),
        topLosers: [...validStocks].sort((a: any, b: any) => a.changePercent - b.changePercent).slice(0, 5),
        sectors: generateSectorData(),
        liveCount: validStocks.filter((s: any) => s.isLive).length,
        totalCount: validStocks.length
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Indian market data error:', error)
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}

function generateSectorData() {
  const sectors = ['Banking', 'IT', 'Energy', 'FMCG', 'Pharma', 'Auto', 'Metals', 'Power', 'Realty', 'Infrastructure']
  
  return sectors.map(sector => {
    const change = (Math.random() - 0.45) * 4
    return {
      name: sector,
      change: parseFloat(change.toFixed(2)),
      trend: change > 0.8 ? 'bullish' : change < -0.8 ? 'bearish' : 'neutral',
      stocks: Math.floor(Math.random() * 20 + 5)
    }
  })
}
