import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Website } from './website/Website.tsx'
import './website/website.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Website />
  </StrictMode>,
)
