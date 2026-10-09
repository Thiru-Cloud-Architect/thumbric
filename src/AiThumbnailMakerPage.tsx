import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { track } from './analytics'
import {
  getProviderReadiness,
  resolveProviderReadiness,
  type ProviderReadiness,
} from './aiConfig'
import {
  AI_LOOK_TARGET,
  AI_RATE_LIMIT_COOLDOWN_SEC,
  generateAiThumbnailVariants,
  type AiGeneratedImage,
  type AiStyleId,
} from './aiThumbnail'
import {
  GENERATION_PROGRESS_STAGES,
  attachCreativeConcepts,
  labelForStage,
  progressStageIndex,
  structuredAiFailure,
  thumbOptionsFromBrief,
  type GenerationStage,
} from './aiOrchestrator'
import {
  advanceImagingJob,
  cancelImagingJob,
  completeImagingJob,
  createImagingJob,
  failImagingJob,
  imagingRecoveryHint,
  markImagingPlanningDone,
  type ImagingJob,
} from './aiImaging'
import { consumeAiHandoff, objectUrlToDataUrl, saveAiHandoff } from './aiHandoff'
import { buildCreativeBrief, visualHintForConcept, type CreativeBrief } from './creativeBrief'
import { getNiche } from './niches'
import { getPlatform } from './platforms'
import { ToolShell } from './ToolShell'
import {
  looksLikeYoutubeUrl,
  resolveYoutubeMeta,
  sceneBriefFromInput,
  type YoutubeMeta,
} from './youtubeUrl'

type Phase = 'compose' | 'busy' | 'ready' | 'err'

