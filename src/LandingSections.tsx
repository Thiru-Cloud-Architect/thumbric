import { type MouseEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { NavHashLink, goToHash } from './nav'
import { PRODUCT_NAME, PRODUCT_NAME_FULL, PRODUCT_TAGLINE, SITE_URL, UI_BUILD } from './brand'
import { CREATOR_CLEAN_DOWNLOADS_PER_MONTH, TRIAL_DAYS } from './entitlement'
import { planPriceLabel } from './plans'
import { FEATURES, AI_FEATURE } from './features'
import { HERO_THUMBS, type HeroThumb } from './heroThumbs'
import { CountUpValue, RevealItem } from './LazyReveal'

function onEditorHashClick(event: MouseEvent<HTMLAnchorElement>, hash: string) {
  event.preventDefault()
  goToHash(hash)
}

const FAQ_ITEMS = [
  {
    q: 'Will a better thumbnail actually help my videos?',
    a: 'Strong titles and contrast help people stop scrolling. Thumbric.ai gives you platform-sized layouts, bold type, and moods tuned for YouTube-style clicks — you bring the title and photo.',
  },
  {
    q: 'What if I am bad at design?',
    a: 'Pick a platform, tap Quick idea or a starter template, type your title, and export. No layers panel, no subscription required for preview saves.',
  },
  {
    q: 'How does the AI thumbnail work?',
    a: 'Tap “Try AI Thumbnail creator” in the hero. Describe the visual scene, pick a style, and generate up to 3 looks. Pick a favorite, then finish the title on the live canvas. It does not paste a YouTube URL or analyze your video file.',
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
    a: 'No signup for unlimited preview downloads. Header Sign in only remembers your name and email on this device — it is not a server account yet. Start the 7-day trial when you want clean PNGs without the on-photo mark.',
  },
  {
    q: 'Can I use my face in the thumbnail?',
    a: 'Yes — upload your JPG or PNG, or generate a free AI scene image. Your upload stays in the browser until you download the finished PNG.',
  },
]

type HeroFlashyProps = {
  onStartTrial: () => void
}

function HeroThumbTile({ thumb, eager }: { thumb: HeroThumb; eager?: boolean }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div
      className={loaded ? 'hero-thumb-tile is-loaded' : 'hero-thumb-tile'}
      style={{ ['--tile-hue' as string]: thumb.hue }}
    >
      <img
        className="hero-thumb-photo"
        src={thumb.image}
        alt=""
        width={640}
        height={360}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
      />
      <span className="hero-thumb-tag">{thumb.tag}</span>
      <span className="hero-thumb-title">{thumb.headline}</span>
    </div>
  )
}

function ThumbStrip({
  reverse,
  offset = 0,
  stripIndex = 0,
}: {
  reverse?: boolean
  offset?: number
  stripIndex?: number
}) {
  const ordered = [...HERO_THUMBS.slice(offset), ...HERO_THUMBS.slice(0, offset)]
  const tiles = [...ordered, ...ordered]
  return (
    <div className={reverse ? 'mosaic-strip reverse' : 'mosaic-strip'}>
      {tiles.map((thumb, index) => (
        <HeroThumbTile
          key={`${thumb.id}-${index}`}
          thumb={thumb}
          eager={stripIndex === 0 && index < 4}
        />
      ))}
    </div>
  )
}

export function HeroFlashy({ onStartTrial }: HeroFlashyProps) {
  return (
    <section className="hero-flashy" aria-labelledby="hero-title">
      <div className="hero-mosaic-wrap" aria-hidden>
        <ThumbStrip offset={0} stripIndex={0} />
        <ThumbStrip reverse offset={3} stripIndex={1} />
        <ThumbStrip offset={5} stripIndex={2} />
      </div>
      <div className="hero-scrim" aria-hidden />
      <div className="hero-aura hero-aura-a" aria-hidden />
      <div className="hero-aura hero-aura-b" aria-hidden />
      <div className="hero-inner">
        <p className="hero-badge">
          <span className="hero-badge-pulse" aria-hidden />
          Free in browser · Photo stays on your device
        </p>
        <h1 id="hero-title">
          YouTube thumbnails that <span className="gradient-text gradient-text-motion">get the click.</span>
        </h1>
        <p className="hero-sub">
          {PRODUCT_TAGLINE}. Type your title, pick a mood, watch the live preview update, and download
          a PNG sized for YouTube, Shorts, Reels, or LinkedIn — in minutes, not hours.
        </p>
        <div className="hero-cta-row">
          <a
            className="btn-gradient hero-cta hero-cta-ai btn-pulse"
            href="#editor-ai"
            onClick={(event) => onEditorHashClick(event, 'editor-ai')}
          >
            <span className="nav-ai-spark" aria-hidden>
              ✦
            </span>
            Try AI Thumbnail creator
            <span aria-hidden> →</span>
          </a>
          <a
            className="btn-outline hero-cta-secondary"
            href="#editor"
            onClick={(event) => onEditorHashClick(event, 'editor')}
          >
            Open photo editor
          </a>
          <button type="button" className="btn-outline hero-cta-tertiary hero-cta-trial" onClick={onStartTrial}>
            Start 7-day trial
          </button>
        </div>
        <p className="hero-fine">
          Free AI backdrop · unlimited preview saves · {TRIAL_DAYS}-day clean-export trial
        </p>
      </div>
    </section>
  )
}

