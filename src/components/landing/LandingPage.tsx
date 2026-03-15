'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  TrendingUp,
  Zap,
  Shield,
  ChevronRight,
  Star,
  Play,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  Bell,
  Globe,
  Check,
  Menu,
  X,
  MessageCircle,
  Image,
  LineChart,
  Activity,
  Users,
  Clock,
  Rocket,
  Award,
  ChevronDown,
  IndianRupee,
  DollarSign
} from 'lucide-react'
import { formatPrice, PRICING_PLANS, type BillingPeriod, type PricingPlan } from '@/lib/subscription/types'

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
}

// Region-based pricing configuration
const REGIONAL_PRICING = {
  IN: {
    currency: 'INR',
    symbol: '₹',
    multiplier: 83, // USD to INR conversion
    popular: true
  },
  US: {
    currency: 'USD',
    symbol: '$',
    multiplier: 1,
    popular: false
  }
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [region, setRegion] = useState<'IN' | 'US'>('IN')
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [scrolled, setScrolled] = useState(false)
  
  const featuresRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)

  // Detect user region based on timezone
  useEffect(() => {
    const detectRegion = () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) {
          setRegion('IN')
        } else {
          setRegion('US')
        }
      } catch {
        setRegion('US')
      }
    }
    detectRegion()
  }, [])

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Animation on mount
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Get regional price
  const getRegionalPrice = (plan: PricingPlan) => {
    const regionConfig = REGIONAL_PRICING[region]
    const basePrice = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
    const convertedPrice = basePrice * regionConfig.multiplier
    return { price: convertedPrice, symbol: regionConfig.symbol, currency: regionConfig.currency }
  }

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Advanced machine learning algorithms analyze market patterns 24/7 to deliver actionable trading signals with 94% accuracy.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Smart Alerts',
      description: 'Real-time price alerts, pattern recognition, and custom indicators delivered via Telegram, Email, and push notifications.',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: BarChart3,
      title: 'Backtesting Engine',
      description: 'Test your strategies against 10+ years of historical data. Validate before you trade with our powerful backtesting suite.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Enterprise-level encryption, 2FA authentication, and SOC 2 compliance keep your data and trades secure.',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const stats = [
    { label: 'Active Traders', value: '50,000+', icon: Users },
    { label: 'AI Predictions', value: '10M+', icon: Brain },
    { label: 'Uptime', value: '99.99%', icon: Activity },
    { label: 'Countries', value: '120+', icon: Globe }
  ]

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Professional Trader, Mumbai',
      content: 'TradeAI Pro transformed my trading completely. The AI insights are incredibly accurate and the backtesting saved me from many bad trades.',
      rating: 5
    },
    {
      name: 'Sarah Chen',
      role: 'Hedge Fund Manager, Singapore',
      content: 'The Enterprise plan with API access allowed us to integrate TradeAI signals into our existing systems seamlessly. Outstanding platform.',
      rating: 5
    },
    {
      name: 'Michael Torres',
      role: 'Day Trader, New York',
      content: 'The real-time alerts and Telegram integration keep me informed even when I\'m away from my desk. Game changer for active traders.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 -z-5 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-950/90 backdrop-blur-lg border-b border-gray-800/50' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-50" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  TradeAI
                </span>
                <span className="text-xl font-light text-purple-400 ml-1">Pro</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => scrollToSection(featuresRef)} className="text-gray-300 hover:text-white transition-colors">Features</button>
              <button onClick={() => scrollToSection(pricingRef)} className="text-gray-300 hover:text-white transition-colors">Pricing</button>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Docs</a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" onClick={onLogin} className="text-gray-300 hover:text-white hover:bg-gray-800">
                Sign In
              </Button>
              <Button onClick={onGetStarted} className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold px-6">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-gray-900/95 backdrop-blur-lg border-t border-gray-800">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => { scrollToSection(featuresRef); setIsMenuOpen(false) }} className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">Features</button>
              <button onClick={() => { scrollToSection(pricingRef); setIsMenuOpen(false) }} className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">Pricing</button>
              <a href="#testimonials" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">Reviews</a>
              <div className="pt-4 border-t border-gray-800 space-y-3">
                <Button variant="ghost" onClick={() => { onLogin(); setIsMenuOpen(false) }} className="w-full justify-center text-gray-300">Sign In</Button>
                <Button onClick={() => { onGetStarted(); setIsMenuOpen(false) }} className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                  Get Started Free
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4">
        <div className={`max-w-7xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 mb-8">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-300">AI-Powered Trading Intelligence</span>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">v2.0</Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Trade Smarter with
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Harness the power of advanced machine learning for real-time market analysis, 
            predictive insights, and automated trading signals. Join 50,000+ traders worldwide.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-purple-500/25"
            >
              Start Trading Free
              <Rocket className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-6 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Setup in 2 minutes</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative p-6 rounded-2xl bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 group"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <stat.icon className="h-6 w-6 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-gray-500" />
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Win</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Professional-grade trading tools powered by cutting-edge AI technology
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative group cursor-pointer transition-all duration-500 ${
                  activeFeature === index ? 'scale-105' : 'hover:scale-102'
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity blur-xl`} />
                <Card className={`relative h-full bg-gray-900/50 border-gray-800/50 backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                  activeFeature === index ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : 'hover:border-gray-700'
                }`}>
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Platform Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
            <div className="relative rounded-3xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center text-sm text-gray-500">TradeAI Pro Dashboard</div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Chart Preview */}
                <div className="md:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">EUR/USD</span>
                      <Badge className="bg-green-500/20 text-green-400">+1.24%</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-xs text-gray-400">1H</Button>
                      <Button variant="ghost" size="sm" className="text-xs text-purple-400 bg-purple-500/10">4H</Button>
                      <Button variant="ghost" size="sm" className="text-xs text-gray-400">1D</Button>
                    </div>
                  </div>
                  <div className="h-40 flex items-end justify-between gap-1">
                    {[40, 55, 45, 60, 50, 70, 65, 80, 75, 90, 85, 95, 88, 92, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t opacity-70" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                {/* AI Insights Preview */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-purple-400" />
                    <span className="text-white font-semibold">AI Insights</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="text-xs text-green-400 mb-1">STRONG BUY</div>
                      <div className="text-sm text-white">EUR/USD - 94% confidence</div>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="text-xs text-yellow-400 mb-1">WATCH</div>
                      <div className="text-sm text-white">Gold testing support</div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="text-xs text-purple-400 mb-1">PATTERN</div>
                      <div className="text-sm text-white">BTC ascending triangle</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-20 lg:py-32 px-4 bg-gradient-to-b from-gray-950 via-gray-900/50 to-gray-950">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 mb-4">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Choose Your Trading Edge
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Start free, upgrade when you're ready. All plans include 7-day money-back guarantee.
            </p>

            {/* Region Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setRegion('IN')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  region === 'IN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-lg">🇮🇳</span>
                <span>India (INR)</span>
              </button>
              <button
                onClick={() => setRegion('US')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  region === 'US' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>International (USD)</span>
              </button>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  billingPeriod === 'yearly' ? 'bg-purple-500' : 'bg-gray-700'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>
              <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-white' : 'text-gray-500'}`}>Yearly</span>
              {billingPeriod === 'yearly' && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-2">Save 17%</Badge>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PRICING_PLANS.map((plan) => {
              const { price, symbol } = getRegionalPrice(plan)
              const isHighlighted = plan.highlighted
              
              return (
                <div
                  key={plan.id}
                  className={`relative group ${isHighlighted ? 'scale-105' : ''}`}
                >
                  {isHighlighted && (
                    <>
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-3xl blur-lg opacity-50" />
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 px-4 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    </>
                  )}
                  <Card className={`relative h-full ${
                    isHighlighted
                      ? 'bg-gray-900/90 border-purple-500/50'
                      : 'bg-gray-900/50 border-gray-800/50'
                  } backdrop-blur-sm`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl text-white flex items-center gap-2">
                        {plan.tier === 'pro' && <Zap className="h-6 w-6 text-purple-400" />}
                        {plan.tier === 'enterprise' && <CrownIcon className="h-6 w-6 text-cyan-400" />}
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">{symbol}</span>
                          <span className="text-5xl font-bold text-white">
                            {Math.round(price).toLocaleString()}
                          </span>
                          <span className="text-gray-400">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                        </div>
                        {billingPeriod === 'yearly' && plan.monthlyPrice > 0 && (
                          <p className="text-sm text-green-400 mt-1">
                            Save {symbol}{Math.round((plan.monthlyPrice * 12 - plan.yearlyPrice) * REGIONAL_PRICING[region].multiplier).toLocaleString()}/year
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 mb-6">
                        {plan.features.slice(0, 7).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            {feature.included ? (
                              <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                            )}
                            <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                              {feature.name}
                              {feature.limit && feature.included && (
                                <span className="text-gray-500 ml-1">
                                  ({feature.limit === 'unlimited' ? 'Unlimited' : feature.limit})
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Button
                        onClick={onGetStarted}
                        className={`w-full ${
                          isHighlighted
                            ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                        }`}
                        size="lg"
                      >
                        {plan.monthlyPrice === 0 ? 'Get Started Free' : 'Start Free Trial'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>

          {/* Payment Methods */}
          <div className="flex items-center justify-center gap-6 mt-12 text-gray-500">
            {region === 'IN' ? (
              <>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Razorpay Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-purple-400" />
                  <span>UPI / Cards / NetBanking</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Stripe Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-purple-400" />
                  <span>Credit / Debit Cards</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>7-Day Money Back</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Trusted by Traders Worldwide
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See what professional traders say about TradeAI Pro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="text-gray-500 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
            <Card className="relative bg-gray-900/80 border-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-8 lg:p-12 text-center">
                <Rocket className="h-12 w-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Ready to Transform Your Trading?
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                  Join 50,000+ traders who are already using AI to make smarter decisions. 
                  Start your free trial today—no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={onGetStarted}
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold px-8"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Talk to Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">TradeAI Pro</span>
              </div>
              <p className="text-gray-500 text-sm">
                AI-powered trading intelligence for the modern trader.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 TradeAI Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-400" />
                SOC 2 Compliant
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4 text-purple-400" />
                120+ Countries
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Crown icon component for Enterprise
function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M3 16h18" />
    </svg>
  )
}
