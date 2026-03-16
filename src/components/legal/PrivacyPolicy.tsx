'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  ArrowLeft, 
  Mail, 
  Cookie, 
  Database, 
  Lock,
  UserCheck,
  BarChart3
} from 'lucide-react'

interface PrivacyPolicyProps {
  onBack: () => void
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mt-2">
                Last Updated: 2025
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
                TradeAI Pro respects your privacy and is committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Database className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold">Information We Collect</h2>
              </div>
              <p className="text-gray-400 mb-4">
                We may collect the following information when you use our platform:
              </p>
              <ul className="space-y-3">
                {[
                  'Email address',
                  'Account preferences',
                  'Usage analytics',
                  'Device and browser information'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold">How We Use Your Information</h2>
              </div>
              <p className="text-gray-400 mb-4">
                Your information is used to:
              </p>
              <ul className="space-y-3">
                {[
                  'Provide AI market analysis',
                  'Improve platform performance',
                  'Personalize user experience',
                  'Provide customer support'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-cyan-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Cookie className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-semibold">Cookies</h2>
              </div>
              <p className="text-gray-300">
                TradeAI Pro may use cookies to enhance website functionality and improve user experience. 
                You can manage cookie preferences through your browser settings.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold">Third-Party Services</h2>
              </div>
              <p className="text-gray-400 mb-4">
                We may use third-party tools for:
              </p>
              <ul className="space-y-3">
                {[
                  'Analytics',
                  'Payment processing',
                  'Infrastructure services'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold">Data Security</h2>
              </div>
              <p className="text-gray-300">
                We implement industry-standard security measures to protect user information. 
                This includes encryption, secure servers, and regular security audits.
              </p>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">User Rights</h2>
              </div>
              <p className="text-gray-300">
                Users can request data deletion or modification by contacting our support team. 
                We are committed to honoring your privacy rights within applicable regulations.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-3">Contact</h2>
              <p className="text-gray-300">
                If you have questions about this Privacy Policy, please contact:
              </p>
              <a 
                href="mailto:support@tradeaipro.com" 
                className="inline-flex items-center gap-2 mt-3 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Mail className="h-4 w-4" />
                support@tradeaipro.com
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
