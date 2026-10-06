import { useEffect, useRef, useState, type ReactNode } from 'react'

type LazyRevealProps = {
  children: ReactNode
  className?: string
  minHeight?: string
}

export function LazyReveal({ children, className = '', minHeight = '10rem' }: LazyRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '12% 0px 10% 0px', threshold: 0.02 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`lazy-reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={!visible ? { minHeight } : undefined}
    >
      {visible ? children : null}
    </div>
  )
}
