'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  TrendingUp,
  BarChart3,
  Bell,
  Zap,
  Shield,
  Globe,
  LineChart,
  Target,
  Sparkles,
  ChevronRight,
  Play,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  MessageCircle,
  Radar,
  Clock,
  Users,
  DollarSign,
  Activity,
  Bot,
  Database,
  Layers,
  PieChart,
  Wallet
} from 'lucide-react'

interface LandingPageProps {
  onLogin: () => void
  onSignUp: () => void
}

export default function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 5)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Brain,
      title: 'AI Market Copilot',
      description: 'Your intelligent trading assistant powered by advanced AI. Ask any market question and get instant, data-driven insights.',
      details: ['Natural language queries', 'Multi-asset analysis', 'Context-aware responses', 'Real-time market data']
    },
    {
      icon: Radar,
      title: 'Opportunity Radar',
      description: 'AI-powered scanner that identifies high-probability trading opportunities across forex, crypto, stocks, and commodities.',
      details: ['24/7 market scanning', 'Pattern recognition', 'Confidence scoring', 'Entry/Exit signals']
    },
    {
      icon: BarChart3,
      title: 'Advanced Backtesting',
      description: 'Test your strategies against historical data with comprehensive performance metrics and risk analysis.',
      details: ['Multi-year data', 'Risk metrics', 'Win rate analysis', 'Equity curves']
    },
    {
      icon: Bell,
      title: 'Smart Alerts System',
      description: 'Set intelligent price alerts, pattern notifications, and receive instant updates via Telegram and Email.',
      details: ['Price alerts', 'Pattern detection', 'Multi-channel alerts', 'Custom conditions']
    },
    {
      icon: Globe,
      title: 'Global Markets Coverage',
      description: 'Access real-time data for forex pairs, cryptocurrencies, commodities, US stocks, and Indian markets.',
      details: ['Forex majors', 'Top cryptocurrencies', 'Gold & Silver', 'Indian indices']
    }
  ]

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Daily Analysis', value: '50,000+', icon: Activity },
    { label: 'Avg. Win Rate', value: '72%', icon: Target },
    { label: 'Assets Covered', value: '100+', icon: BarChart3 }
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for exploring our platform',
      features: ['5 AI queries/day', 'Basic market data', '3 active alerts', 'Community support'],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      description: 'For serious traders who want more',
      features: ['Unlimited AI queries', 'Real-time data feeds', '50 active alerts', 'Telegram & Email alerts', 'Advanced backtesting', 'Priority support'],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For teams and institutions',
      features: ['Everything in Pro', 'API access', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'White-label options'],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  const markets = [
    { name: 'BTC/USD', price: '$94,500', change: '+2.45%', positive: true },
    { name: 'EUR/USD', price: '1.0850', change: '+0.15%', positive: true },
    { name: 'XAU/USD', price: '$2,350', change: '-0.32%', positive: false },
    { name: 'NIFTY 50', price: '23,873', change: '+1.12%', positive: true }
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                TradeAI Pro
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#markets" className="text-gray-400 hover:text-white transition-colors">Markets</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={onLogin} className="text-gray-300 hover:text-white">
                Sign In
              </Button>
              <Button onClick={onSignUp} className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-400 hover:text-white">Features</a>
              <a href="#markets" className="block text-gray-400 hover:text-white">Markets</a>
              <a href="#pricing" className="block text-gray-400 hover:text-white">Pricing</a>
              <a href="#about" className="block text-gray-400 hover:text-white">About</a>
              <div className="pt-4 border-t border-gray-800 space-y-3">
                <Button variant="outline" onClick={onLogin} className="w-full">Sign In</Button>
                <Button onClick={onSignUp} className="w-full bg-gradient-to-r from-purple-500 to-cyan-500">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <Badge className="mb-6 bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Trading Intelligence
            </Badge>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Trade Smarter with
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI-Powered Insights
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Your intelligent trading companion that analyzes markets, identifies opportunities, 
              and helps you make data-driven decisions across Forex, Crypto, Stocks, and Commodities.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg"
                onClick={onSignUp}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 px-8 py-6 text-lg"
              >
                Start Free Trial
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Live Market Ticker */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {markets.map((market, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50">
                  <span className="text-white font-medium">{market.name}</span>
                  <span className="text-gray-400">{market.price}</span>
                  <span className={market.positive ? 'text-green-400' : 'text-red-400'}>
                    {market.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className={`mt-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative max-w-5xl mx-auto">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
              
              {/* Dashboard Preview */}
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
                {/* Window Controls */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-gray-400 text-sm">TradeAI Pro Dashboard</span>
                </div>
                
                {/* Dashboard Content Preview */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* AI Copilot Preview */}
                  <div className="md:col-span-2 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="h-5 w-5 text-cyan-400" />
                      <span className="text-cyan-400 font-medium">AI Market Copilot</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-purple-400">U</span>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300">
                          Is BTC bullish today?
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                        <div className="bg-gray-700/30 rounded-lg px-3 py-2 text-sm text-gray-300">
                          <span className="text-green-400 font-medium">BTC/USD</span> is showing <span className="text-green-400">bullish momentum</span> with price above key MAs. RSI at 62 suggests room for further upside...
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Opportunity Card */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Hot Opportunity</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Asset</span>
                        <span className="text-white font-medium">EUR/USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Direction</span>
                        <span className="text-green-400">Long</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence</span>
                        <span className="text-cyan-400">82%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full" style={{ width: '82%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 border-y border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 mb-4">
                  <stat.icon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              Powerful Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Everything You Need to Trade
              <span className="text-purple-400"> Smarter</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive tools for market analysis, 
              opportunity identification, and risk management.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className={`group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-8 hover:border-purple-500/50 transition-all duration-300 ${activeFeature === idx ? 'ring-2 ring-purple-500/50' : ''}`}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-purple-400" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-6">{feature.description}</p>

                {/* Feature List */}
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section id="markets" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
              Global Coverage
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              All Your Markets
              <span className="text-cyan-400"> in One Place</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: DollarSign, name: 'Forex', pairs: 'EUR/USD, GBP/USD, USD/JPY', color: 'from-green-500/20 to-emerald-500/20' },
              { icon: Wallet, name: 'Crypto', pairs: 'BTC, ETH, SOL, XRP', color: 'from-orange-500/20 to-yellow-500/20' },
              { icon: Layers, name: 'Commodities', pairs: 'Gold, Silver, Oil', color: 'from-yellow-500/20 to-amber-500/20' },
              { icon: PieChart, name: 'Indian Markets', pairs: 'NIFTY, SENSEX, Stocks', color: 'from-blue-500/20 to-indigo-500/20' },
              { icon: LineChart, name: 'US Stocks', pairs: 'AAPL, TSLA, MSFT', color: 'from-purple-500/20 to-pink-500/20' },
              { icon: Database, name: 'Indices', pairs: 'S&P 500, NASDAQ', color: 'from-cyan-500/20 to-blue-500/20' },
            ].map((market, idx) => (
              <div key={idx} className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all group">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${market.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <market.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{market.name}</h3>
                <p className="text-gray-400 text-sm">{market.pairs}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              How TradeAI Pro
              <span className="text-purple-400"> Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect', description: 'Sign up and connect your preferred markets. No broker account required to start.', icon: Globe },
              { step: '02', title: 'Analyze', description: 'Let AI analyze markets, identify patterns, and generate actionable insights in real-time.', icon: Brain },
              { step: '03', title: 'Execute', description: 'Receive alerts, review opportunities, and make informed trading decisions with confidence.', icon: Target }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/4 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent" />
                )}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-8 text-center">
                  <div className="text-5xl font-bold text-purple-500/30 mb-4">{item.step}</div>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
              Transparent Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Choose Your
              <span className="text-cyan-400"> Plan</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include our core AI features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div 
                key={idx}
                className={`relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border p-8 ${plan.popular ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-800/50'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 mt-2 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={plan.popular ? onSignUp : onLogin}
                  className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Trade Smarter?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join thousands of traders who are already using AI to make better trading decisions.
                Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg"
                  onClick={onSignUp}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 px-8"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={onLogin}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Already have an account?
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800/50 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">TradeAI Pro</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>

            <div className="text-gray-500 text-sm">
              © 2025 TradeAI Pro. All rights reserved.
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800/50 text-center">
            <p className="text-gray-500 text-xs">
              Risk Disclaimer: Trading involves substantial risk of loss. Past performance is not indicative of future results.
              TradeAI Pro provides educational analysis only and does not provide investment advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
