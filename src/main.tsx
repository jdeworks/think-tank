import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// System-based dark mode — sync .dark class on <html> with OS preference
function syncDarkMode() {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', dark)
}
syncDarkMode()
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncDarkMode)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