export function StatsStrip() {
  const stats = [
    { value: '$0', label: 'Preview saves', sub: 'No signup required', count: false },
    { value: '6', label: 'Platforms', sub: 'YouTube to LinkedIn', count: true },
    { value: '40+', label: 'Fonts', sub: 'Real previews in picker', count: true },
    { value: '<3 min', label: 'Typical flow', sub: 'Title to download', count: false },
  ]
  return (
    <section className="stats-strip" aria-label="Highlights">
      <div className="stats-grid">
        {stats.map((item, index) => (
          <RevealItem key={item.label} index={index} className="stat-cell-wrap">
            <div className="stat-cell">
              {item.count ? (
                <CountUpValue className="stat-value" value={item.value} />
              ) : (
                <p className="stat-value">{item.value}</p>
              )}
              <p className="stat-label">{item.label}</p>
              <p className="stat-sub">{item.sub}</p>
            </div>
          </RevealItem>
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
      <RevealItem index={0}>
        <p className="section-eyebrow">The problem</p>
        <h2 id="problem-title" className="section-title">
          Stop losing views to weak <span className="gradient-text">thumbnails</span>
        </h2>
      </RevealItem>
      <div className="problem-grid">
        {cards.map((card, index) => (
          <RevealItem key={card.title} index={index + 1}>
            <article className={`problem-card tone-${card.tone}`}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <span className="card-shine" aria-hidden />
            </article>
          </RevealItem>
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
      title: 'AI scene or your photo',
      body: 'Generate a free AI backdrop, upload a still, or start from a template. Drag the title on the live canvas.',
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
      <RevealItem index={0}>
        <p className="section-eyebrow">How it works</p>
        <h2 id="how-title" className="section-title center">
          Title in. <span className="gradient-text">Thumbnail out.</span>
        </h2>
      </RevealItem>
      <div className="how-steps">
        <ol className="how-connector" aria-hidden>
          <li />
          <li />
          <li />
          <li />
        </ol>
        {steps.map((step, index) => (
          <RevealItem key={step.n} index={index + 1}>
            <article className={`how-card tone-${step.tone}`}>
              <span className="how-num" aria-hidden="true">
                {step.n}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          </RevealItem>
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
    {
      text: 'Stickers + drag text feel like a mini studio. I ship Shorts covers while the video renders.',
      name: 'Sam R.',
      role: 'Lifestyle Shorts',
    },
    {
      text: 'The live canvas saved me from exporting ten times. Title size just feels right on phone.',
      name: 'Neha P.',
      role: 'Education channel',
    },
    {
      text: 'Honest free previews. I only pay when a draft is ready for the upload.',
      name: 'Chris L.',
      role: 'Gaming creator',
    },
  ]
  const columnA = quotes.slice(0, 3)
  const columnB = quotes.slice(3)
  return (
    <section className="testimonials" aria-labelledby="social-title">
      <RevealItem index={0}>
        <h2 id="social-title" className="section-title center">
          Built for creators who publish often
        </h2>
        <p className="section-lede center">
          Fast browser workflow — free preview saves, optional clean exports, and free AI scene images from a short description.
        </p>
      </RevealItem>
      <div className="testimonial-marquee" aria-label="Creator quotes">
        <div className="testimonial-col">
          <div className="testimonial-track">
            {[...columnA, ...columnA].map((item, index) => (
              <blockquote key={`a-${item.name}-${index}`} className="testimonial-card">
                <p>{item.text}</p>
                <footer>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
        <div className="testimonial-col reverse">
          <div className="testimonial-track">
            {[...columnB, ...columnB].map((item, index) => (
              <blockquote key={`b-${item.name}-${index}`} className="testimonial-card">
                <p>{item.text}</p>
                <footer>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
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
            <a href="https://github.com/Thiru-Cloud-Architect/thumbric" rel="noopener noreferrer">
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
                <div className="faq-answer-wrap" data-state={expanded ? 'open' : 'closed'}>
                  <div className="faq-answer">{item.a}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  const core = FEATURES.filter((item) => item.available)
  return (
    <section
      id="features"
      className="features-section"
      aria-labelledby="features-title"
      data-ui-build={UI_BUILD}
    >
      <RevealItem index={0}>
        <div className="features-head">
          <p className="section-eyebrow">Features</p>
          <h2 id="features-title" className="section-title center">
            AI scene first. <span className="gradient-text gradient-text-motion">Editor tools next.</span>
          </h2>
          <p className="section-lede center">
            Describe a thumbnail idea → get a free AI backdrop → finish the title on the live canvas.
            No YouTube-URL paste and no full video analysis yet.
          </p>
        </div>
      </RevealItem>

      <RevealItem index={1}>
        <div className="feature-ai-panel">
          <div className="feature-ai-panel-copy">
            <p className="feature-ai-kicker">{AI_FEATURE.kicker}</p>
            <p className="feature-where">{AI_FEATURE.where}</p>
            <h3>{AI_FEATURE.title}</h3>
            <p className="feature-ai-lead">{AI_FEATURE.description}</p>
            <div className="feature-ai-split">
              <div className="feature-ai-split-col is-now">
                <p className="feature-ai-split-label">{AI_FEATURE.nowLabel}</p>
                <ul>
                  {AI_FEATURE.nowItems.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="feature-ai-split-col is-later">
                <p className="feature-ai-split-label">{AI_FEATURE.notYetLabel}</p>
                <ul>
                  {AI_FEATURE.notYetItems.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <a
            href={AI_FEATURE.href}
            className="feature-ai-cta btn-pulse"
            onClick={(event) => onEditorHashClick(event, AI_FEATURE.href)}
          >
            {AI_FEATURE.cta} →
          </a>
        </div>
      </RevealItem>

      <div className="features-core">
        <RevealItem index={2}>
          <h3 className="features-core-title">Core editor tools</h3>
          <p className="features-core-lede">
            Everything below is available in the editor today — each card jumps to the right step.
          </p>
        </RevealItem>
        <div className="features-grid">
          {core.map((item, index) => (
            <RevealItem key={item.id} index={index + 3}>
              <a
                href={item.href}
                className="feature-card"
                onClick={(event) => onEditorHashClick(event, item.href)}
              >
                {item.where ? <p className="feature-where">{item.where}</p> : null}
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="feature-card-link">{item.cta ?? 'Open editor'} →</span>
              </a>
            </RevealItem>
          ))}
        </div>
      </div>
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
            Free previews. <span className="gradient-text">{TRIAL_DAYS}-day trial</span> for clean
            exports.
          </h2>
          <p className="section-lede">
            Start a {TRIAL_DAYS}-day Creator trial (demo, no card yet). Then Creator at{' '}
            {planPriceLabel('creator')} ({CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean PNGs/month) or Pro
            unlimited at {planPriceLabel('pro')} — launch pricing, never again this low. INR rates
            on the pricing page.
          </p>
        </div>
        <Link className="btn-gradient pricing-teaser-cta" to="/pricing">
          View plans &amp; start trial
        </Link>
      </div>
    </section>
  )
}

export function SiteFooter({ buildLabel }: { buildLabel?: string }) {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-grid">
          <div className="footer-col footer-col-brand">
            <p className="footer-brand">{PRODUCT_NAME_FULL}</p>
            <p className="footer-tag">Free browser thumbnail maker for YouTube &amp; social.</p>
          </div>
          <div className="footer-nav-group" role="navigation" aria-label="Footer">
            <div className="footer-col">
              <p className="footer-head">Product</p>
              <NavHashLink hash="editor">Open editor</NavHashLink>
              <NavHashLink hash="how">How it works</NavHashLink>
              <NavHashLink hash="features">Feature list</NavHashLink>
              <Link to="/pricing">Plans &amp; pricing</Link>
              <NavHashLink hash="faq">FAQ</NavHashLink>
            </div>
            <div className="footer-col">
              <p className="footer-head">Resources</p>
              <Link to="/career">Careers</Link>
              <a
                href="https://github.com/Thiru-Cloud-Architect/thumbric"
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub repo
              </a>
              <a
                href="https://github.com/Thiru-Cloud-Architect/thumbric/issues"
                rel="noopener noreferrer"
                target="_blank"
              >
                Report an issue
              </a>
              <a href={`${SITE_URL}sitemap.xml`}>Sitemap</a>
            </div>
          </div>
        </div>
        {buildLabel ? <p className="footer-build">{buildLabel}</p> : null}
      </div>
    </footer>
  )
}
