'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  ArrowLeft, 
  AlertTriangle, 
  Shield, 
  Users,
  Ban,
  Scale,
  Key,
  RefreshCw
} from 'lucide-react'

interface TermsOfServiceProps {
  onBack: () => void
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
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
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mt-2">
                Legal Agreement
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
                By using TradeAI Pro, you agree to the following terms. Please read these terms carefully 
                before accessing or using our platform.
              </p>
            </CardContent>
          </Card>

          {/* Platform Purpose */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold">Platform Purpose</h2>
              </div>
              <p className="text-gray-300">
                TradeAI Pro provides AI-powered market analysis tools designed to help users analyze 
                financial markets. Our platform delivers real-time insights, predictive analytics, 
                and comprehensive market data for educational and informational purposes.
              </p>
            </CardContent>
          </Card>

          {/* No Financial Advice */}
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-semibold text-amber-400">No Financial Advice</h2>
              </div>
              <p className="text-gray-300">
                TradeAI Pro <span className="text-amber-400 font-semibold">does not provide financial or investment advice</span>. 
                All information and analysis provided by the platform are for educational and informational purposes only. 
                Users are responsible for their own trading decisions and should consult with qualified financial 
                advisors before making investment decisions.
              </p>
            </CardContent>
          </Card>

          {/* Platform Usage */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Ban className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold">Platform Usage</h2>
              </div>
              <p className="text-gray-400 mb-4">
                Users agree not to:
              </p>
              <ul className="space-y-3">
                {[
                  'Misuse the platform or its features',
                  'Attempt unauthorized access to systems or data',
                  'Distribute malicious content or malware',
                  'Violate any applicable laws or regulations',
                  'Interfere with other users\' access to the platform'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold">Limitation of Liability</h2>
              </div>
              <p className="text-gray-300">
                TradeAI Pro is <span className="text-cyan-400 font-semibold">not responsible</span> for 
                financial losses resulting from trading decisions made by users. The platform provides 
                analytical tools and insights, but all trading decisions and their consequences are 
                the sole responsibility of the user.
              </p>
            </CardContent>
          </Card>

          {/* Account Responsibility */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Key className="h-5 w-5 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold">Account Responsibility</h2>
              </div>
              <p className="text-gray-300">
                Users are responsible for maintaining the security of their accounts. This includes 
                keeping login credentials confidential, enabling two-factor authentication when available, 
                and promptly reporting any unauthorized access or suspicious activity.
              </p>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">Modifications</h2>
              </div>
              <p className="text-gray-300">
                TradeAI Pro may update platform features or policies at any time. Continued use of the 
                platform indicates acceptance of updated terms. We will notify users of significant 
                changes via email or in-app notifications.
              </p>
            </CardContent>
          </Card>

          {/* Agreement Notice */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Users className="h-10 w-10 text-purple-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-3">Agreement</h2>
              <p className="text-gray-300">
                By accessing and using TradeAI Pro, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms of Service.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
