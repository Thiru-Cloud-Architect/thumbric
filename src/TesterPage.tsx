import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ToolShell } from './ToolShell'
import { analyzeThumbnailImage, type ThumbnailScore } from './score'
import { loadImageFromUrl, saveAiHandoff } from './aiHandoff'
import { hintFromScore } from './score'
import { track } from './analytics'

type Slot = { url: string; score: ThumbnailScore | null }

export default function TesterPage() {
  const aRef = useRef<HTMLInputElement>(null)
  const bRef = useRef<HTMLInputElement>(null)
  const [a, setA] = useState<Slot>({ url: '', score: null })
  const [b, setB] = useState<Slot>({ url: '', score: null })
  const [error, setError] = useState('')

  async function loadSlot(file: File | undefined, which: 'a' | 'b') {
    if (!file || !file.type.startsWith('image/')) {
      setError('Choose JPG or PNG files.')
      return
    }
    setError('')
    const url = URL.createObjectURL(file)
    const image = await loadImageFromUrl(url)
    const score = analyzeThumbnailImage(image)
    const next = { url, score }
    if (which === 'a') setA(next)
    else setB(next)
    track('thumbnail_uploaded', { tool: 'tester', slot: which })
  }

  const winner =
    a.score && b.score ? (a.score.total === b.score.total ? 'tie' : a.score.total > b.score.total ? 'a' : 'b') : null

  function onGenerate() {
    const best = winner === 'b' ? b.score : a.score
    if (!best) return
    saveAiHandoff({ hint: hintFromScore(best), styleId: 'auto', source: 'tester' })
    track('ab_test_created', { tool: 'tester', winner: winner ?? 'none' })
  }

  return (
    <ToolShell
      path="/youtube-thumbnail-tester"
      kicker="A/B tester"
      title={
        <>
          Which thumbnail would you <span className="gradient-text">click?</span>
        </>
      }
      lede="Drop two versions. We show phone-size previews and a heuristic pick. This is not a live CTR test against your audience."
    >
      <section className="tool-card">
        <div className="ab-grid">
          {(['a', 'b'] as const).map((slot) => {
            const data = slot === 'a' ? a : b
            const ref = slot === 'a' ? aRef : bRef
            return (
              <div key={slot} className={winner === slot ? 'ab-col is-win' : 'ab-col'}>
                <p className="ab-label">{slot === 'a' ? 'Look A' : 'Look B'}</p>
                <button type="button" className="tool-drop" onClick={() => ref.current?.click()}>
                  {data.url ? <img src={data.url} alt={`Look ${slot.toUpperCase()}`} /> : <span>Choose image {slot.toUpperCase()}</span>}
                </button>
                <input
                  ref={ref}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => void loadSlot(event.target.files?.[0], slot)}
                />
                {data.url ? (
                  <div className="ab-mobile" aria-hidden>
                    <img src={data.url} alt="" />
                    <span>Phone tile</span>
                  </div>
                ) : null}
                {data.score ? <p className="ab-score">{data.score.total}/100</p> : null}
              </div>
            )
          })}
        </div>
        {winner ? (
          <div className="score-tips">
            <p>
              {winner === 'tie'
                ? 'Heuristic tie — pick with your title, or generate a third look.'
                : `Heuristic pick: Look ${winner.toUpperCase()}. Not a CTR forecast.`}
            </p>
            <div className="tool-actions">
              <Link className="btn-gradient" to={{ pathname: '/', hash: '#editor-ai' }} onClick={onGenerate}>
                Generate 3 alternatives
              </Link>
            </div>
          </div>
        ) : null}
        {error ? <p className="tool-error">{error}</p> : null}
      </section>
    </ToolShell>
  )
}
