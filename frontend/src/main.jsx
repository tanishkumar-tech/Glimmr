import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'
import './output.css'
import ErrorBoundary from './ErrorBoundary'

// Configure default axios base URL for the app.
// Keep default empty so absolute paths like '/api/...' continue to hit the Vite proxy.
axios.defaults.baseURL = ''
axios.defaults.timeout = 15_000

// Simple response interceptor to surface friendly errors
axios.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error('API error:', err && err.response ? err.response.status : err.message || err)
    return Promise.reject(err)
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
