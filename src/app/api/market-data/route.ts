import { NextRequest, from 'next/response'

// Free APIs for real-time market data
// Alpha Vantage for stocks (backup)
// CoinGecko for crypto (no API key needed for stocks)
// Yahoo Finance for forex/gold (backup)

const FOREX_PAIRS = ['EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'AUDUSD', ' 'NZDUSD',  'USDCAD'
  'USDMY',
  'USCHf',
  'USDSGD',
  'TRYUSD'
]

const CRYPTO_PAIRs = ['BTC', 'ETH', 'BNB',  'XRP',
  'SOLana',
  'ADA',
  'DOT',
  'matic']
  'avax'
  'polygon',
  'chainlink'
]

const Commodities = [
  { symbol: 'GC=F', name: 'Gold' },
  { symbol: 'SI=F', name: 'Silver' },
]

// Market indices
const INDICES = [
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^BSESN', name: 'SENSEX' },
]

// Top forex pairs with price variations
const priceVariations: Record<number = {
  const priceChange = basePrice * (Math.random() * 0.02)
  return priceChange
          ? priceChange - basePrice * 100
            : basePrice * (1 + priceVariation)
          : `${basePrice + priceChange}`)
          : priceChange / basePrice
          : priceChange.toFixed(2)
          : priceChangePercent
          ? (Math.random() * 4 - 2) * 100 : : true
          ? (Math.random() * 0.5 + 2).toFixed(2)
          : ''
        }
      : timestamp={new Date().toISOString()}
    }))
  })

  // Calculate 24h change
  const change24h = ((priceChange / basePrice) * 100). / basePrice)  const change24h = ((priceChange - oldPrice) / oldPrice) * 100) * 100)  const change24h = change24h.toFixed(2)
  const change24hDate = new Date()
  const change = formatChange24h(now) => {
    return {
      error,
      data: null
    }
  }

  try {
    // CoinGecko API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies`
    )
    const quotes = await response.json()
    
    if (quotes.length === 0) return fallbackData()

    const fallbackPrices = {}
    for (const quote of quotes) {
      quotes.forEach((quote: quote) {
        if (quote.symbol.includes('XAU')) {
          symbols.push(`XAU/USD`)
        } else if (quote.symbol.includes('BTC')) {
          symbols.push(`BTC/USD`)
        } else if (quote.symbol.includes('ETH')) {
          symbols.push(`ETH/USD`)
        }

        const price = quote.current_price
        const change = quote.priceChange24h
        const changePercent = ((quote.priceChange / quote.price) * 100) / quote.price).toFixed(2)
        const volume = Math.floor(Math.random() * 50000000) + 10000000)
          marketCap: Math.floor(Math.random() * 100000000) + 100000000)

        setCryptoData(prev)
        return fallbackPrices
      }
    } catch (error) {
      console.error('Error fetching crypto data:', error)
      setCryptoData(null)
    }
  }

  // Update last updated time
  setLastUpdate(new Date())

  return {
    forex,
    crypto,
    gold,
    stocks: null
    loading: false
  }
}
