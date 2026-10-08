import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { track } from './analytics'
import {
  AI_LOOK_TARGET,
  AI_RATE_LIMIT_COOLDOWN_SEC,
  AI_SCENE_PRESETS,
  AI_STYLES,
  generateAiThumbnailVariants,
  getAiStyle,
  isAiRateLimitedError,
  suggestAiStyle,
  type AiGeneratedImage,
  type AiStyleId,
} from './aiThumbnail'
import { objectUrlToDataUrl, saveAiHandoff } from './aiHandoff'
import { resolveAiBackend } from './aiConfig'
import { buildCreativeBrief, visualHintForConcept, type CreativeBrief } from './creativeBrief'
import { getNiche } from './niches'
import { getPlatform } from './platforms'
import { ToolShell } from './ToolShell'

type Status = { kind: 'idle' | 'busy' | 'ok' | 'err'; text: string }

function attachConcepts(items: AiGeneratedImage[], brief: CreativeBrief | null) {
  if (!brief) return items
  return items.map((item, index) => {
    const concept = brief.concepts[index]
    if (!concept) return item
    return {
      ...item,
      lookLabel: concept.strategy,
      lookWhy: concept.why,
      lookHeadline: concept.headline,
    }
  })
}

export default function AiThumbnailMakerPage() {
  const navigate = useNavigate()
  const [hint, setHint] = useState('')
  const [styleId, setStyleId] = useState<AiStyleId>('auto')
  const [styleTip, setStyleTip] = useState<AiStyleId | null>(null)
  const [variants, setVariants] = useState<AiGeneratedImage[]>([])
  const [pick, setPick] = useState(0)
  const [busy, setBusy] = useState(false)
  const [slotCount, setSlotCount] = useState(3)
  const [progressDone, setProgressDone] = useState(0)
  const [cooldown, setCooldown] = useState(0)
  const [brief, setBrief] = useState<CreativeBrief | null>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle', text: '' })
  const abortRef = useRef<AbortController | null>(null)
  const runIdRef = useRef(0)
  const objectUrls = useRef<string[]>([])

  const niche = useMemo(() => getNiche('vlog'), [])
  const platform = useMemo(() => getPlatform('youtube'), [])

  useEffect(() => {
    track('landing_page_view', { path: '/ai-thumbnail-maker' })
    return () => {
      abortRef.current?.abort()
      for (const url of objectUrls.current) URL.revokeObjectURL(url)
    }
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  function onHintChange(value: string) {
    setHint(value)
    setStyleTip(suggestAiStyle(value, styleId))
  }

  function applyPreset(preset: (typeof AI_SCENE_PRESETS)[number]) {
    setHint(preset.hint)
    setStyleId(preset.styleId)
    setStyleTip(null)
    setStatus({ kind: 'idle', text: `Preset “${preset.label}” loaded.` })
  }

  async function runGenerate() {
    if (busy) return
    let nextStyle = styleId
    const tip = suggestAiStyle(hint, styleId)
    if (tip) {
      nextStyle = tip
      setStyleId(tip)
      setStyleTip(null)
    }

    const nextBrief = buildCreativeBrief(hint || 'YouTube video idea')
    setBrief(nextBrief)
    const primaryHint =
      nextBrief?.concepts[0] != null
        ? visualHintForConcept(nextBrief, nextBrief.concepts[0])
        : hint

    abortRef.current?.abort()
    const controller = new AbortController()
    const runId = ++runIdRef.current
    abortRef.current = controller
    setBusy(true)
    setSlotCount(AI_LOOK_TARGET)
    setProgressDone(0)
    setPick(0)
    for (const url of objectUrls.current) URL.revokeObjectURL(url)
    objectUrls.current = []
    setVariants([])
    setStatus({ kind: 'busy', text: 'Packaging 3 concepts — strategy first, then visuals…' })

    try {
      const batch = await generateAiThumbnailVariants(
        {
          title: nextBrief?.concepts[0]?.headline || hint || 'Thumbnail',
          niche,
          platform,
          hint: primaryHint,
          styleId: nextStyle,
        },
        {
          count: AI_LOOK_TARGET,
          signal: controller.signal,
          onProgress: (done, total) => {
            if (runId !== runIdRef.current) return
            setProgressDone(done)
            setStatus({
              kind: 'busy',
              text:
                done >= total
                  ? 'Concepts are ready — pick one below.'
                  : `Creating concept ${Math.min(done + 1, AI_LOOK_TARGET)} of ${AI_LOOK_TARGET}…`,
            })
          },
          onItem: (item, index) => {
            if (runId !== runIdRef.current) return
            objectUrls.current.push(item.objectUrl)
            const tagged = attachConcepts([item], nextBrief)[0]!
            setVariants((current) => {
              const next = [...current]
              next[index] = tagged
              return next.slice(0, AI_LOOK_TARGET)
            })
          },
        },
      )
      if (runId !== runIdRef.current) return

      const merged = attachConcepts(batch.results.slice(0, AI_LOOK_TARGET), nextBrief)
      for (const item of merged) {
        if (!objectUrls.current.includes(item.objectUrl)) objectUrls.current.push(item.objectUrl)
      }
      setVariants(merged)
      setProgressDone(merged.length)
      if (batch.rateLimited) setCooldown(AI_RATE_LIMIT_COOLDOWN_SEC)

      setStatus({
        kind: 'ok',
        text: batch.usedStudioFallback
          ? 'Free AI is busy — 3 concept packs are ready. Pick one and finish titles in the editor.'
          : merged.length >= AI_LOOK_TARGET
            ? 'Three packaging strategies ready — pick one, then finish in the editor.'
            : `Pick 1 of ${merged.length} concepts, then finish in the editor.`,
      })
      track('concepts_generated', {
        tool: 'ai-thumbnail-maker',
        count: merged.length,
        studio: batch.usedStudioFallback,
      })
      track('thumbnail_generated', { tool: 'ai-thumbnail-maker', looks: merged.length })
    } catch (error) {
      if (runId !== runIdRef.current) return
      if (error instanceof DOMException && error.name === 'AbortError' && controller.signal.aborted) {
        setStatus({ kind: 'idle', text: '' })
        return
      }
      const message = error instanceof Error ? error.message : 'Could not create those looks.'
      const rateLimited = isAiRateLimitedError(error) || /busy|try again in a minute/i.test(message)
      setStatus({ kind: 'err', text: message })
      track('generation_failed', { tool: 'ai-thumbnail-maker', rateLimited })
      if (rateLimited) setCooldown(AI_RATE_LIMIT_COOLDOWN_SEC)
    } finally {
      if (runId === runIdRef.current) {
        setBusy(false)
        if (abortRef.current === controller) abortRef.current = null
      }
    }
  }

  async function finishInEditor() {
    const chosen = variants[pick] ?? variants[0]
    const headline = chosen?.lookHeadline || brief?.concepts[pick]?.headline || ''
    let photoDataUrl: string | undefined
    if (chosen?.objectUrl) {
      try {
        photoDataUrl = await objectUrlToDataUrl(chosen.objectUrl)
      } catch {
        photoDataUrl = undefined
      }
    }
    saveAiHandoff({
      hint: hint || primaryFallbackHint(brief),
      title: headline,
      styleId,
      photoDataUrl,
      source: 'ai-thumbnail-maker',
      mode: 'ai',
    })
    track('cta_click', { tool: 'ai-thumbnail-maker', cta: 'finish_in_editor' })
    navigate({ pathname: '/', hash: '#editor-ai' })
  }

  const backend = resolveAiBackend()
  const canGenerate = hint.trim().length >= 3 && !busy && cooldown === 0

  return (
    <ToolShell
      path="/ai-thumbnail-maker"
      kicker="AI Thumbnail Maker · Pro packaging"
      title={
        <>
          AI thumbnail maker <span className="gradient-text">built for the click.</span>
        </>
      }
      lede="Describe the video. Get three packaging strategies with visuals. Pick one, then finish titles on the live canvas — not a marketing landing page."
    >
      <section className="tool-card ai-maker-card" aria-label="AI packaging">
        <div className="ai-maker-intro">
          <p className="ai-maker-kicker">Step 1 · Concept</p>
          <p>
            Natural language is fine. Headlines stay editable in the editor — never burned into the AI
            image. {backend.premium ? 'Premium AI path is available.' : 'Free path uses honest studio fallbacks when the model is busy.'}
          </p>
        </div>

        <div className="scene-preset-row" role="list">
          {AI_SCENE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              role="listitem"
              className="chip scene-preset"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <fieldset className="ai-style-field">
          <legend>Creative direction</legend>
          <div className="ai-style-row" role="list">
            {AI_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                role="listitem"
                className={
                  style.id === styleId ? 'chip solid ai-style-chip is-selected' : 'chip ai-style-chip'
                }
                aria-pressed={style.id === styleId}
                title={style.blurb}
                onClick={() => {
                  setStyleId(style.id)
                  setStyleTip(suggestAiStyle(hint, style.id))
                }}
              >
                <span className="ai-style-chip-label">{style.label}</span>
                <span className="ai-style-chip-blurb">{style.blurb}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="ai-hint-field">
          What is your video about?
          <textarea
            id="ai-maker-hint"
            rows={3}
            value={hint}
            onChange={(event) => onHintChange(event.target.value)}
            placeholder='e.g. “5 mistakes people make when buying their first house”'
          />
        </label>

        {styleTip ? (
          <p className="ai-style-suggest" role="status">
            This topic fits <strong>{getAiStyle(styleTip).label}</strong> better than{' '}
            {getAiStyle(styleId).label}.
            <button
              type="button"
              className="ai-style-suggest-btn"
              onClick={() => {
                setStyleId(styleTip)
                setStyleTip(null)
              }}
            >
              Switch style
            </button>
          </p>
        ) : (
          <p className="hint">
            Ban collages in your scene text — say “one photo of …” not “grid of …”. Photoreal Canva-grade
            faces need a paid fal key later; free AI still ships usable stills.
          </p>
        )}

        <div className="tool-actions">
          <button
            type="button"
            className="btn-gradient"
            disabled={!canGenerate}
            aria-busy={busy}
            onClick={() => void runGenerate()}
          >
            {busy
              ? 'Creating concepts…'
              : cooldown > 0
                ? `Try again in ${cooldown}s`
                : 'Create 3 concepts →'}
          </button>
          {busy ? (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                abortRef.current?.abort()
                setBusy(false)
                setStatus({ kind: 'idle', text: 'Stopped. Keep the looks you have.' })
              }}
            >
              Stop
            </button>
          ) : null}
          <Link className="btn-outline" to={{ pathname: '/', hash: '#editor' }}>
            Prefer the clean editor
          </Link>
        </div>

        {status.text ? (
          <p className={`ai-inline-status is-${status.kind}`} role="status" aria-live="polite">
            {status.text}
          </p>
        ) : null}
      </section>

      <section className="tool-card ai-maker-results" aria-label="Concept picker">
        <div className="ai-maker-intro">
          <p className="ai-maker-kicker">Step 2 · Pick a look</p>
          <p>
            {busy
              ? `Creating concepts… ${Math.min(progressDone + 1, AI_LOOK_TARGET)} of ${AI_LOOK_TARGET}`
              : variants.length > 0
                ? `Pick a concept · ${variants.length} ready`
                : 'Your three packaging strategies land here after you create.'}
          </p>
        </div>

        <div className="ai-variant-picker ai-maker-picker" role="listbox" aria-label="Pick an AI look">
          {Array.from({ length: slotCount }, (_, index) => {
            const item = variants[index]
            if (item) {
              return (
                <button
                  key={`${item.seed}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === pick}
                  className={index === pick ? 'ai-variant-card is-selected' : 'ai-variant-card'}
                  onClick={() => setPick(index)}
                >
                  <img src={item.objectUrl} alt={`AI look ${index + 1}`} />
                  <span>
                    {item.lookLabel || `Concept ${index + 1}`}
                    {index === pick ? ' · selected' : ''}
                  </span>
                  {item.lookWhy ? <em className="ai-concept-why">{item.lookWhy}</em> : null}
                  {item.lookHeadline ? (
                    <strong className="ai-concept-hook">{item.lookHeadline}</strong>
                  ) : null}
                </button>
              )
            }
            const loadingThis = busy && index <= Math.max(progressDone, 0)
            return (
              <div
                key={`slot-${index}`}
                className={loadingThis ? 'ai-variant-card is-loading' : 'ai-variant-card is-empty'}
              >
                <div className="ai-variant-placeholder">
                  {loadingThis ? (
                    <>
                      <span className="ai-inline-spinner" aria-hidden />
                      <span>Creating…</span>
                    </>
                  ) : (
                    <span className="ai-look-skel" aria-hidden />
                  )}
                </div>
                <span>{loadingThis ? 'Working' : `Look ${index + 1}`}</span>
              </div>
            )
          })}
        </div>

        <div className="tool-actions">
          <button
            type="button"
            className="btn-gradient"
            disabled={variants.length === 0}
            onClick={() => void finishInEditor()}
          >
            Finish in editor →
          </button>
          <Link className="btn-outline" to="/youtube-thumbnail-score">
            Score an existing thumb
          </Link>
        </div>
      </section>
    </ToolShell>
  )
}

function primaryFallbackHint(brief: CreativeBrief | null) {
  if (!brief?.concepts[0]) return 'expressive creator looking at camera, dramatic key light, empty space for a title'
  return visualHintForConcept(brief, brief.concepts[0])
}
