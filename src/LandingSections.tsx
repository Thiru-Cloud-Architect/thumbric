import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_NAME, PRODUCT_TAGLINE } from './brand'
import { CREATOR_CLEAN_DOWNLOADS_PER_MONTH } from './entitlement'
import { FEATURES } from './features'
import { HERO_THUMBS, type HeroThumb } from './heroThumbs'

const FAQ_ITEMS = [
  {
    q: 'Will a better thumbnail actually help my videos?',
    a: 'Strong titles and contrast help people stop scrolling. ThumbnailPulse gives you platform-sized layouts, bold type, and moods tuned for YouTube-style clicks — you bring the title and photo.',
  },
  {
    q: 'What if I am bad at design?',
    a: 'Pick a platform, tap Quick idea or a starter template, type your title, and export. No layers panel, no subscription required for preview saves.',
  },
  {
    q: 'How long does it take?',
    a: 'Most people get a usable thumbnail in a few minutes. The live preview updates as you type — no waiting on a server.',
  },
  {
    q: 'Why not Canva or Photoshop?',
    a: `${PRODUCT_NAME} is built only for social thumbnails: correct dimensions, drag text on canvas, title styles, stickers, one-click PNG download.`,
  },
  {
    q: 'Do I need an account?',
    a: 'No signup for unlimited preview downloads. Register with email, then pick Creator or Pro when you need clean PNGs without the on-photo mark.',
  },
  {
    q: 'Can I use my face in the thumbnail?',
    a: 'Yes — upload your JPG or PNG. The image stays in your browser until you download the finished PNG.',
  },
]

type LandingProps = {
  onQuickIdea: () => void
}

function HeroThumbTile({ thumb }: { thumb: HeroThumb }) {
  return (
    <div
      className="hero-thumb-tile"
      style={{
        backgroundImage: `url(${thumb.image})`,
        ['--tile-hue' as string]: thumb.hue,
      }}
    >
      <span className="hero-thumb-tag">{thumb.tag}</span>
      <span className="hero-thumb-title">{thumb.headline}</span>
    </div>
  )
}

function ThumbStrip({ reverse, offset = 0 }: { reverse?: boolean; offset?: number }) {
  const ordered = [...HERO_THUMBS.slice(offset), ...HERO_THUMBS.slice(0, offset)]
  const tiles = [...ordered, ...ordered]
  return (
    <div className={reverse ? 'mosaic-strip reverse' : 'mosaic-strip'}>
      {tiles.map((thumb, index) => (
        <HeroThumbTile key={`${thumb.id}-${index}`} thumb={thumb} />
      ))}
    </div>
  )
}

export function FeaturesMenu() {
  const [open, setOpen] = useState(false)
  const live = FEATURES.filter((item) => item.available)
  return (
    <div
      className="nav-dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="nav-dropdown-trigger"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Features
      </button>
      {open ? (
        <div className="nav-dropdown-panel" role="menu">
          {live.map((item) => (
            <a key={item.id} href={item.href} className="nav-dropdown-item" role="menuitem">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </a>
          ))}
          <a href="#features" className="nav-dropdown-item nav-dropdown-more" role="menuitem">
            <strong>View all features</strong>
            <span>What you can use today in the editor</span>
          </a>
        </div>
      ) : null}
    </div>
  )
}

export function HeroFlashy({ onQuickIdea }: LandingProps) {
  return (
    <section className="hero-flashy" aria-labelledby="hero-title">
      <div className="hero-mosaic-wrap" aria-hidden>
        <ThumbStrip offset={0} />
        <ThumbStrip reverse offset={3} />
        <ThumbStrip offset={5} />
      </div>
      <div className="hero-scrim" aria-hidden />
      <div className="hero-inner">
        <p className="hero-badge">Free in browser · No AI required</p>
        <h1 id="hero-title">
          YouTube thumbnails that <span className="gradient-text">get the click.</span>
        </h1>
        <p className="hero-sub">
          {PRODUCT_TAGLINE}. Type your title, pick a mood, watch the live preview update, and download
          a PNG sized for YouTube, Shorts, Reels, or LinkedIn — in minutes, not hours.
        </p>
        <div className="hero-cta-row">
          <a className="btn-gradient hero-cta" href="#editor">
            Start creating free
            <span aria-hidden> →</span>
          </a>
          <button type="button" className="btn-outline" onClick={onQuickIdea}>
            Shuffle Quick idea
          </button>
        </div>
        <p className="hero-fine">Unlimited preview saves · Photo stays on your device</p>
      </div>
    </section>
  )
}

