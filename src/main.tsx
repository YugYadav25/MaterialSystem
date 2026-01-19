import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.tsx'

// Set the base URL for API requests
// In development, this uses the proxy (empty string) to hit local server.
// In production, this uses the environment variable.
axios.defaults.baseURL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
