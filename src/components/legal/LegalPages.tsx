'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Shield,
  FileText,
  Lock,
  Mail,
  AlertTriangle,
  ChevronRight
} from 'lucide-react'

interface LegalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function LegalModal({ open, onOpenChange, title, icon, children }: LegalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl text-white">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="prose prose-invert prose-sm max-w-none">
            {children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

// Privacy Policy Content
function PrivacyPolicyContent() {
  return (
    <div className="space-y-6 text-gray-300">
      <p className="text-gray-400 text-sm">Last Updated: 2025</p>
      
      <p className="text-base leading-relaxed">
        TradeAI Pro respects your privacy and is committed to protecting your personal information. 
        This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
      </p>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-purple-400" />
          Information We Collect
        </h3>
        <p className="mb-3">We may collect the following information when you use our platform:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Email address</li>
          <li>Account preferences</li>
          <li>Usage analytics</li>
          <li>Device and browser information</li>
          <li>Payment information (processed securely by third-party providers)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-purple-400" />
          How We Use Your Information
        </h3>
        <p className="mb-3">Your information is used to:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Provide AI market analysis and insights</li>
          <li>Improve platform performance and user experience</li>
          <li>Personalize user experience based on preferences</li>
          <li>Provide customer support and respond to inquiries</li>
          <li>Send important notifications about your account</li>
          <li>Process payments and manage subscriptions</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-purple-400" />
          Cookies and Tracking
        </h3>
        <p className="leading-relaxed">
          TradeAI Pro may use cookies and similar tracking technologies to enhance website functionality, 
          improve user experience, and analyze platform usage. You can control cookie preferences through 
          your browser settings. However, disabling cookies may affect certain features of the platform.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-purple-400" />
          Third-Party Services
        </h3>
        <p className="mb-3">We may use third-party tools and services for:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Analytics and performance monitoring</li>
          <li>Payment processing (Stripe, Razorpay)</li>
          <li>Cloud infrastructure and hosting</li>
          <li>Email delivery and notifications</li>
          <li>AI and machine learning services</li>
        </ul>
        <p className="mt-3 text-sm text-gray-400">
          These third parties have their own privacy policies and we encourage you to review them.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-purple-400" />
          Data Security
        </h3>
        <p className="leading-relaxed">
          We implement industry-standard security measures to protect user information, including encryption, 
          secure servers, and regular security audits. However, no method of transmission over the internet 
          is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-purple-400" />
          Your Rights
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Request access to your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of marketing communications</li>
          <li>Export your data in a portable format</li>
        </ul>
        <p className="mt-3 text-sm">
          To exercise these rights, contact us at{' '}
          <a href="mailto:support@tradeaipro.com" className="text-purple-400 hover:underline">
            support@tradeaipro.com
          </a>
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-purple-400" />
          Contact
        </h3>
        <p>
          If you have questions about this Privacy Policy, contact us at:{' '}
          <a href="mailto:support@tradeaipro.com" className="text-purple-400 hover:underline">
            support@tradeaipro.com
          </a>
        </p>
      </section>
    </div>
  )
}

// Terms of Service Content
function TermsOfServiceContent() {
  return (
    <div className="space-y-6 text-gray-300">
      <p className="text-base leading-relaxed">
        By using TradeAI Pro, you agree to the following terms. Please read these Terms of Service 
        carefully before using our platform.
      </p>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-cyan-400" />
          Platform Purpose
        </h3>
        <p className="leading-relaxed">
          TradeAI Pro provides AI-powered market analysis tools designed to help users analyze 
          financial markets. Our platform offers technical analysis, market insights, and educational 
          content to assist traders in making informed decisions. The platform is intended for 
          informational and educational purposes only.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-cyan-400" />
          No Financial Advice
        </h3>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-3">
          <p className="text-amber-300 font-medium">
            TradeAI Pro does not provide financial or investment advice.
          </p>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>All information and analysis provided by the platform are for educational and informational purposes only</li>
          <li>Users are solely responsible for their own trading decisions</li>
          <li>Past performance does not guarantee future results</li>
          <li>Trading involves substantial risk of loss and is not suitable for all investors</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-cyan-400" />
          Platform Usage
        </h3>
        <p className="mb-3">Users agree NOT to:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Misuse the platform or attempt to exploit vulnerabilities</li>
          <li>Attempt unauthorized access to accounts or systems</li>
          <li>Distribute malicious content or malware</li>
          <li>Reverse engineer or copy the platform's proprietary technology</li>
          <li>Use the platform for any illegal or unauthorized purpose</li>
          <li>Share account credentials with third parties</li>
          <li>Scrape or automated data extraction without permission</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-cyan-400" />
          Subscription and Payments
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Subscriptions are billed on a recurring basis (monthly or annually)</li>
          <li>All payments are processed securely through third-party payment providers</li>
          <li>Refunds are handled on a case-by-case basis</li>
          <li>Prices are subject to change with 30 days notice</li>
          <li>Cancellation will prevent future charges but no prorated refunds</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-cyan-400" />
          Limitation of Liability
        </h3>
        <p className="leading-relaxed">
          TradeAI Pro is not responsible for financial losses resulting from trading decisions made by users. 
          The platform provides analysis tools and information, but all trading decisions are made at the 
          user's own risk. We are not liable for any direct, indirect, incidental, or consequential damages 
          arising from the use of our platform.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-cyan-400" />
          Account Responsibility
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Users are responsible for maintaining the security of their accounts</li>
          <li>Users must provide accurate and complete registration information</li>
          <li>Users must notify us immediately of any unauthorized access</li>
          <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-cyan-400" />
          Modifications
        </h3>
        <p className="leading-relaxed">
          TradeAI Pro may update platform features, pricing, or policies at any time. Continued use of 
          the platform after changes indicates acceptance of updated terms. We will notify users of 
          significant changes via email or platform notifications.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-cyan-400" />
          Intellectual Property
        </h3>
        <p className="leading-relaxed">
          All content, features, and functionality of TradeAI Pro, including but not limited to text, 
          graphics, logos, and software, are the exclusive property of TradeAI Pro and are protected 
          by copyright, trademark, and other intellectual property laws.
        </p>
      </section>
    </div>
  )
}

// Security Policy Content
function SecurityPolicyContent() {
  return (
    <div className="space-y-6 text-gray-300">
      <p className="text-base leading-relaxed">
        TradeAI Pro prioritizes the security of our users and their data. We implement comprehensive 
        security measures to protect your information and ensure platform integrity.
      </p>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-green-400" />
          Data Protection
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>All user information is protected using modern encryption standards (AES-256)</li>
          <li>Data transmission secured via TLS 1.3 encryption</li>
          <li>Sensitive data is encrypted at rest and in transit</li>
          <li>Regular security audits and penetration testing</li>
          <li>Compliance with industry data protection standards</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-green-400" />
          Secure Infrastructure
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Hosted on secure cloud infrastructure (AWS/Vercel)</li>
          <li>Advanced firewall protection and DDoS mitigation</li>
          <li>Regular security patches and updates</li>
          <li>Redundant backup systems for data recovery</li>
          <li>Geographically distributed servers for reliability</li>
          <li>Infrastructure monitoring 24/7</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-green-400" />
          Account Security
        </h3>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-3">
          <p className="text-green-300 font-medium">
            Users are encouraged to follow security best practices:
          </p>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Use strong, unique passwords (minimum 12 characters)</li>
          <li>Enable two-factor authentication (2FA) when available</li>
          <li>Keep login credentials confidential</li>
          <li>Log out after each session on shared devices</li>
          <li>Regularly review account activity</li>
          <li>Report suspicious activity immediately</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-green-400" />
          Payment Security
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>All payment transactions processed through secure third-party gateways (Stripe, Razorpay)</li>
          <li>We do not store complete credit card information on our servers</li>
          <li>PCI DSS compliance through our payment processors</li>
          <li>Fraud detection and prevention systems in place</li>
          <li>Secure invoice and receipt management</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-green-400" />
          Continuous Monitoring
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Real-time monitoring of platform activity</li>
          <li>Automated threat detection systems</li>
          <li>Regular vulnerability assessments</li>
          <li>Incident response team available 24/7</li>
          <li>Security logs maintained for audit purposes</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-green-400" />
          API Security
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>API rate limiting to prevent abuse</li>
          <li>Authentication required for all API endpoints</li>
          <li>Secure token-based authentication</li>
          <li>Regular API security reviews</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-green-400" />
          Security Contact
        </h3>
        <p className="leading-relaxed">
          If you discover a security vulnerability or have security concerns, please contact our 
          security team immediately at:{' '}
          <a href="mailto:security@tradeaipro.com" className="text-green-400 hover:underline">
            security@tradeaipro.com
          </a>
        </p>
        <p className="mt-3 text-sm text-gray-400">
          We appreciate responsible disclosure and will respond to security reports within 24 hours.
        </p>
      </section>
    </div>
  )
}

// Contact Page Content
function ContactPageContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSubmitting(false)
    setSubmitted(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="space-y-6 text-gray-300">
      <p className="text-base leading-relaxed">
        If you need assistance or have feedback about TradeAI Pro, our support team is here to help. 
        We're committed to providing excellent customer service.
      </p>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-blue-400" />
          Contact Information
        </h3>
        <div className="grid gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Support Email</p>
            <a href="mailto:support@tradeaipro.com" className="text-blue-400 hover:underline text-lg">
              support@tradeaipro.com
            </a>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">General Inquiries</p>
            <a href="mailto:info@tradeaipro.com" className="text-blue-400 hover:underline text-lg">
              info@tradeaipro.com
            </a>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Business Partnerships</p>
            <a href="mailto:partnerships@tradeaipro.com" className="text-blue-400 hover:underline text-lg">
              partnerships@tradeaipro.com
            </a>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-blue-400" />
          Contact Form
        </h3>
        
        {submitted ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
            <div className="text-green-400 text-lg font-medium mb-2">Message Sent Successfully!</div>
            <p className="text-gray-400">Our team will respond within 24-48 hours.</p>
            <Button 
              onClick={() => setSubmitted(false)}
              className="mt-4 bg-green-500 hover:bg-green-600"
            >
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                placeholder="What is this about?"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Your message..."
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-blue-400" />
          Response Time
        </h3>
        <p className="leading-relaxed">
          Our team typically responds within 24-48 hours on business days. For urgent matters, 
          please mark your email as urgent in the subject line.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-blue-400" />
          Support Hours
        </h3>
        <p className="leading-relaxed">
          Monday - Friday: 9:00 AM - 6:00 PM IST<br />
          Saturday: 10:00 AM - 4:00 PM IST<br />
          Sunday: Closed
        </p>
      </section>
    </div>
  )
}

// Risk Disclaimer Content
function RiskDisclaimerContent() {
  return (
    <div className="space-y-6 text-gray-300">
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <h3 className="text-xl font-bold text-red-400">Important Risk Warning</h3>
        </div>
        <p className="text-red-300 font-medium">
          Trading financial markets involves significant risk and may not be suitable for all investors.
        </p>
      </div>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-red-400" />
          Educational Purpose Only
        </h3>
        <p className="leading-relaxed">
          TradeAI Pro provides AI-powered analytical tools and market insights for educational purposes only. 
          The platform does not provide financial advice or investment recommendations. All information, 
          analysis, and insights are intended to help users learn about market analysis techniques and 
          develop their own trading knowledge.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-red-400" />
          Your Responsibility
        </h3>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-3">
          <p className="text-amber-300 font-medium">
            Users are solely responsible for their own trading decisions.
          </p>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Never trade with money you cannot afford to lose</li>
          <li>Always conduct your own research before making trading decisions</li>
          <li>Consider your financial situation, risk tolerance, and investment objectives</li>
          <li>Consult with a qualified financial advisor if needed</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-red-400" />
          No Guarantees
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>TradeAI Pro does not guarantee profits or financial outcomes</li>
          <li>Past performance is not indicative of future results</li>
          <li>Market conditions can change rapidly and unexpectedly</li>
          <li>AI predictions are probabilistic and may be incorrect</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-red-400" />
          Market Risks
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li><strong>Volatility Risk:</strong> Markets can experience sudden and extreme price movements</li>
          <li><strong>Liquidity Risk:</strong> You may not be able to enter or exit positions at desired prices</li>
          <li><strong>Leverage Risk:</strong> Using leverage can amplify both gains and losses</li>
          <li><strong>Systemic Risk:</strong> Global events can affect all markets simultaneously</li>
          <li><strong>Technical Risk:</strong> Platform outages or connectivity issues may occur</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-red-400" />
          Specific Market Risks
        </h3>
        <div className="grid gap-4 mt-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-medium mb-2">Cryptocurrency Markets</h4>
            <p className="text-sm text-gray-400">
              Extremely high volatility, regulatory uncertainty, potential for complete loss, 
              24/7 trading with no circuit breakers.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-medium mb-2">Forex Markets</h4>
            <p className="text-sm text-gray-400">
              Currency fluctuations, geopolitical risks, central bank interventions, 
              high leverage commonly available.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-medium mb-2">Stock Markets</h4>
            <p className="text-sm text-gray-400">
              Company-specific risks, sector rotation, market sentiment shifts, 
              earnings volatility, regulatory changes.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-medium mb-2">Commodities</h4>
            <p className="text-sm text-gray-400">
              Supply/demand shocks, weather events, geopolitical tensions, 
              storage and delivery considerations.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-red-400" />
          Risk Management Recommendations
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Never invest more than you can afford to lose</li>
          <li>Use stop-loss orders to limit potential losses</li>
          <li>Diversify your portfolio across different assets</li>
          <li>Start with a demo account to practice</li>
          <li>Keep a trading journal to learn from your decisions</li>
          <li>Follow proper position sizing (typically 1-2% risk per trade)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-red-400" />
          Limitation of Liability
        </h3>
        <p className="leading-relaxed">
          TradeAI Pro, its owners, employees, and affiliates shall not be liable for any direct, 
          indirect, incidental, special, or consequential damages arising from the use of the platform 
          or reliance on any information provided. This includes but is not limited to trading losses, 
          lost profits, or loss of data.
        </p>
      </section>

      <section className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <p className="text-sm text-gray-400">
          By using TradeAI Pro, you acknowledge that you have read, understood, and agree to this 
          Risk Disclaimer. If you do not agree with any part of this disclaimer, please do not use 
          the platform.
        </p>
      </section>
    </div>
  )
}

// Main Footer Component
export default function LegalPages() {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const legalLinks = [
    { id: 'privacy', label: 'Privacy Policy', icon: <Shield className="h-4 w-4" /> },
    { id: 'terms', label: 'Terms of Service', icon: <FileText className="h-4 w-4" /> },
    { id: 'security', label: 'Security Policy', icon: <Lock className="h-4 w-4" /> },
    { id: 'contact', label: 'Contact Us', icon: <Mail className="h-4 w-4" /> },
    { id: 'risk', label: 'Risk Disclaimer', icon: <AlertTriangle className="h-4 w-4" /> },
  ]

  return (
    <>
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo and Copyright */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <p className="text-white font-medium">TradeAI Pro</p>
                <p className="text-gray-500 text-xs">© 2025 All rights reserved</p>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {legalLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveModal(link.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </div>

            {/* Social/External Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Trading involves substantial risk. TradeAI Pro provides educational analysis only and does not provide financial advice.
            </p>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <LegalModal
        open={activeModal === 'privacy'}
        onOpenChange={() => setActiveModal(null)}
        title="Privacy Policy"
        icon={<Shield className="h-5 w-5 text-purple-400" />}
      >
        <PrivacyPolicyContent />
      </LegalModal>

      <LegalModal
        open={activeModal === 'terms'}
        onOpenChange={() => setActiveModal(null)}
        title="Terms of Service"
        icon={<FileText className="h-5 w-5 text-cyan-400" />}
      >
        <TermsOfServiceContent />
      </LegalModal>

      <LegalModal
        open={activeModal === 'security'}
        onOpenChange={() => setActiveModal(null)}
        title="Security Policy"
        icon={<Lock className="h-5 w-5 text-green-400" />}
      >
        <SecurityPolicyContent />
      </LegalModal>

      <LegalModal
        open={activeModal === 'contact'}
        onOpenChange={() => setActiveModal(null)}
        title="Contact Us"
        icon={<Mail className="h-5 w-5 text-blue-400" />}
      >
        <ContactPageContent />
      </LegalModal>

      <LegalModal
        open={activeModal === 'risk'}
        onOpenChange={() => setActiveModal(null)}
        title="Risk Disclaimer"
        icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
      >
        <RiskDisclaimerContent />
      </LegalModal>
    </>
  )
}
