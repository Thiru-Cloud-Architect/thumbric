import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CareerPage from './CareerPage'
import CtrPage from './CtrPage'
import HomePage from './HomePage'
import LearnPage from './LearnPage'
import LegalPage from './LegalPage'
import PricingPage from './PricingPage'
import ResizerPage from './ResizerPage'
import RoastPage from './RoastPage'
import ScorePage from './ScorePage'
import SeoMakerPage from './SeoMakerPage'
import TesterPage from './TesterPage'
import TitleToolPage from './TitleToolPage'
import ToolsHubPage from './ToolsHubPage'
import AccountPage from './AccountPage'
import DashboardPage from './DashboardPage'
import DoctorPage from './DoctorPage'
import FeedbackPage from './FeedbackPage'
import RoadmapPage from './RoadmapPage'
import { captureAttribution, markReturnVisit } from './analytics'
import { ScrollToHash } from './nav'

/** Vite `base` → router basename (no trailing slash; root domain → undefined). */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

function BootAnalytics() {
  useEffect(() => {
    captureAttribution()
    markReturnVisit()
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <BootAnalytics />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/tools" element={<ToolsHubPage />} />
        <Route path="/youtube-thumbnail-score" element={<ScorePage />} />
        <Route path="/youtube-thumbnail-analyzer" element={<ScorePage analyzer />} />
        <Route path="/youtube-thumbnail-tester" element={<TesterPage />} />
        <Route path="/youtube-thumbnail-resizer" element={<ResizerPage />} />
        <Route path="/youtube-ctr-calculator" element={<CtrPage />} />
        <Route path="/youtube-title-analyzer" element={<TitleToolPage />} />
        <Route path="/youtube-thumbnail-maker" element={<SeoMakerPage path="/youtube-thumbnail-maker" />} />
        <Route path="/ai-thumbnail-maker" element={<SeoMakerPage path="/ai-thumbnail-maker" />} />
        <Route path="/gaming-thumbnail-maker" element={<SeoMakerPage path="/gaming-thumbnail-maker" />} />
        <Route path="/podcast-thumbnail-maker" element={<SeoMakerPage path="/podcast-thumbnail-maker" />} />
        <Route path="/faceless-youtube-thumbnail-maker" element={<SeoMakerPage path="/faceless-youtube-thumbnail-maker" />} />
        <Route path="/shorts-thumbnail-maker" element={<SeoMakerPage path="/shorts-thumbnail-maker" />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/roast/:code" element={<RoastPage />} />
        <Route path="/thumbnail-doctor" element={<DoctorPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
