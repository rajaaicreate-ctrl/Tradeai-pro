'use client'

import { Card, CardContent } from '@/components/ui/card'
import { 
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Brain,
  Ban
} from 'lucide-react'

export default function RiskDisclaimer() {
  return (
    <Card className="bg-red-500/5 border-red-500/20 mt-8">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
              ⚠️ Risk Disclaimer
            </h3>
            <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
              <p>
                <strong className="text-white">Trading financial markets involves significant risk</strong> and may not be suitable for all investors. 
                Past performance is not indicative of future results.
              </p>
              <p>
                TradeAI Pro provides <span className="text-purple-400">AI-powered analytical tools</span> and market insights for 
                <span className="text-cyan-400"> educational purposes only</span>. The platform does not provide financial advice or investment recommendations.
              </p>
              <p>
                <strong className="text-white">Users are responsible for their own trading decisions.</strong> TradeAI Pro does not guarantee profits or financial outcomes.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-red-500/20">
                {[
                  { icon: TrendingDown, label: 'Market Risk' },
                  { icon: DollarSign, label: 'Capital at Risk' },
                  { icon: Brain, label: 'AI is a Tool' },
                  { icon: Ban, label: 'No Guarantees' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <item.icon className="h-3 w-3 text-red-400" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
