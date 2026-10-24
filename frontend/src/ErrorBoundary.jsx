import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Could send to logging service here
    console.error('Uncaught UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-xl text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-4">The application encountered an unexpected error. Please reload the page.</p>
            <pre className="text-xs text-left bg-gray-100 p-3 rounded overflow-auto">{String(this.state.error && this.state.error.stack || this.state.error)}</pre>
            <div className="mt-6">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">Reload</button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
