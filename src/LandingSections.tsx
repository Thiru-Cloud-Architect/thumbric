import { type MouseEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { NavHashLink, goToHash } from './nav'
import { PRODUCT_NAME, PRODUCT_NAME_FULL, SITE_URL, UI_BUILD } from './brand'
import { CREATOR_CLEAN_DOWNLOADS_PER_MONTH, TRIAL_DAYS } from './entitlement'
import { planPriceLabel } from './plans'
import { useBillingCurrency } from './useBillingCurrency'
import { FEATURES, AI_FEATURE } from './features'
import { TOOL_NAV } from './toolsCatalog'
import { HERO_THUMBS, type HeroThumb } from './heroThumbs'
import { CountUpValue, RevealItem } from './LazyReveal'

function onEditorHashClick(event: MouseEvent<HTMLAnchorElement>, hash: string) {
  event.preventDefault()
  goToHash(hash)
}

const FAQ_ITEMS = [
  {
    q: 'Will a better thumbnail actually help my videos?',
    a: `Strong titles and contrast help people stop scrolling. ${PRODUCT_NAME} gives you platform-sized layouts, bold type, and moods tuned for YouTube-style clicks — you bring the title and photo.`,
  },
  {
    q: 'What if I am bad at design?',
    a: 'Open the editor, upload a photo or pick a template, type a short title, and download. Or describe the video in AI Thumbnail Maker and finish the title after.',
  },
  {
    q: 'How does the AI thumbnail work?',
    a: 'Open AI Thumbnail Maker. Describe your video or paste a YouTube URL. You get a cover to review, then add your title in the editor. We can read a public YouTube title, but we do not pull video frames yet. Free AI is useful, not photoreal face-swap.',
  },
  {
    q: 'How long does it take?',
    a: 'A first draft is usually a few minutes. The editor updates as you type — the image stays in your browser until you download.',
  },
  {
    q: 'Why not Canva or Photoshop?',
    a: `${PRODUCT_NAME} is only for thumbnails: the right size, a big title you can drag, and a PNG you can upload to YouTube.`,
  },
  {
    q: 'What is Thumbric Score?',
    a: 'A free 0–100 check for attention, mobile readability, and text clarity. It is not a prediction of your real YouTube CTR. Upload a thumb, read the notes, then fix it in AI Maker or the editor.',
  },
  {
    q: 'Do I need an account?',
    a: 'You can try about 8 designs as a guest. Register free to save and to download (5 mild-watermark PNGs a day). Creator and Pro remove the mark.',
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
      <div className="hero-inner">
        <p className="hero-badge hero-badge-quiet">Free YouTube thumbnail maker</p>
        <h1 id="hero-title">
          Thumbnails that earn the click.
        </h1>
        <p className="hero-sub">
          Describe your video, paste a YouTube URL, or open the editor. Simple tools — no design skills needed.
        </p>
        <div className="hero-cta-row">
          <Link className="btn-gradient hero-cta hero-cta-ai" to="/ai-thumbnail-maker">
            Create with AI
          </Link>
          <a
            className="btn-outline hero-cta-secondary"
            href="#editor"
            onClick={(event) => onEditorHashClick(event, 'editor')}
          >
            Open editor
          </a>
        </div>
        <p className="hero-fine">
          Free in browser · photo stays on device ·{' '}
          <button type="button" className="hero-trial-link" onClick={onStartTrial}>
            {TRIAL_DAYS}-day trial
          </button>
        </p>
      </div>
    </section>
  )
}

export function StatsStrip() {
  const stats = [
    { value: 'Free', label: 'To start', sub: 'Register to save & download', count: false },
    { value: '6', label: 'Platforms', sub: 'YouTube to LinkedIn', count: true },
    { value: '5/day', label: 'Free downloads', sub: 'Light corner mark', count: false },
    { value: '<3 min', label: 'Typical flow', sub: 'Photo, title, PNG', count: false },
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

function HowIcon({ name }: { name: 'link' | 'spark' | 'pen' | 'down' }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'white',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (name === 'link') {
    return (
      <svg {...common}>
        <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93" />
        <path d="M14 11a5 5 0 0 0-7.07 0L5.5 12.43a5 5 0 0 0 7.07 7.07L14 18.07" />
      </svg>
    )
  }
  if (name === 'spark') {
    return (
      <svg {...common}>
        <path d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3z" />
      </svg>
    )
  }
  if (name === 'pen') {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M12 4v11" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  )
}

export function HowItWorks() {
  const steps: Array<{
    n: number
    tone: 'violet' | 'pink' | 'blue' | 'green'
    title: string
    body: string
    icon: 'link' | 'spark' | 'pen' | 'down'
  }> = [
    {
      n: 1,
      tone: 'violet',
      icon: 'link',
      title: 'Paste your YouTube URL',
      body: 'Or describe the scene in one line. No video file, and no design tool to learn.',
    },
    {
      n: 2,
      tone: 'pink',
      icon: 'spark',
      title: 'AI generates a cover',
      body: 'You get a YouTube-sized image in seconds. Pick another look if the first one misses.',
    },
    {
      n: 3,
      tone: 'blue',
      icon: 'pen',
      title: 'Add the title',
      body: 'Open the editor, drop your photo if you have one, and set the words that have to be readable on a phone.',
    },
    {
      n: 4,
      tone: 'green',
      icon: 'down',
      title: 'Download and upload',
      body: 'Export a 1280×720 PNG. Free downloads carry a small corner mark. Clean exports are on Creator and Pro.',
    },
  ]
  return (
    <section id="how" className="how-rail" aria-labelledby="how-title">
      <p className="section-eyebrow">How it works</p>
      <h2 id="how-title">
        From a link to a click-worthy
        <br />
        thumbnail
      </h2>
      <ol className="how-rail-steps">
        {steps.map((step) => (
          <li key={step.n}>
            <span className={`how-rail-icon tone-${step.tone}`}>
              <HowIcon name={step.icon} />
              <span className="how-rail-badge">{step.n}</span>
            </span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
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
            Haven&apos;t found what you need? Try the free{' '}
            <Link to="/tools">Tools</Link> or the{' '}
            <Link to="/ai-thumbnail-maker">AI Thumbnail Maker</Link>.
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
            Describe your video or paste a YouTube URL, then finish the title in the editor.
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
          {AI_FEATURE.href.startsWith('/') ? (
            <Link to={AI_FEATURE.href} className="feature-ai-cta btn-pulse">
              {AI_FEATURE.cta} →
            </Link>
          ) : (
            <a
              href={AI_FEATURE.href}
              className="feature-ai-cta btn-pulse"
              onClick={(event) => onEditorHashClick(event, AI_FEATURE.href)}
            >
              {AI_FEATURE.cta} →
            </a>
          )}
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
              {item.href.startsWith('/') ? (
                <Link className="feature-card" to={item.href}>
                  {item.where ? <p className="feature-where">{item.where}</p> : null}
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="feature-card-link">{item.cta ?? 'Open editor'} →</span>
                </Link>
              ) : (
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
              )}
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FreeToolsSection() {
  return (
    <section id="tools" className="features-section tools-strip" aria-labelledby="tools-title">
      <RevealItem index={0}>
        <div className="features-head">
          <p className="section-eyebrow">Free tools</p>
          <h2 id="tools-title" className="section-title center">
            Score it. Test it. Then fix it.
          </h2>
          <p className="section-lede center">
            Free checks for an existing thumbnail. The score is a visual heuristic — not your real YouTube CTR.
          </p>
        </div>
      </RevealItem>
      <div className="features-grid">
        {TOOL_NAV.map((item, index) => (
          <RevealItem key={item.id} index={index + 1}>
            <Link className="feature-card" to={item.path}>
              <p className="feature-where">Free tool</p>
              <h3>{item.label}</h3>
              <p>{item.blurb}</p>
              <span className="feature-card-link">Open {item.label} →</span>
            </Link>
          </RevealItem>
        ))}
      </div>
    </section>
  )
}

export function PricingTeaser() {
  const { currency } = useBillingCurrency()
  return (
    <section className="pricing-teaser" aria-labelledby="pricing-teaser-title">
      <div className="pricing-teaser-inner">
        <div>
          <p className="section-eyebrow">Pricing</p>
          <h2 id="pricing-teaser-title" className="section-title">
            Free · Creator · <span className="gradient-text">Pro</span>
          </h2>
          <p className="section-lede">
            Watermarked previews stay free. Creator at {planPriceLabel('creator', currency)} (
            {CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean PNGs/month) or Pro unlimited at{' '}
            {planPriceLabel('pro', currency)} — includes a {TRIAL_DAYS}-day demo trial.
          </p>
        </div>
        <Link className="btn-gradient pricing-teaser-cta" to="/pricing">
          View plans
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
            <p className="footer-head footer-brand">{PRODUCT_NAME_FULL}</p>
            <p className="footer-tag">Free browser thumbnail maker for YouTube &amp; social.</p>
          </div>
          <div className="footer-nav-group" role="navigation" aria-label="Footer">
            <div className="footer-col">
              <p className="footer-head">Create</p>
              <NavHashLink hash="editor">Thumbnail editor</NavHashLink>
              <Link to="/ai-thumbnail-maker">AI Thumbnail Maker</Link>
              <NavHashLink hash="how">How it works</NavHashLink>
              <Link to="/pricing">Plans &amp; pricing</Link>
              <NavHashLink hash="faq">FAQ</NavHashLink>
            </div>
            <div className="footer-col">
              <p className="footer-head">Free tools</p>
              <Link to="/youtube-thumbnail-score">Thumbnail Score</Link>
              <Link to="/youtube-thumbnail-tester">A/B Tester</Link>
              <Link to="/youtube-thumbnail-resizer">Resizer</Link>
              <Link to="/youtube-ctr-calculator">CTR Calculator</Link>
              <Link to="/youtube-title-analyzer">Title Analyzer</Link>
              <Link to="/thumbnail-doctor">Thumbnail Doctor</Link>
            </div>
            <div className="footer-col">
              <p className="footer-head">Resources</p>
              <Link to="/learn">Lessons</Link>
              <Link to="/projects">Projects</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/account">Account</Link>
              <Link to="/feedback">Feedback</Link>
              <Link to="/roadmap">Roadmap</Link>
              <Link to="/legal">Privacy &amp; terms</Link>
              <Link to="/career">Careers</Link>
              <a href={`${SITE_URL}sitemap.xml`}>Sitemap</a>
            </div>
          </div>
        </div>
        {buildLabel ? <p className="footer-build">{buildLabel}</p> : null}
      </div>
    </footer>
  )
}
