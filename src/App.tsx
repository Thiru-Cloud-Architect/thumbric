import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CareerPage from './CareerPage'
import HomePage from './HomePage'
import PricingPage from './PricingPage'
import { ScrollToHash } from './nav'

export default function App() {
  return (
    <BrowserRouter basename="/thumbforge">
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
