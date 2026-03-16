'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Mail, 
  ArrowLeft, 
  MessageCircle, 
  Briefcase, 
  HelpCircle,
  Send,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react'

interface ContactPageProps {
  onBack: () => void
}

export default function ContactPage({ onBack }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' })
      setSubmitted(false)
    }, 3000)
  }

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
              <Mail className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mt-2">
                We're here to help
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
                If you need assistance or have feedback about TradeAI Pro, our support team is here to help. 
                We typically respond within 24–48 hours.
              </p>
            </CardContent>
          </Card>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">Support</h3>
                <a 
                  href="mailto:support@tradeaipro.com" 
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  support@tradeaipro.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="font-semibold mb-2">General Inquiries</h3>
                <a 
                  href="mailto:info@tradeaipro.com" 
                  className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                >
                  info@tradeaipro.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:border-green-500/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">Business Partnerships</h3>
                <a 
                  href="mailto:partnerships@tradeaipro.com" 
                  className="text-green-400 hover:text-green-300 text-sm transition-colors"
                >
                  partnerships@tradeaipro.com
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Send className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold">Send us a Message</h2>
              </div>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-400 mb-2">Message Sent!</h3>
                  <p className="text-gray-400">We'll get back to you within 24-48 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="bg-gray-800/50 border-gray-700 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="bg-gray-800/50 border-gray-700 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      className="bg-gray-800/50 border-gray-700 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your question or feedback..."
                      rows={5}
                      className="bg-gray-800/50 border-gray-700 focus:border-purple-500 resize-none"
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Response Time */}
          <div className="flex items-center justify-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span>Response within 24-48 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span>Global Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
