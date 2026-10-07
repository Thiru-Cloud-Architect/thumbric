/** Which image backend the SPA will try first. */

export type AiBackendKind = 'worker' | 'fal-client' | 'pollinations'

export type AiBackend = {
  kind: AiBackendKind
  /** Human label for README / inspector — never dump keys. */
  label: string
  /** True when a paid/proxy key can produce a stronger model. */
  premium: boolean
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
