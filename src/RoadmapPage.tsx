import { Link } from 'react-router-dom'
import { ToolShell } from './ToolShell'

const PHASES = [
  {
    id: '1',
    title: 'Phase 1 — AI editor first',
    status: 'Shipped',
    items: [
      'Three entry paths · creative brief · editable titles',
      'Pro editor: layers, undo, snap, zoom, safe zone, rotation',
      'Creator kit + categorized templates',
      'Free tools + SEO landings',
    ],
  },
  {
    id: '2',
    title: 'Phase 2 — Thumbnail Doctor',
    status: 'Shipped (heuristic)',
    items: [
      'Inline upload → score → top 3 problems → Fix with Thumbric',
      'Growth funnel without forcing signup to analyze',
      'A/B compare handoff',
    ],
  },
  {
    id: '3',
    title: 'Phase 3 — Creator personalization',
    status: 'Shipped (local)',
    items: [
      'Faces (up to 10), logo, colors, fonts',
      'Preferred layout + style preference + expression',
      '“Create next in my style” from Creator kit',
      'Projects history + action-first dashboard',
    ],
  },
  {
    id: '4',
    title: 'Phase 4 — Optional video intelligence',
    status: 'Privacy stub live',
    items: [
      'Optional “Understand my video” section — never required',
      'Local still-frame pick only (no forced upload)',
      'Full URL/video queue analysis waits for paid infra',
    ],
  },
  {
    id: '5',
    title: 'Phase 5–6 — YouTube loop & A/B learning',
    status: 'Deferred (paid / OAuth)',
    items: ['YouTube OAuth CTR context', 'Live A/B on real videos', 'Audience learning moat'],
  },
  {
    id: 'paid',
    title: 'Paid wow AI + checkout',
    status: 'Deferred by request',
    items: [
      'fal photoreal 3-concept generation',
      'Stripe / Razorpay · ₹299 / ₹799',
      'Cloud history sync',
    ],
  },
]

export default function RoadmapPage() {
  return (
    <ToolShell
      path="/roadmap"
      kicker="Roadmap"
      title={
        <>
          Phases shipped vs <span className="gradient-text">what waits on paid</span>
        </>
      }
      lede="Phase 2 Doctor and Phase 3 personalization are live locally. Premium AI and YouTube OAuth stay parked until you choose paid."
    >
      {PHASES.map((phase) => (
        <article key={phase.id} className="tool-card">
          <p className="roadmap-status">{phase.status}</p>
          <h2>{phase.title}</h2>
          <ul>
            {phase.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      ))}
      <p className="hint">
        <Link to="/thumbnail-doctor">Doctor</Link> · <Link to="/projects">Projects</Link> ·{' '}
        <Link to="/feedback">Feedback</Link>
      </p>
    </ToolShell>
  )
}
