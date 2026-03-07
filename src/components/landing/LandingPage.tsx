'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Radar,
  Users,
  Activity,
  Bot,
  Database,
  Layers,
  PieChart,
  Wallet,
  Cpu,
  Network,
  Gauge,
  Rocket,
  Award,
  MessageCircle,
  Clock,
  Star,
  ArrowUpRight,
  Lock,
  FileText,
  Mail,
  AlertTriangle
} from 'lucide-react'

interface LandingPageProps {
  onLogin: () => void
  onSignUp: () => void
}

// Animated counter hook
function useCounter(end: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!start) return
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, start])
  
  return count
}

// Floating particle component
function Particle({ delay, duration, size, left, top }: { delay: number; duration: number; size: number; left: number; top: number }) {
  return (
    <div
      className="absolute rounded-full bg-gradient-to-r from-purple-500/30 to-cyan-500/30 blur-sm"
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        top: `${top}%`,
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  )
}

// Glowing orb
function GlowingOrb({ color, size, position }: { color: string; size: number; position: { x: string; y: string } }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl animate-pulse`}
      style={{
        width: size,
        height: size,
        left: position.x,
        top: position.y,
        background: `radial-gradient(circle, ${color}40 0%, ${color}00 70%)`,
        animation: 'pulse 4s ease-in-out infinite',
      }}
    />
  )
}

// 3D Card component
function Card3D({ children, className = '', glowColor = 'purple' }: { children: React.ReactNode; className?: string; glowColor?: 'purple' | 'cyan' | 'pink' | 'green' }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setRotate({ x: y * 10, y: x * -10 })
  }
  
  const handleMouseLeave = () => setRotate({ x: 0, y: 0 })
  
  const glowColors = {
    purple: 'hover:shadow-purple-500/25',
    cyan: 'hover:shadow-cyan-500/25',
    pink: 'hover:shadow-pink-500/25',
    green: 'hover:shadow-green-500/25',
  }
  
  return (
    <div
      ref={cardRef}
      className={`transform-gpu transition-all duration-300 ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 transition-shadow duration-300 hover:shadow-2xl ${glowColors[glowColor]}`}
        style={{ transform: 'translateZ(20px)' }}
      >
        {children}
      </div>
    </div>
  )
}

// Live price ticker
function PriceTicker() {
  const [prices, setPrices] = useState([
    { symbol: 'BTC/USD', price: 94500, change: 2.45, trend: 'up' },
    { symbol: 'ETH/USD', price: 3450, change: 1.82, trend: 'up' },
    { symbol: 'EUR/USD', price: 1.0850, change: -0.15, trend: 'down' },
    { symbol: 'XAU/USD', price: 2350, change: 0.67, trend: 'up' },
    { symbol: 'NIFTY', price: 23873, change: 1.12, trend: 'up' },
  ])
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => ({
        ...p,
        price: p.price * (1 + (Math.random() - 0.5) * 0.001),
        change: p.change + (Math.random() - 0.5) * 0.1,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      })))
    }, 2000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {prices.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 bg-gray-900/60 backdrop-blur-xl rounded-xl px-5 py-3 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className={`w-2 h-2 rounded-full ${item.trend === 'up' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          <span className="text-white font-semibold">{item.symbol}</span>
          <span className="text-gray-400 font-mono">
            {item.price > 100 ? item.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : item.price.toFixed(4)}
          </span>
          <span className={`font-medium ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {item.trend === 'up' ? '+' : ''}{item.change.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  )
}

// AI Visualization
function AIVisualization() {
  const orbitIcons = [
    { Icon: TrendingUp, color: 'bg-purple-500/20 border-purple-500/50' },
    { Icon: BarChart3, color: 'bg-cyan-500/20 border-cyan-500/50' },
    { Icon: Zap, color: 'bg-pink-500/20 border-pink-500/50' },
    { Icon: Target, color: 'bg-purple-500/20 border-purple-500/50' },
    { Icon: Radar, color: 'bg-cyan-500/20 border-cyan-500/50' },
    { Icon: Gauge, color: 'bg-pink-500/20 border-pink-500/50' },
  ]
  
  return (
    <div className="relative w-full h-64 md:h-80">
      {/* Central Brain */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-spin-slow opacity-20 blur-xl" />
        <div className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center border border-purple-500/30">
          <Brain className="w-12 h-12 md:w-16 md:h-16 text-purple-400 animate-pulse" />
        </div>
      </div>
      
      {/* Orbiting Nodes */}
      {[0, 60, 120, 180, 240, 300].map((angle, idx) => {
        const { Icon, color } = orbitIcons[idx]
        return (
          <div
            key={idx}
            className="absolute left-1/2 top-1/2 w-8 h-8 -ml-4 -mt-4"
            style={{
              transform: `rotate(${angle}deg) translateX(100px) rotate(-${angle}deg)`,
              animation: `orbit ${10 + idx}s linear infinite`,
            }}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} border backdrop-blur-sm`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>
        )
      })}
      
      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
        {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
          <line
            key={idx}
            x1="50%"
            y1="50%"
            x2={`${50 + 40 * Math.cos(angle * Math.PI / 180)}%`}
            y2={`${50 + 40 * Math.sin(angle * Math.PI / 180)}%`}
            stroke="url(#gradient)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// Animated stats counter
function AnimatedStats() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  
  const users = useCounter(12847, 2500, isVisible)
  const analysis = useCounter(2456000, 3000, isVisible)
  const accuracy = useCounter(94, 2000, isVisible)
  const uptime = useCounter(99, 2000, isVisible)
  
  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {[
        { value: users.toLocaleString(), label: 'Active Traders', icon: Users, suffix: '+' },
        { value: analysis.toLocaleString(), label: 'AI Analyses', icon: Activity, suffix: '+' },
        { value: accuracy, label: 'Accuracy Rate', icon: Target, suffix: '%' },
        { value: uptime, label: 'Uptime', icon: Gauge, suffix: '.9%' },
      ].map((stat, idx) => (
        <div key={idx} className="text-center group">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
            <stat.icon className="h-7 w-7 text-purple-400" />
          </div>
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
            {stat.value}{stat.suffix}
          </div>
          <div className="text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [legalModal, setLegalModal] = useState<string | null>(null)

  useEffect(() => {
    // Set current time on client
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      clearInterval(timeInterval)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const features = [
    {
      icon: Brain,
      title: 'AI Market Copilot',
      description: 'Revolutionary AI assistant that understands natural language and delivers instant, data-driven market insights across all asset classes.',
      details: ['Natural Language Processing', 'Multi-Asset Intelligence', 'Context Memory', 'Real-time Analysis'],
      color: 'purple',
      stats: '50M+ queries processed'
    },
    {
      icon: Radar,
      title: 'Quantum Radar',
      description: 'Next-generation opportunity scanner using quantum-inspired algorithms to identify high-probability setups before the market moves.',
      details: ['Predictive Scanning', 'Pattern Recognition', 'Confidence Scoring', 'Multi-Timeframe'],
      color: 'cyan',
      stats: '82% avg. accuracy'
    },
    {
      icon: BarChart3,
      title: 'Neural Backtesting',
      description: 'AI-powered backtesting engine that learns from historical data to optimize your strategy parameters automatically.',
      details: ['AI Optimization', 'Monte Carlo Simulation', 'Risk Metrics', 'Walk-Forward Analysis'],
      color: 'pink',
      stats: '10+ years historical data'
    },
    {
      icon: Network,
      title: 'Holographic Charts',
      description: 'Experience market data like never before with immersive 3D visualizations and real-time pattern overlays.',
      details: ['3D Visualization', 'Pattern Overlays', 'Multi-Chart Sync', 'Custom Indicators'],
      color: 'green',
      stats: '100+ technical indicators'
    },
    {
      icon: Shield,
      title: 'Quantum Security',
      description: 'Military-grade encryption and quantum-resistant security protocols protect your data and trading decisions.',
      details: ['End-to-End Encryption', 'Zero-Knowledge Proofs', 'Biometric Auth', 'Decentralized Storage'],
      color: 'purple',
      stats: 'Bank-grade security'
    },
    {
      icon: Bell,
      title: 'Smart Alerts 2.0',
      description: 'Intelligent alert system with AI-powered signal filtering and multi-channel instant notifications.',
      details: ['AI Signal Filter', 'Multi-Channel Alerts', 'Custom Conditions', 'Voice Notifications'],
      color: 'cyan',
      stats: '< 50ms latency'
    },
  ]

  const pricingPlans = [
    {
      name: 'Explorer',
      price: '0',
      description: 'Perfect for discovering the power of AI trading',
      features: ['10 AI queries/day', 'Basic market data', '5 active alerts', 'Community access', 'Email support'],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Professional',
      price: '79',
      description: 'For serious traders who demand the best',
      features: ['Unlimited AI queries', 'Real-time data feeds', '100 active alerts', 'Telegram & Discord', 'Advanced backtesting', 'Priority support', 'API access'],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Custom solutions for institutions',
      features: ['Everything in Pro', 'Dedicated infrastructure', 'Custom AI models', 'White-label options', 'SLA guarantee', '24/7 phone support', 'On-premise deployment'],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  const navItems = [
    { label: 'Features', id: 'features' },
    { label: 'Technology', id: 'technology' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'About', id: 'about' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8), 0 0 60px rgba(6, 182, 212, 0.5); }
        }
        html { scroll-behavior: smooth; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-glow {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950" />
        <GlowingOrb color="#8B5CF6" size={600} position={{ x: '-10%', y: '10%' }} />
        <GlowingOrb color="#06B6D4" size={500} position={{ x: '80%', y: '60%' }} />
        <GlowingOrb color="#EC4899" size={400} position={{ x: '50%', y: '80%' }} />
        {[...Array(20)].map((_, i) => (
          <Particle 
            key={i} 
            delay={i * 0.5} 
            duration={5 + (i % 5)} 
            size={4 + (i % 8)} 
            left={(i * 5) % 100}
            top={(i * 7 + 10) % 100}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button onClick={() => scrollToSection('hero')} className="flex items-center gap-3 cursor-pointer">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 animate-gradient opacity-50 blur-lg" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center animate-glow">
                  <Brain className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                  TradeAI Pro
                </span>
                <div className="text-[10px] text-cyan-400/60 tracking-widest">QUANTUM INTELLIGENCE</div>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={onLogin} className="text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer">
                Sign In
              </Button>
              <Button 
                onClick={onSignUp}
                className="relative group bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 px-6 py-2.5 overflow-hidden cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Launch App
                  <Rocket className="h-4 w-4" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => scrollToSection(item.id)} 
                  className="block text-gray-400 hover:text-white py-2 w-full text-left cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 border-t border-gray-800 space-y-3">
                <Button variant="outline" onClick={onLogin} className="w-full cursor-pointer">Sign In</Button>
                <Button onClick={onSignUp} className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 cursor-pointer">
                  Launch App
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-300">Quantum AI Engine v3.0 Live</span>
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black mb-8 leading-tight tracking-tight">
              <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                The Future of
              </span>
              <span className="block bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                AI Trading
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-light text-gray-400 mt-4">
                is Here
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Experience quantum-powered market intelligence. Our revolutionary AI analyzes millions of data points 
              in milliseconds to deliver actionable insights that were previously impossible.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg"
                onClick={onSignUp}
                className="group relative bg-gradient-to-r from-purple-500 via-purple-600 to-cyan-500 hover:from-purple-600 hover:via-purple-700 hover:to-cyan-600 px-10 py-7 text-lg font-semibold overflow-hidden cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('features')}
                className="border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:border-gray-600 px-10 py-7 text-lg backdrop-blur-sm cursor-pointer"
              >
                <Play className="mr-2 h-5 w-5" />
                See Features
              </Button>
            </div>

            <PriceTicker />
          </div>

          <div className="mb-16">
            <AIVisualization />
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-purple-500/30 rounded-3xl blur-3xl opacity-50" />
            <div className="relative bg-gray-900/80 backdrop-blur-2xl rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-800/50 border-b border-gray-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm">TradeAI Pro Dashboard</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                  </Badge>
                </div>
                <div className="text-gray-500 text-sm">
                  {currentTime || '--:--:--'}
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-glow">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-white font-semibold">AI Market Copilot</span>
                        <div className="text-xs text-cyan-400">Processing with Quantum Engine</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-white font-bold">U</span>
                        </div>
                        <div className="flex-1 bg-gray-700/30 rounded-2xl rounded-tl-none px-4 py-3">
                          <p className="text-gray-300">Analyze BTC/USD for potential breakout. Check RSI, MACD, and key support levels.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl rounded-tl-none px-4 py-3 border border-purple-500/20">
                          <p className="text-gray-200">
                            <span className="text-green-400 font-semibold">BTC/USD Analysis Complete</span><br/><br/>
                            <span className="text-cyan-400">Trend:</span> Strong Bullish (82% confidence)<br/>
                            <span className="text-cyan-400">RSI:</span> 58 - Room for upside<br/>
                            <span className="text-cyan-400">Key Support:</span> $92,500<br/>
                            <span className="text-cyan-400">Target:</span> $98,000 - $102,000
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-5 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Hot Opportunity</span>
                      <Badge className="ml-auto bg-green-500/20 text-green-400 text-xs animate-pulse">LIVE</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Asset</span>
                        <span className="text-white font-bold text-lg">EUR/USD</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Direction</span>
                        <Badge className="bg-green-500/20 text-green-400">LONG</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Confidence</span>
                        <span className="text-cyan-400 font-bold">87%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 text-center">
                      <Activity className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                      <div className="text-xl font-bold text-white">247</div>
                      <div className="text-xs text-gray-400">Signals Today</div>
                    </div>
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 text-center">
                      <Target className="h-5 w-5 text-green-400 mx-auto mb-1" />
                      <div className="text-xl font-bold text-white">89%</div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedStats />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-1.5">
              <Cpu className="h-4 w-4 mr-2" />
              Quantum-Powered Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Technology That
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                Changes Everything
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built from the ground up with cutting-edge AI and quantum-inspired algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Card3D key={idx} glowColor={feature.color as any} className="h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    feature.color === 'purple' ? 'bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30' :
                    feature.color === 'cyan' ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30' :
                    feature.color === 'pink' ? 'bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/30' :
                    'bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30'
                  }`}>
                    <feature.icon className={`h-7 w-7 ${
                      feature.color === 'purple' ? 'text-purple-400' :
                      feature.color === 'cyan' ? 'text-cyan-400' :
                      feature.color === 'pink' ? 'text-pink-400' :
                      'text-green-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.stats}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Cpu className="h-4 w-4 mr-2" />
              Our Technology Stack
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Built for the Future
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: 'Quantum AI Engine', desc: 'Advanced neural networks with quantum-inspired algorithms' },
              { icon: Database, title: 'Real-time Data', desc: 'Processing millions of data points per second' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption and zero-trust architecture' },
              { icon: Globe, title: 'Global Infrastructure', desc: '99.9% uptime with edge computing nodes worldwide' },
            ].map((tech, idx) => (
              <div key={idx} className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all group text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <tech.icon className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{tech.title}</h3>
                <p className="text-gray-400 text-sm">{tech.desc}</p>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-10">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/50 via-cyan-500/50 to-pink-500/50" />
              
              {[
                { step: '01', title: 'Create Account', desc: 'Sign up in seconds. No credit card required for free tier.', icon: Users, color: 'from-purple-500 to-purple-400' },
                { step: '02', title: 'Connect Markets', desc: 'Select your preferred markets and configure preferences.', icon: Globe, color: 'from-cyan-500 to-cyan-400' },
                { step: '03', title: 'Trade Smarter', desc: 'Let AI guide your decisions with quantum insights.', icon: Target, color: 'from-pink-500 to-pink-400' }
              ].map((item, idx) => (
                <div key={idx} className="relative text-center">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} mx-auto mb-6 flex items-center justify-center shadow-lg`}>
                    <item.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-sm font-bold text-gray-500 mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
              <Award className="h-4 w-4 mr-2" />
              Pricing Plans
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Choose Your
              </span>
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Power Level</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div 
                key={idx}
                className={`relative group ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-1 shadow-lg shadow-purple-500/30">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className={`h-full bg-gray-900/80 backdrop-blur-xl rounded-3xl border p-8 transition-all duration-500 ${
                  plan.popular 
                    ? 'border-purple-500/50 ring-2 ring-purple-500/20 shadow-xl shadow-purple-500/10' 
                    : 'border-gray-700/50 hover:border-gray-600/50'
                }`}>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {plan.price === '0' ? '$0' : plan.price === 'Custom' ? '' : '$' + plan.price}
                      </span>
                      {plan.price !== 'Custom' && <span className="text-gray-400">/mo</span>}
                      {plan.price === 'Custom' && <span className="text-3xl font-bold text-white">Custom</span>}
                    </div>
                    <p className="text-gray-500 mt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={plan.popular ? onSignUp : plan.price === '0' ? onSignUp : onLogin}
                    className={`w-full py-6 text-lg font-semibold cursor-pointer ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/25' 
                        : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
                About TradeAI Pro
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Revolutionizing
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Trading Intelligence
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                TradeAI Pro was founded with a singular mission: to democratize institutional-grade trading intelligence 
                for every trader, regardless of experience level. Our quantum-inspired AI engine processes vast amounts 
                of market data in real-time, identifying patterns and opportunities that would be impossible for humans to detect.
              </p>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                With offices in Silicon Valley, Singapore, and London, our team of AI researchers, quantitative analysts, 
                and trading veterans work tirelessly to push the boundaries of what's possible in market analysis.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  SOC 2 Certified
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  GDPR Compliant
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  ISO 27001
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Users, value: '50+', label: 'Team Members' },
                { icon: Globe, value: '3', label: 'Global Offices' },
                { icon: Award, value: '15+', label: 'Industry Awards' },
                { icon: Clock, value: '24/7', label: 'Support' },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 text-center">
                  <item.icon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{item.value}</div>
                  <div className="text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
            <div className="relative bg-gray-900/90 backdrop-blur-2xl rounded-3xl border border-gray-700/50 p-12 md:p-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-8 animate-glow">
                <Rocket className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Ready to Experience
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                  the Future?
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                Join thousands of traders who have already transformed their trading with AI-powered intelligence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg"
                  onClick={onSignUp}
                  className="bg-gradient-to-r from-purple-500 via-purple-600 to-cyan-500 hover:from-purple-600 hover:via-purple-700 hover:to-cyan-600 px-10 py-7 text-lg font-semibold shadow-xl shadow-purple-500/25 cursor-pointer"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={onLogin}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800/50 px-10 py-7 text-lg cursor-pointer"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <button onClick={() => scrollToSection('hero')} className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <span className="text-lg font-bold text-white">TradeAI Pro</span>
                <div className="text-xs text-gray-500">Quantum Intelligence</div>
              </div>
            </button>
            
            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { id: 'privacy', label: 'Privacy Policy', icon: Shield },
                { id: 'terms', label: 'Terms', icon: FileText },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'contact', label: 'Contact', icon: Mail },
                { id: 'risk', label: 'Risk Disclaimer', icon: AlertTriangle },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => setLegalModal(link.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <link.icon className="h-3 w-3" />
                  {link.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            © 2025 TradeAI Pro. All rights reserved.
          </div>
          
          <div className="mt-4 pt-6 border-t border-gray-800/50 text-center">
            <p className="text-gray-600 text-xs">
              ⚠️ Risk Disclaimer: Trading involves substantial risk of loss. TradeAI Pro provides educational analysis only and does not provide financial advice.
            </p>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <Dialog open={legalModal === 'privacy'} onOpenChange={() => setLegalModal(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl text-white">
              <Shield className="h-5 w-5 text-purple-400" />
              Privacy Policy
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-gray-300 text-sm">
              <p className="text-gray-400">Last Updated: 2025</p>
              <p>TradeAI Pro respects your privacy and is committed to protecting your personal information.</p>
              <h4 className="text-white font-semibold">Information We Collect</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Email address</li>
                <li>Account preferences</li>
                <li>Usage analytics</li>
                <li>Device and browser information</li>
              </ul>
              <h4 className="text-white font-semibold">How We Use Your Information</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Provide AI market analysis</li>
                <li>Improve platform performance</li>
                <li>Personalize user experience</li>
                <li>Provide customer support</li>
              </ul>
              <h4 className="text-white font-semibold">Contact</h4>
              <p>For questions: <a href="mailto:support@tradeaipro.com" className="text-purple-400 hover:underline">support@tradeaipro.com</a></p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={legalModal === 'terms'} onOpenChange={() => setLegalModal(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl text-white">
              <FileText className="h-5 w-5 text-cyan-400" />
              Terms of Service
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-gray-300 text-sm">
              <p>By using TradeAI Pro, you agree to the following terms.</p>
              <h4 className="text-white font-semibold">Platform Purpose</h4>
              <p>TradeAI Pro provides AI-powered market analysis tools for educational and informational purposes only.</p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-300 font-medium">⚠️ TradeAI Pro does not provide financial or investment advice.</p>
              </div>
              <h4 className="text-white font-semibold">User Responsibilities</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Users are solely responsible for their trading decisions</li>
                <li>Do not misuse the platform</li>
                <li>Maintain account security</li>
              </ul>
              <h4 className="text-white font-semibold">Limitation of Liability</h4>
              <p>TradeAI Pro is not responsible for financial losses resulting from trading decisions made by users.</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={legalModal === 'security'} onOpenChange={() => setLegalModal(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl text-white">
              <Lock className="h-5 w-5 text-green-400" />
              Security Policy
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-gray-300 text-sm">
              <p>TradeAI Pro prioritizes the security of our users and their data.</p>
              <h4 className="text-white font-semibold">Data Protection</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>AES-256 encryption for all data</li>
                <li>TLS 1.3 for data transmission</li>
                <li>Regular security audits</li>
              </ul>
              <h4 className="text-white font-semibold">Secure Infrastructure</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Hosted on secure cloud infrastructure</li>
                <li>Advanced firewall protection</li>
                <li>24/7 monitoring</li>
              </ul>
              <h4 className="text-white font-semibold">Security Contact</h4>
              <p>Report vulnerabilities: <a href="mailto:security@tradeaipro.com" className="text-green-400 hover:underline">security@tradeaipro.com</a></p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={legalModal === 'contact'} onOpenChange={() => setLegalModal(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl text-white">
              <Mail className="h-5 w-5 text-blue-400" />
              Contact Us
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-gray-300 text-sm">
              <p>Our support team is here to help!</p>
              <div className="grid gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <p className="text-gray-400 text-xs">Support Email</p>
                  <a href="mailto:support@tradeaipro.com" className="text-blue-400 hover:underline">support@tradeaipro.com</a>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <p className="text-gray-400 text-xs">General Inquiries</p>
                  <a href="mailto:info@tradeaipro.com" className="text-blue-400 hover:underline">info@tradeaipro.com</a>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <p className="text-gray-400 text-xs">Business Partnerships</p>
                  <a href="mailto:partnerships@tradeaipro.com" className="text-blue-400 hover:underline">partnerships@tradeaipro.com</a>
                </div>
              </div>
              <h4 className="text-white font-semibold">Response Time</h4>
              <p>Our team typically responds within 24-48 hours.</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={legalModal === 'risk'} onOpenChange={() => setLegalModal(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl text-white">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Risk Disclaimer
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-gray-300 text-sm">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 font-medium">⚠️ Trading involves significant risk and may not be suitable for all investors.</p>
              </div>
              <h4 className="text-white font-semibold">Educational Purpose Only</h4>
              <p>TradeAI Pro provides AI-powered analytical tools for educational purposes only. We do not provide financial advice.</p>
              <h4 className="text-white font-semibold">Your Responsibility</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Users are solely responsible for trading decisions</li>
                <li>Never trade with money you cannot afford to lose</li>
                <li>Always conduct your own research</li>
              </ul>
              <h4 className="text-white font-semibold">No Guarantees</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>TradeAI Pro does not guarantee profits</li>
                <li>Past performance is not indicative of future results</li>
                <li>Market conditions can change rapidly</li>
              </ul>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
