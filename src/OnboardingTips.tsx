import { useEffect, useState } from 'react'

const KEY = 'thumbric-onboard-v1'

const TIPS = [
  {
    id: 'start',
    title: 'Step 1 · Pick a starting point',
    body: 'Create with AI, design from scratch, or improve an existing thumbnail. Your video is optional.',
  },
  {
    id: 'edit',
    title: 'Step 2 · Edit on the live canvas',
    body: 'Drag the title, tweak size in the inspector, and use layers to hide or lock pieces.',
  },
  {
    id: 'preview',
    title: 'Step 3 · Preview small',
    body: 'Tap Mobile or YouTube feed — if it fails at phone size, it fails on YouTube.',
  },
  {
    id: 'export',
    title: 'Step 4 · Export with a quality check',
    body: 'Export runs a quick checklist for size, clipping, and readability before download.',
  },
]

type OnboardingTipsProps = {
  forceShow?: boolean
}

export function OnboardingTips({ forceShow }: OnboardingTipsProps) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (forceShow || !localStorage.getItem(KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [forceShow])

  if (!visible) return null
  const tip = TIPS[step]!
  const last = step >= TIPS.length - 1

  return (
    <aside className="onboard-tips" aria-live="polite">
      <p className="onboard-kicker">Quick start</p>
      <h3>{tip.title}</h3>
      <p>{tip.body}</p>
      <div className="onboard-actions">
        {!last ? (
          <button type="button" className="chip solid" onClick={() => setStep((s) => s + 1)}>
            Next
          </button>
        ) : (
          <button
            type="button"
            className="chip solid"
            onClick={() => {
              try {
                localStorage.setItem(KEY, '1')
              } catch {
                /* ignore */
              }
              setVisible(false)
            }}
          >
            Got it — start creating
          </button>
        )}
        <button
          type="button"
          className="chip ghost"
          onClick={() => {
            try {
              localStorage.setItem(KEY, '1')
            } catch {
              /* ignore */
            }
            setVisible(false)
          }}
        >
          Skip
        </button>
      </div>
    </aside>
  )
}
