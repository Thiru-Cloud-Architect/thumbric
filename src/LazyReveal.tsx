import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type RevealVariant = 'rise' | 'fade-scale' | 'slide-left' | 'slide-right' | 'soft-rise' | 'blur-up'

type LazyRevealProps = {
  children: ReactNode
  className?: string
  /** Stagger delay between nested `.reveal-item` children (ms). */
  staggerMs?: number
  variant?: RevealVariant
  /** Keep children mounted (default true) so CSS can animate them smoothly. */
  once?: boolean
  style?: CSSProperties
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/** Scroll-triggered reveal. Children stay mounted; visibility toggles CSS classes. */
export function LazyReveal({
  children,
  className = '',
  staggerMs = 70,
  variant = 'rise',
  once = true,
  style,
}: LazyRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(reduced)

  useEffect(() => {
    if (reduced) {
      setVisible(true)
      return
    }
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting)
        if (hit) {
          setVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      // Trigger a touch earlier than the fold — matches leading-site soft reveals.
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [once, reduced])

  return (
    <div
      ref={ref}
      className={`lazy-reveal variant-${variant} ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ ['--reveal-stagger' as string]: `${staggerMs}ms`, ...style }}
    >
      {children}
    </div>
  )
}

/** Nested item inside LazyReveal — picks up stagger via sibling index CSS. */
export function RevealItem({
  children,
  className = '',
  index = 0,
}: {
  children: ReactNode
  className?: string
  index?: number
}) {
  return (
    <div
      className={`reveal-item ${className}`.trim()}
      style={{ ['--reveal-i' as string]: index }}
    >
      {children}
    </div>
  )
}

function parseCountValue(value: string) {
  const match = value.match(/^([^0-9]*)([0-9]+)(.*)$/)
  if (!match) return null
  return { prefix: match[1], target: Number(match[2]), suffix: match[3] }
}

/** Count-up once when scrolled into view, then stay on the final value. */
export function CountUpValue({
  value,
  className = '',
  durationMs = 1100,
}: {
  value: string
  className?: string
  durationMs?: number
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduced = usePrefersReducedMotion()
  const parsed = parseCountValue(value)
  const prefix = parsed?.prefix ?? ''
  const target = parsed?.target ?? 0
  const suffix = parsed?.suffix ?? ''
  const canCount = Boolean(parsed)
  const [display, setDisplay] = useState(
    reduced || !canCount ? value : `${prefix}0${suffix}`,
  )
  const doneRef = useRef(false)

  useEffect(() => {
    doneRef.current = false
    if (reduced || !canCount) {
      setDisplay(value)
      return
    }

    setDisplay(`${prefix}0${suffix}`)
    const node = ref.current
    if (!node) return

    let raf = 0

    const run = () => {
      if (doneRef.current) return
      doneRef.current = true
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs)
        const eased = 1 - Math.pow(1 - t, 3)
        const current = Math.round(target * eased)
        setDisplay(`${prefix}${current}${suffix}`)
        if (t < 1) {
          raf = requestAnimationFrame(tick)
        } else {
          setDisplay(value)
        }
      }
      raf = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run()
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [canCount, durationMs, prefix, reduced, suffix, target, value])

  return (
    <p ref={ref} className={className} aria-label={value}>
      {display}
    </p>
  )
}
