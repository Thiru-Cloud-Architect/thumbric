/** Which image backend the SPA will try first. */

export type AiBackendKind = 'worker' | 'fal-client' | 'pollinations'

export type AiBackend = {
  kind: AiBackendKind
  /** Human label for README / inspector — never dump keys. */
  label: string
  /** True when a paid/proxy key can produce a stronger model. */
  premium: boolean
}

/** Honest product-facing status for the AI maker. */
export type ProviderTier = 'free' | 'pro'

export type ProviderReadiness = {
  /** Configured client routing target. */
  backend: AiBackend
  tier: ProviderTier
  /** Short UI chip: "Free preview engine" | "Pro imaging ready". */
  statusLabel: string
  /** One-line helper under the chip. */
  statusHint: string
  /** True when VITE_API_BASE or VITE_FAL_KEY is set locally. */
  configured: boolean
  /** Worker probe result when available; null until probed. */
  workerReady: boolean | null
}

export type WorkerAiReadyResponse = {
  ready: boolean
  backend: 'fal' | 'workers-ai' | null
  service?: string
}

export function apiBaseUrl() {
  return String(import.meta.env.VITE_API_BASE || '')
    .trim()
    .replace(/\/+$/, '')
}

export function clientFalKey() {
  return String(import.meta.env.VITE_FAL_KEY || '').trim()
}

/**
 * Premium path is the Cloudflare Worker (`VITE_API_BASE`) holding `FAL_KEY`.
 * `VITE_FAL_KEY` is a local-only escape hatch — it ships in the JS bundle.
 */
export function resolveAiBackend(): AiBackend {
  if (apiBaseUrl()) {
    return { kind: 'worker', label: 'Studio AI (Worker · fal)', premium: true }
  }
  if (clientFalKey()) {
    return { kind: 'fal-client', label: 'Studio AI (fal client)', premium: true }
  }
  return { kind: 'pollinations', label: 'Free AI', premium: false }
}

/** How many live model calls to make before filling remaining looks locally. */
export function apiLookBudget(kind: AiBackendKind = resolveAiBackend().kind) {
  return kind === 'pollinations' ? 1 : 3
}

/**
 * Detect whether fal / worker imaging is configured on this build.
 * Does not claim face-swap or YouTube frames — only provider readiness.
 */
export function getProviderReadiness(workerReady: boolean | null = null): ProviderReadiness {
  const backend = resolveAiBackend()
  const configured = backend.premium
  if (configured) {
    const confirmed = workerReady === true || backend.kind === 'fal-client'
    const pending = backend.kind === 'worker' && workerReady === null
    return {
      backend,
      tier: 'pro',
      statusLabel: confirmed ? 'Pro imaging ready' : 'Pro imaging configured',
      statusHint: pending
        ? 'Worker URL is set — verifying fal key on the API…'
        : workerReady === false
          ? 'Worker is up but FAL_KEY is missing — free preview still works.'
          : backend.kind === 'fal-client'
            ? 'Local fal key detected (demo only). Prefer Worker + FAL_KEY in production.'
            : 'Paid imaging path is available. Free preview still works as fallback.',
      configured: true,
      workerReady,
    }
  }
  return {
    backend,
    tier: 'free',
    statusLabel: 'Free preview engine',
    statusHint: 'Pollinations + studio looks. Set FAL_KEY on the Worker for pro imaging.',
    configured: false,
    workerReady: null,
  }
}

/**
 * Probe Worker `GET /api/ai/ready` (falls back to `/api`).
 * Never throws — returns null when unconfigured or unreachable.
 */
export async function probeWorkerAiReady(signal?: AbortSignal): Promise<boolean | null> {
  const base = apiBaseUrl()
  if (!base) return null
  const paths = ['/api/ai/ready', '/api', '/']
  for (const path of paths) {
    try {
      const response = await fetch(`${base}${path}`, { method: 'GET', signal })
      if (!response.ok) continue
      const data = (await response.json()) as WorkerAiReadyResponse & {
        premiumAi?: boolean
        endpoints?: string[]
      }
      if (typeof data.ready === 'boolean') return data.ready
      if (typeof data.premiumAi === 'boolean') return data.premiumAi
    } catch {
      /* try next path */
    }
  }
  return false
}

/** Combine static config with an optional live Worker probe. */
export async function resolveProviderReadiness(signal?: AbortSignal): Promise<ProviderReadiness> {
  const base = getProviderReadiness()
  if (base.backend.kind !== 'worker') return base
  const workerReady = await probeWorkerAiReady(signal)
  return getProviderReadiness(workerReady)
}
