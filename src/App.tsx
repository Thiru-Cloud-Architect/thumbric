import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './HomePage'
import PricingPage from './PricingPage'

export default function App() {
  return (
    <BrowserRouter basename="/thumbforge">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
