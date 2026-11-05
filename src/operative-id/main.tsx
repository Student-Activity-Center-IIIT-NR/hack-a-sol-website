import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OperativeIDPage } from '../pages/OperativeIDPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OperativeIDPage />
  </StrictMode>,
)