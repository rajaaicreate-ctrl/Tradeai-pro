import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

// Market Data API - Returns real-time style data
export async function GET() {
  try {
    // Generate dynamic market data
    const basePrices = {
      forex: 1.0850,
      crypto: 67000,
      gold: 2340,
      stocks: 525
    };

    const data = {
      forex: {
        symbol: 'EUR/USD',
        name: 'Euro / US Dollar',
        price: basePrices.forex + (Math.random() - 0.5) * 0.005,
        change: (Math.random() - 0.5) * 0.5
      },
      crypto: {
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        price: basePrices.crypto + (Math.random() - 0.5) * 1000,
        change: (Math.random() - 0.5) * 4
      },
      gold: {
        symbol: 'XAU/USD',
        name: 'Gold',
        price: basePrices.gold + (Math.random() - 0.5) * 20,
        change: (Math.random() - 0.5) * 1
      },
      stocks: {
        symbol: 'SPY',
        name: 'S&P 500 ETF',
        price: basePrices.stocks + (Math.random() - 0.5) * 3,
        change: (Math.random() - 0.5) * 1.5
      }
    };

    return NextResponse.json({
      success: true,
      data,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Market data API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch market data'
    }, { status: 500 });
  }
}