export default function AiThumbnailMakerPage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('compose')
  const [stage, setStage] = useState<GenerationStage>('idle')
  const [statusLine, setStatusLine] = useState('')
  const [errorText, setErrorText] = useState('')
  const [errorHint, setErrorHint] = useState('')
  const [variants, setVariants] = useState<AiGeneratedImage[]>([])
  const [pick, setPick] = useState(0)
  const [brief, setBrief] = useState<CreativeBrief | null>(null)
  const [youtubeMeta, setYoutubeMeta] = useState<YoutubeMeta | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [directionRotate, setDirectionRotate] = useState(0)
  const [provider, setProvider] = useState<ProviderReadiness>(() => getProviderReadiness())
  const imagingJobRef = useRef<ImagingJob | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const runIdRef = useRef(0)
  const objectUrls = useRef<string[]>([])

  const niche = useMemo(() => getNiche('vlog'), [])
  const platform = useMemo(() => getPlatform('youtube'), [])
  const urlMode = looksLikeYoutubeUrl(input)
  const canGenerate = input.trim().length >= 3 && phase !== 'busy' && cooldown === 0
  const chosen = variants[pick] ?? variants[0] ?? null
  const activeProgressIndex = progressStageIndex(stage)

  useEffect(() => {
    const controller = new AbortController()
    void resolveProviderReadiness(controller.signal).then((next) => {
      if (!controller.signal.aborted) setProvider(next)
    })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    track('landing_page_view', { path: '/ai-thumbnail-maker' })
    const handoff = consumeAiHandoff()
    if (handoff?.hint) setInput(handoff.hint)
    if (handoff?.photoDataUrl) setPhotoDataUrl(handoff.photoDataUrl)
    // UI QA / walkthrough stub — never claims paid face-swap or YouTube frames.
    if (new URLSearchParams(window.location.search).get('demoResult') === '1') {
      const stub =
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
            <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7db8ff"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
            <rect width="1280" height="720" fill="url(#g)"/>
            <text x="80" y="340" fill="#fff" font-family="DM Sans, sans-serif" font-size="72" font-weight="800">Your thumbnail</text>
            <text x="80" y="420" fill="#f7faff" font-family="DM Sans, sans-serif" font-size="36" font-weight="600">Demo preview · open in editor</text>
          </svg>`,
        )
      const image = new Image()
      image.src = stub
      setVariants([
        {
          image,
          objectUrl: stub,
          prompt: 'demo-result-stub',
          seed: 0,
          styleId: 'auto',
          lookLabel: 'Demo',
          lookWhy: 'UI preview stub',
          lookHeadline: 'Your thumbnail',
          lookPlacement: 'left',
          source: 'studio',
        } satisfies AiGeneratedImage,
      ])
      setStage('completed')
      setPhase('ready')
    }
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

  function applyImagingJob(job: ImagingJob) {
    imagingJobRef.current = job
    setStage(job.stage)
    setStatusLine(job.progressCopy)
  }

  async function runGenerate(options: { rotateExtra?: number } = {}) {
    if (phase === 'busy' || cooldown > 0 || input.trim().length < 3) return

    abortRef.current?.abort()
    const controller = new AbortController()
    const runId = ++runIdRef.current
    abortRef.current = controller
    setPhase('busy')
    setErrorText('')
    setErrorHint('')
    setPick(0)
    setYoutubeMeta(null)
    for (const url of objectUrls.current) URL.revokeObjectURL(url)
    objectUrls.current = []
    setVariants([])

    let job = createImagingJob({
      conceptTotal: AI_LOOK_TARGET,
      provider,
    })
    applyImagingJob(job)

    const rotate = directionRotate + (options.rotateExtra ?? 0)

    let meta: YoutubeMeta | null = null
    if (urlMode) {
      meta = await resolveYoutubeMeta(input, controller.signal)
      if (runId !== runIdRef.current) return
      setYoutubeMeta(meta)
    }

    const sceneText = sceneBriefFromInput(input, meta)
    const nextBrief = buildCreativeBrief(sceneText || input || 'YouTube video idea', { rotate })
    setBrief(nextBrief)
    setDirectionRotate(rotate)
    const thumbOptions = thumbOptionsFromBrief({
      brief: nextBrief,
      niche,
      platform,
      fallbackTitle: meta?.title || input || 'Thumbnail',
      conceptIndex: 0,
    })

    job = markImagingPlanningDone(job)
    applyImagingJob(job)

    try {
      const batch = await generateAiThumbnailVariants(
        {
          ...thumbOptions,
          styleId: 'auto' satisfies AiStyleId,
        },
        {
          count: AI_LOOK_TARGET,
          signal: controller.signal,
          onProgress: (done, total) => {
            if (runId !== runIdRef.current) return
            const current = imagingJobRef.current ?? job
            applyImagingJob(
              advanceImagingJob(
                { ...current, conceptTotal: total },
                { planningDone: true, conceptsDone: done, status: 'running' },
              ),
            )
          },
          onItem: (item, index) => {
            if (runId !== runIdRef.current) return
            objectUrls.current.push(item.objectUrl)
            const tagged = attachCreativeConcepts([item], nextBrief)[0]!
            setVariants((current) => {
              const next = [...current]
              next[index] = tagged
              return next.slice(0, AI_LOOK_TARGET)
            })
          },
        },
      )
      if (runId !== runIdRef.current) return

      job = completeImagingJob(imagingJobRef.current ?? job)
      applyImagingJob(job)
      const merged = attachCreativeConcepts(batch.results.slice(0, AI_LOOK_TARGET), nextBrief)
      for (const item of merged) {
        if (!objectUrls.current.includes(item.objectUrl)) objectUrls.current.push(item.objectUrl)
      }
      setVariants(merged)
      if (batch.rateLimited) setCooldown(AI_RATE_LIMIT_COOLDOWN_SEC)
      setStage('completed')
      setPhase('ready')
      setStatusLine('')
      track('concepts_generated', {
        tool: 'ai-thumbnail-maker',
        count: merged.length,
        studio: batch.usedStudioFallback,
        youtube: Boolean(meta),
        providerTier: provider.tier,
      })
      track('thumbnail_generated', { tool: 'ai-thumbnail-maker', looks: merged.length })
    } catch (error) {
      if (runId !== runIdRef.current) return
      if (error instanceof DOMException && error.name === 'AbortError' && controller.signal.aborted) {
        applyImagingJob(cancelImagingJob(imagingJobRef.current ?? job))
        setStage('cancelled')
        setPhase('compose')
        setStatusLine('')
        return
      }
      const failed = failImagingJob(imagingJobRef.current ?? job, error)
      applyImagingJob(failed)
      const failure = failed.failure ?? structuredAiFailure(error)
      setErrorText(failure.message)
      setErrorHint(imagingRecoveryHint(failed))
      setStage('failed')
      setPhase('err')
      track('generation_failed', {
        tool: 'ai-thumbnail-maker',
        rateLimited: failure.rateLimited,
        providerTier: provider.tier,
      })
      if (failure.rateLimited) setCooldown(AI_RATE_LIMIT_COOLDOWN_SEC)
    } finally {
      if (runId === runIdRef.current) {
        if (abortRef.current === controller) abortRef.current = null
      }
    }
  }

  async function finishInEditor() {
    if (!chosen) return
    const concept = brief?.concepts[pick]
    const headline =
      chosen.lookHeadline || concept?.headline || youtubeMeta?.title || ''
    let handoffPhoto = photoDataUrl ?? undefined
    if (!handoffPhoto && chosen.objectUrl) {
      try {
        handoffPhoto = await objectUrlToDataUrl(chosen.objectUrl)
      } catch {
        handoffPhoto = undefined
      }
    }
    saveAiHandoff({
      hint: input.trim() || primaryFallbackHint(brief),
      title: headline,
      titleLine2: chosen.lookSubheadline || concept?.subheadline || '',
      placement: chosen.lookPlacement || concept?.placement,
      strategy: chosen.lookLabel || concept?.strategy,
      styleId: 'auto',
      photoDataUrl: handoffPhoto,
      source: 'ai-thumbnail-maker',
      mode: 'classic',
    })
    track('cta_click', { tool: 'ai-thumbnail-maker', cta: 'finish_in_editor' })
    navigate({ pathname: '/', hash: '#editor' })
  }

  async function downloadHd() {
    if (!chosen?.objectUrl) return
    try {
      const response = await fetch(chosen.objectUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'thumbric-ai-thumbnail.png'
      anchor.click()
      URL.revokeObjectURL(url)
      track('cta_click', { tool: 'ai-thumbnail-maker', cta: 'download_hd' })
    } catch {
      setErrorText('Could not download that image. Try Open in editor instead.')
      setErrorHint('Your concept is still selected.')
      setStage('failed')
      setPhase('err')
    }
  }

  function resetCompose() {
    setPhase('compose')
    setStage('idle')
    setStatusLine('')
    setErrorText('')
    setErrorHint('')
  }

  return (
    <ToolShell
      path="/ai-thumbnail-maker"
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Tools', to: '/tools' },
        { label: 'AI Thumbnail Maker' },
      ]}
      kicker="AI Thumbnail Maker"
      title="AI thumbnail maker"
      lede="One field: paste a YouTube link or describe the scene. We create a cover you can download or finish in the editor."
      hideMoreTools
    >
      <p
        className="ai-provider-status"
        data-tier={provider.tier}
        title={provider.statusHint}
        aria-live="polite"
      >
        {provider.statusLabel}
      </p>
      {phase === 'ready' && chosen ? (
        <section className="ai-canva-result" aria-label="Thumbnail result">
          <p className="ai-canva-hook">
            {variants.length > 1
              ? `I found ${variants.length} ways to package your video.`
              : 'Your thumbnail is ready'}
          </p>
          {variants.length > 1 ? (
            <div className="ai-canva-thumbs" role="listbox" aria-label="Concept picks">
              {variants.map((item, index) => (
                <button
                  key={`${item.seed}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={pick === index}
                  className={pick === index ? 'is-selected' : undefined}
                  onClick={() => setPick(index)}
                >
                  <img src={item.objectUrl} alt="" />
                  <span className="ai-concept-chip">{item.lookLabel || `Look ${index + 1}`}</span>
                </button>
              ))}
            </div>
          ) : null}
          <img src={chosen.objectUrl} alt="Generated thumbnail" />
          {(chosen.lookLabel || chosen.lookWhy || chosen.lookHeadline) && (
            <div className="ai-concept-meta">
              {chosen.lookLabel ? <p className="ai-concept-strategy">{chosen.lookLabel}</p> : null}
              {chosen.lookHeadline ? (
                <p className="ai-concept-headline">{chosen.lookHeadline}</p>
              ) : null}
              {chosen.lookWhy ? <p className="ai-concept-why">{chosen.lookWhy}</p> : null}
            </div>
          )}
          <div className="ai-canva-actions">
            <button type="button" className="btn-gradient" onClick={() => void downloadHd()}>
              Download
            </button>
            <button type="button" className="btn-outline" onClick={() => void finishInEditor()}>
              Open in editor
            </button>
          </div>
          <button
            type="button"
            className="ai-text-btn"
            disabled={cooldown > 0}
            onClick={() => {
              void runGenerate({ rotateExtra: 1 })
            }}
          >
            {cooldown > 0 ? `Try again in ${cooldown}s` : 'Generate 3 new directions'}
          </button>
          {errorText ? (
            <p className="tool-error" role="alert">
              {errorText}
              {errorHint ? ` ${errorHint}` : ''}
            </p>
          ) : null}
        </section>
      ) : (
        <section className="ai-canva" aria-label="Create a thumbnail">
          <label className="ai-canva-prompt">
            <span className="sr-only">Paste a YouTube link, or describe the scene</span>
            <textarea
              id="ai-maker-hint"
              rows={2}
              value={input}
              disabled={phase === 'busy'}
              onChange={(event) => {
                setInput(event.target.value)
                if (phase === 'err') {
                  setPhase('compose')
                  setStage('idle')
                  setErrorText('')
                  setErrorHint('')
                }
              }}
              placeholder="Paste a YouTube link, or describe the scene"
            />
          </label>
          {phase === 'busy' ? (
            <ol className="ai-stage-list" aria-live="polite" aria-label="Generation progress">
              {GENERATION_PROGRESS_STAGES.map((item, index) => {
                const state =
                  index < activeProgressIndex ? 'done' : index === activeProgressIndex ? 'active' : 'todo'
                return (
                  <li key={item} data-state={state}>
                    <span className="ai-stage-dot" aria-hidden="true" />
                    <span>{labelForStage(item)}</span>
                  </li>
                )
              })}
            </ol>
          ) : null}
          <div className="ai-canva-actions">
            <button
              type="button"
              className="btn-gradient"
              disabled={!canGenerate}
              aria-busy={phase === 'busy'}
              onClick={() => void runGenerate()}
            >
              {phase === 'busy'
                ? statusLine || 'Creating…'
                : cooldown > 0
                  ? `Try again in ${cooldown}s`
                  : 'Create thumbnail'}
            </button>
          </div>
          {urlMode ? (
            <p className="ai-canva-note">
              {youtubeMeta?.title
                ? `Using title: ${youtubeMeta.title}. Frame pull from YouTube is not available yet — we package from the idea.`
                : 'YouTube links use the video title when available. We do not pull private frames yet.'}
            </p>
          ) : (
            <p className="ai-canva-note">Tip: keep the idea short — subject, emotion, and one bold claim.</p>
          )}
          {phase === 'err' && errorText ? (
            <div className="ai-failure" role="alert">
              <p className="tool-error">{errorText}</p>
              {errorHint ? <p className="ai-canva-note">{errorHint}</p> : null}
              <button
                type="button"
                className="ai-text-btn"
                disabled={cooldown > 0}
                onClick={() => {
                  resetCompose()
                  void runGenerate()
                }}
              >
                {cooldown > 0 ? `Try again in ${cooldown}s` : 'Try again'}
              </button>
            </div>
          ) : null}
        </section>
      )}
    </ToolShell>
  )
}

function primaryFallbackHint(brief: CreativeBrief | null) {
  if (!brief?.concepts[0]) {
    return 'expressive creator looking at camera, dramatic key light, empty space for a title'
  }
  return visualHintForConcept(brief, brief.concepts[0])
}
