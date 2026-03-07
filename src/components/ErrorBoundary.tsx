'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRefresh = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <Card className="bg-gray-900/50 border-gray-800 max-w-lg w-full">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-gray-400 mb-4">
                An error occurred while loading the application.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleRefresh}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="border-gray-700 text-gray-300"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
