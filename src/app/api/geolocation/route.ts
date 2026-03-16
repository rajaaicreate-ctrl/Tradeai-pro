import { NextRequest, NextResponse } from 'next/server'

interface GeoLocationResponse {
  country: string
  countryCode: string
  region: string
  city: string
  isIndia: boolean
  currency: 'INR' | 'USD'
  symbol: '₹' | '$'
}

export async function GET(request: NextRequest) {
  try {
    // Get IP from headers or fallback
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0]?.trim() || realIp || '8.8.8.8'
    
    // Use ipapi.co for geolocation (free tier: 1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      // Fallback to default (India for local development)
      return NextResponse.json<GeoLocationResponse>({
        country: 'India',
        countryCode: 'IN',
        region: 'Tamil Nadu',
        city: 'Chennai',
        isIndia: true,
        currency: 'INR',
        symbol: '₹'
      })
    }
    
    const data = await response.json()
    
    const isIndia = data.country_code === 'IN'
    
    return NextResponse.json<GeoLocationResponse>({
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'US',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      isIndia,
      currency: isIndia ? 'INR' : 'USD',
      symbol: isIndia ? '₹' : '$'
    })
    
  } catch (error) {
    console.error('Geolocation error:', error)
    
    // Default to India on error
    return NextResponse.json<GeoLocationResponse>({
      country: 'India',
      countryCode: 'IN',
      region: 'Tamil Nadu',
      city: 'Chennai',
      isIndia: true,
      currency: 'INR',
      symbol: '₹'
    })
  }
}
