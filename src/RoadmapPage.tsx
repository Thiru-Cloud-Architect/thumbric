import { Link } from 'react-router-dom'
import { ToolShell } from './ToolShell'

const PHASES = [
  {
    id: '1',
    title: 'Phase 1 — AI editor first',
    status: 'Shipped (free tier)',
    items: [
      'Three entry paths · creative brief · editable titles',
      'Pro editor slice: undo, zoom, safe zone, mobile + YouTube feed sim',
      'Layers, brand kit, snap guides, photo treatments',
      'Free tools + SEO landings + Thumbnail Doctor funnel',
    ],
  },
  {
    id: '2',
    title: 'Phase 2 — Paid wow AI',
    status: 'Next (requires fal + checkout)',
    items: [
      'Three independent photoreal generations per concept',
      'Stripe / Razorpay · ₹299 Creator · ₹799 Pro',
      'Cloud history sync via Worker',
    ],
  },
  {
    id: '3',
    title: 'Phase 3 — YouTube loop',
    status: 'Planned',
    items: ['YouTube OAuth', 'Channel CTR context', 'Live A/B on real videos'],
  },
  {
    id: '4',
    title: 'Phase 4+ — Video intelligence',
    status: 'Research',
    items: ['Video-aware packaging', 'Agency seats', 'Public API'],
  },
]

export default function RoadmapPage() {
  return (
    <ToolShell
      path="/roadmap"
      kicker="Roadmap"
      title={
        <>
          What shipped vs <span className="gradient-text">what is next</span>
        </>
      }
      lede="Everything in Phase 1 except premium AI thumbnail generation is in the app today. Paid keys unlock the wow factor."
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
        <Link to="/pricing">Pricing</Link> · <Link to="/dashboard">Dashboard</Link> ·{' '}
        <Link to="/feedback">Send feedback</Link>
      </p>
    </ToolShell>
  )
}
