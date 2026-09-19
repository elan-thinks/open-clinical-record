import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'

// Apply saved theme before first paint to avoid a flash of the wrong palette
try {
  const saved = localStorage.getItem('ocr-theme')
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  }
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
