import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CareerPage from './CareerPage'
import HomePage from './HomePage'
import PricingPage from './PricingPage'
import { ScrollToHash } from './nav'

/** Vite `base` → router basename (no trailing slash; root domain → undefined). */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
