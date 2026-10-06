import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type RevealVariant = 'rise' | 'fade-scale' | 'slide-left' | 'slide-right'

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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
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
