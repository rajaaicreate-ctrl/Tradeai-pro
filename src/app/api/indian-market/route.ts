import { NextResponse } from 'next/server'

// Indian stocks data with realistic prices
const INDIAN_STOCKS = {
  'RELIANCE.NS': { name: 'Reliance Industries', basePrice: 2480, sector: 'Energy' },
  'TCS.NS': { name: 'Tata Consultancy Services', basePrice: 3850, sector: 'IT' },
  'INFY.NS': { name: 'Infosys', basePrice: 1480, sector: 'IT' },
  'HDFCBANK.NS': { name: 'HDFC Bank', basePrice: 1620, sector: 'Banking' },
  'ICICIBANK.NS': { name: 'ICICI Bank', basePrice: 1080, sector: 'Banking' },
  'WIPRO.NS': { name: 'Wipro', basePrice: 465, sector: 'IT' },
  'SBIN.NS': { name: 'State Bank of India', basePrice: 745, sector: 'Banking' },
  'BHARTIARTL.NS': { name: 'Bharti Airtel', basePrice: 1380, sector: 'Telecom' },
  'ITC.NS': { name: 'ITC Limited', basePrice: 425, sector: 'FMCG' },
  'KOTAKBANK.NS': { name: 'Kotak Mahindra Bank', basePrice: 1720, sector: 'Banking' },
  'LT.NS': { name: 'Larsen & Toubro', basePrice: 3450, sector: 'Infrastructure' },
  'AXISBANK.NS': { name: 'Axis Bank', basePrice: 1120, sector: 'Banking' },
  'BAJFINANCE.NS': { name: 'Bajaj Finance', basePrice: 7250, sector: 'Finance' },
  'MARUTI.NS': { name: 'Maruti Suzuki', basePrice: 12450, sector: 'Auto' },
  'ASIANPAINT.NS': { name: 'Asian Paints', basePrice: 2850, sector: 'FMCG' },
  'SUNPHARMA.NS': { name: 'Sun Pharma', basePrice: 1580, sector: 'Pharma' },
  'TATASTEEL.NS': { name: 'Tata Steel', basePrice: 142, sector: 'Metals' },
  'HINDALCO.NS': { name: 'Hindalco', basePrice: 485, sector: 'Metals' },
  'NTPC.NS': { name: 'NTPC', basePrice: 340, sector: 'Power' },
  'POWERGRID.NS': { name: 'Power Grid Corp', basePrice: 265, sector: 'Power' },
}

// NIFTY 50 stocks (top 10 by weight)
const NIFTY50_STOCKS = [
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
  'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS'
]

// Generate realistic market data
function generateStockData(symbol: string) {
  const stock = INDIAN_STOCKS[symbol as keyof typeof INDIAN_STOCKS]
  if (!stock) return null

  const volatility = 0.03
  const changePercent = (Math.random() - 0.48) * 6 // Slight bullish bias
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
    high: parseFloat((price + Math.random() * price * 0.015).toFixed(2)),
    low: parseFloat((price - Math.random() * price * 0.015).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000 + 1000000),
    marketCap: `${(Math.random() * 10 + 1).toFixed(1)}L Cr`,
    pe: parseFloat((Math.random() * 30 + 10).toFixed(2)),
    week52High: parseFloat((stock.basePrice * 1.25).toFixed(2)),
    week52Low: parseFloat((stock.basePrice * 0.75).toFixed(2)),
  }
}

// Generate index data
function generateIndexData() {
  const niftyBase = 22450
  const niftyChange = (Math.random() - 0.48) * 400
  
  const sensexBase = 73800
  const sensexChange = (Math.random() - 0.48) * 1200

  const bankNiftyBase = 48200
  const bankNiftyChange = (Math.random() - 0.48) * 800

  return {
    nifty50: {
      name: 'NIFTY 50',
      value: parseFloat((niftyBase + niftyChange).toFixed(2)),
      change: parseFloat(niftyChange.toFixed(2)),
      changePercent: parseFloat(((niftyChange / niftyBase) * 100).toFixed(2)),
      open: niftyBase - 50,
      high: niftyBase + niftyChange + 80,
      low: niftyBase - 60,
    },
    sensex: {
      name: 'SENSEX',
      value: parseFloat((sensexBase + sensexChange).toFixed(2)),
      change: parseFloat(sensexChange.toFixed(2)),
      changePercent: parseFloat(((sensexChange / sensexBase) * 100).toFixed(2)),
      open: sensexBase - 150,
      high: sensexBase + sensexChange + 250,
      low: sensexBase - 180,
    },
    bankNifty: {
      name: 'BANK NIFTY',
      value: parseFloat((bankNiftyBase + bankNiftyChange).toFixed(2)),
      change: parseFloat(bankNiftyChange.toFixed(2)),
      changePercent: parseFloat(((bankNiftyChange / bankNiftyBase) * 100).toFixed(2)),
      open: bankNiftyBase - 100,
      high: bankNiftyBase + bankNiftyChange + 150,
      low: bankNiftyBase - 120,
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const symbol = searchParams.get('symbol')

  try {
    if (type === 'index') {
      return NextResponse.json({
        success: true,
        data: generateIndexData(),
        timestamp: new Date().toISOString()
      })
    }

    if (type === 'stock' && symbol) {
      const stockData = generateStockData(symbol)
      if (!stockData) {
        return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        data: stockData,
        timestamp: new Date().toISOString()
      })
    }

    if (type === 'top') {
      const topStocks = NIFTY50_STOCKS.map(s => generateStockData(s)).filter(Boolean)
      return NextResponse.json({
        success: true,
        data: topStocks,
        indices: generateIndexData(),
        timestamp: new Date().toISOString()
      })
    }

    // Default: return all data
    const allStocks = Object.keys(INDIAN_STOCKS).map(s => generateStockData(s)).filter(Boolean)
    
    return NextResponse.json({
      success: true,
      data: {
        indices: generateIndexData(),
        stocks: allStocks,
        topGainers: [...allStocks].sort((a: any, b: any) => b.changePercent - a.changePercent).slice(0, 5),
        topLosers: [...allStocks].sort((a: any, b: any) => a.changePercent - b.changePercent).slice(0, 5),
        sectors: generateSectorData()
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}

function generateSectorData() {
  const sectors = ['Banking', 'IT', 'Energy', 'FMCG', 'Pharma', 'Auto', 'Metals', 'Realty']
  
  return sectors.map(sector => {
    const change = (Math.random() - 0.45) * 4
    return {
      name: sector,
      change: parseFloat(change.toFixed(2)),
      trend: change > 0.5 ? 'bullish' : change < -0.5 ? 'bearish' : 'neutral'
    }
  })
}
