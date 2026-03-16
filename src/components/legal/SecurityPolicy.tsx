'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Lock, 
  ArrowLeft, 
  Shield, 
  Cloud, 
  Key, 
  CreditCard,
  Eye,
  Mail,
  CheckCircle
} from 'lucide-react'

interface SecurityPolicyProps {
  onBack: () => void
}

export default function SecurityPolicy({ onBack }: SecurityPolicyProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Security Policy</h1>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-2">
                🔒 Your Data is Protected
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Introduction */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                TradeAI Pro prioritizes the security of our users and their data. We employ 
                industry-leading security measures to ensure your information remains safe and protected.
              </p>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold">Data Protection</h2>
              </div>
              <p className="text-gray-300 mb-4">
                All user information is protected using modern encryption standards:
              </p>
              <ul className="space-y-3">
                {[
                  'AES-256 encryption for data at rest',
                  'TLS 1.3 for data in transit',
                  'End-to-end encryption for sensitive operations',
                  'Regular security audits and penetration testing'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Secure Infrastructure */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold">Secure Infrastructure</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Our platform is hosted on secure cloud infrastructure with advanced protection mechanisms:
              </p>
              <ul className="space-y-3">
                {[
                  'Enterprise-grade cloud hosting providers',
                  'DDoS protection and mitigation',
                  'Geographic redundancy for high availability',
                  'Regular backup and disaster recovery procedures'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Key className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-semibold">Account Security</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Users are encouraged to follow these security best practices:
              </p>
              <ul className="space-y-3">
                {[
                  'Use strong, unique passwords',
                  'Enable two-factor authentication (2FA)',
                  'Keep login credentials confidential',
                  'Regularly review account activity',
                  'Report suspicious activity immediately'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Payment Security */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold">Payment Security</h2>
              </div>
              <p className="text-gray-300 mb-4">
                All payment transactions are processed through secure third-party payment gateways:
              </p>
              <ul className="space-y-3">
                {[
                  'PCI DSS compliant payment processing',
                  'No card details stored on our servers',
                  'Secure payment via Stripe & Razorpay',
                  'Fraud detection and prevention systems'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Continuous Monitoring */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">Continuous Monitoring</h2>
              </div>
              <p className="text-gray-300">
                TradeAI Pro continuously monitors platform activity to detect potential threats and 
                vulnerabilities. Our security team employs 24/7 monitoring systems, automated threat 
                detection, and rapid incident response protocols to ensure platform integrity.
              </p>
            </CardContent>
          </Card>

          {/* Security Contact */}
          <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold">Security Contact</h2>
              </div>
              <p className="text-gray-300 mb-4">
                If you discover a security vulnerability or have security concerns, please report it immediately:
              </p>
              <a 
                href="mailto:security@tradeaipro.com" 
                className="inline-flex items-center gap-2 text-lg text-red-400 hover:text-red-300 transition-colors font-medium"
              >
                <Mail className="h-5 w-5" />
                security@tradeaipro.com
              </a>
              <p className="text-gray-500 text-sm mt-3">
                We take all security reports seriously and will respond within 24 hours.
              </p>
            </CardContent>
          </Card>

          {/* Compliance Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'SOC 2', icon: Shield },
              { label: 'GDPR Ready', icon: Lock },
              { label: 'PCI DSS', icon: CreditCard },
              { label: 'ISO 27001', icon: CheckCircle }
            ].map((item, i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-4 text-center">
                  <item.icon className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-400">{item.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
