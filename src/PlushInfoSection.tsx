import { useEffect, useRef, useState } from 'react'

type InfoBox = {
  id: string
  kicker: string
  title: string
  body: string
  tone: 'violet' | 'pink' | 'cyan' | 'lime'
}

const BOXES: InfoBox[] = [
  {
    id: 'size',
    kicker: 'Export',
    title: 'Correct pixels every time',
    body: 'YouTube 1280×720, Shorts 1080×1920, LinkedIn, Instagram — one tap, no resize math.',
    tone: 'violet',
  },
  {
    id: 'live',
    kicker: 'Live canvas',
    title: 'See changes as you type',
    body: 'Title, font, mood, and stickers update on the preview instantly — nothing uploads until you save.',
    tone: 'pink',
  },
  {
    id: 'drag',
    kicker: 'Layout',
    title: 'Drag like a layout tool',
    body: 'Move the headline block and badges on the canvas. Built for thumbs, not a generic design app.',
    tone: 'cyan',
  },
  {
    id: 'private',
    kicker: 'Privacy',
    title: 'Your photo stays local',
    body: 'Images are processed in your browser. Preview saves are unlimited; clean exports use simple plans.',
    tone: 'lime',
  },
  {
    id: 'speed',
    kicker: 'Workflow',
    title: 'Minutes, not hours',
    body: 'Quick idea shuffles mood + font when you are stuck. Templates give you a pro starting frame.',
    tone: 'violet',
  },
  {
    id: 'roadmap',
    kicker: 'Roadmap',
    title: 'AI assists later — control first',
    body: 'We are polishing the manual editor before optional AI hooks. No fake “paste URL” promises today.',
    tone: 'pink',
  },
]

function PlushInfoCard({ box, index }: { box: InfoBox; index: number }) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '8% 0px', threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <article
      ref={ref}
      className={`plush-info-card tone-${box.tone} ${visible ? 'is-visible' : ''}`}
      style={{ ['--stagger' as string]: index }}
    >
      <p className="plush-info-kicker">{box.kicker}</p>
      <h3>{box.title}</h3>
      <p>{box.body}</p>
      <span className="plush-info-shine" aria-hidden />
    </article>
  )
}

export function PlushInfoSection() {
  return (
    <section className="plush-info-section" aria-labelledby="plush-info-title">
      <div className="section-shell plush-info-head">
        <p className="section-eyebrow">Why creators switch</p>
        <h2 id="plush-info-title" className="section-title center">
          Built for <span className="gradient-text">thumbnails only</span>
        </h2>
        <p className="section-lede center">
          Scroll to reveal what Thumbric.ai does today — honest, browser-first, no filler features.
        </p>
      </div>
      <div className="plush-info-grid section-shell">
        {BOXES.map((box, index) => (
          <PlushInfoCard key={box.id} box={box} index={index} />
        ))}
      </div>
    </section>
  )
}