export function StatsStrip() {
  const stats = [
    { value: '$0', label: 'Preview saves', sub: 'No signup required' },
    { value: '6', label: 'Platforms', sub: 'YouTube to LinkedIn' },
    { value: '40+', label: 'Fonts', sub: 'Real previews in picker' },
    { value: '<3 min', label: 'Typical flow', sub: 'Title to download' },
  ]
  return (
    <section className="stats-strip" aria-label="Highlights">
      <div className="stats-grid">
        {stats.map((item) => (
          <div key={item.label} className="stat-cell">
            <p className="stat-value">{item.value}</p>
            <p className="stat-label">{item.label}</p>
            <p className="stat-sub">{item.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ProblemSection() {
  const cards = [
    {
      tone: 'rose',
      title: 'Low CTR = views left on the table',
      body: 'If the title is hard to read on a phone, viewers scroll past — no matter how good the video is.',
    },
    {
      tone: 'amber',
      title: 'Hours lost in generic design tools',
      body: 'Resizing canvases and hunting templates slows every upload. You need the right size, fast.',
    },
    {
      tone: 'sky',
      title: 'Weak type fades into the feed',
      body: 'Bold outline, contrast, and placement matter. Guessing font size on a tiny preview hurts clicks.',
    },
  ]
  return (
    <section className="problem-section" aria-labelledby="problem-title">
      <p className="section-eyebrow">The problem</p>
      <h2 id="problem-title" className="section-title">
        Stop losing views to weak <span className="gradient-text">thumbnails</span>
      </h2>
      <div className="problem-grid">
        {cards.map((card) => (
          <article key={card.title} className={`problem-card tone-${card.tone}`}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function HowItWorks() {
  const steps = [
    {
      n: 1,
      tone: 'violet',
      title: 'Pick platform & mood',
      body: 'YouTube, Shorts, Instagram, LinkedIn — correct aspect ratio and color vibe in one tap.',
    },
    {
      n: 2,
      tone: 'pink',
      title: 'Title, font & size',
      body: 'Type your hook, choose a display font, set title size in pixels, and pick a title style.',
    },
    {
      n: 3,
      tone: 'blue',
      title: 'Photo & drag to fit',
      body: 'Add your face or product shot. Drag the title block and stickers on the live canvas.',
    },
    {
      n: 4,
      tone: 'green',
      title: 'Download PNG',
      body: 'Export a platform-sized file ready for YouTube Studio or your social app.',
    },
  ]
  return (
    <section id="how" className="how-section" aria-labelledby="how-title">
      <p className="section-eyebrow">How it works</p>
      <h2 id="how-title" className="section-title center">
        Title in. <span className="gradient-text">Thumbnail out.</span>
      </h2>
      <div className="how-steps">
        {steps.map((step) => (
          <article key={step.n} className={`how-card tone-${step.tone}`}>
            <span className="how-num">{step.n}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function Testimonials() {
  const quotes = [
    {
      text: 'I stopped fighting Canva sizes. Pick YouTube, type the title, bump font size, download — done before my coffee cools.',
      name: 'Arjun K.',
      role: 'Tech YouTube · 12K subs',
    },
    {
      text: 'Quick idea gives me a starting mood when I am stuck. The preview on my phone finally matches what uploads.',
      name: 'Priya M.',
      role: 'Finance Shorts creator',
    },
    {
      text: 'Free preview saves let me share drafts in our group chat before I pay for a clean export.',
      name: 'Dev team lead',
      role: 'Engineering channel',
    },
  ]
  return (
    <section className="testimonials" aria-labelledby="social-title">
      <h2 id="social-title" className="section-title center">
        Built for creators who publish often
      </h2>
      <p className="section-lede center">Real workflow — honest free tier, no fake AI promises.</p>
      <div className="testimonial-grid">
        {quotes.map((item) => (
          <blockquote key={item.name} className="testimonial-card">
            <p>{item.text}</p>
            <footer>
              <strong>{item.name}</strong>
              <span>{item.role}</span>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="faq-flashy" aria-labelledby="faq-title">
      <div className="section-shell faq-layout">
        <div className="faq-intro">
          <h2 id="faq-title">Frequently asked questions</h2>
          <p>
            Haven&apos;t found what you need? Open the{' '}
            <a href="https://github.com/Thiru-Cloud-Architect/thumbforge" rel="noopener noreferrer">
              GitHub repo
            </a>{' '}
            and leave feedback.
          </p>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const expanded = open === index
            return (
              <div key={item.q} className={expanded ? 'faq-item is-open' : 'faq-item'}>
                <button
                  type="button"
                  className="faq-trigger"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  {item.q}
                  <span className="faq-chevron" aria-hidden />
                </button>
                {expanded ? <div className="faq-answer">{item.a}</div> : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  return (
    <section id="features" className="features-section" aria-labelledby="features-title">
      <p className="section-eyebrow">Features</p>
      <h2 id="features-title" className="section-title center">
        Built for creators, <span className="gradient-text">not designers</span>
      </h2>
      <p className="section-lede center">
        Everything below works in your browser today. No fake “AI from URL” — just fast control.
      </p>
      <div className="features-grid">
        {FEATURES.filter((item) => item.available).map((item) => (
          <a key={item.id} href={item.href} className="feature-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </a>
        ))}
      </div>
      <p id="roadmap" className="features-roadmap">
        <strong>On the roadmap:</strong> paste a YouTube link and get AI-assisted layouts — after we nail
        the manual editor you see here.
      </p>
    </section>
  )
}

export function PricingTeaser() {
  return (
    <section className="pricing-teaser" aria-labelledby="pricing-teaser-title">
      <div className="pricing-teaser-inner">
        <div>
          <p className="section-eyebrow">Pricing</p>
          <h2 id="pricing-teaser-title" className="section-title">
            Free previews. <span className="gradient-text">Clean exports</span> when you&apos;re ready.
          </h2>
          <p className="section-lede">
            Creator from $1/mo ({CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean PNGs/month). Pro unlimited from
            $9/mo — switch to INR on the pricing page for local rates.
          </p>
        </div>
        <Link className="btn-gradient pricing-teaser-cta" to="/pricing">
          View plans &amp; subscribe
        </Link>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-grid">
          <div>
            <p className="footer-brand">{PRODUCT_NAME}</p>
            <p className="footer-tag">Free browser thumbnail maker for YouTube &amp; social.</p>
          </div>
          <div>
            <p className="footer-head">Product</p>
            <Link to="/#editor">Editor</Link>
            <Link to="/#how">How it works</Link>
            <Link to="/#features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/#faq">FAQ</Link>
          </div>
          <div>
            <p className="footer-head">Resources</p>
            <a href="https://github.com/Thiru-Cloud-Architect/thumbforge" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://thiru-cloud-architect.github.io/thumbforge/sitemap.xml">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
