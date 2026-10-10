/**
 * Client-side Pro imaging (fal/Worker) quota helpers for UI chips and generate hooks.
 */

import { resolveAiBackend, type ProviderReadiness } from './aiConfig'
import {
  type Entitlement,
  proImageLimit,
  proImagesLeft,
  proImagingStatusLabel,
} from './entitlement'

/** How many fal/Worker images this generate run may spend. */
export function premiumBudgetForRun(entitlement: Entitlement, wantCount: number) {
  if (!resolveAiBackend().premium) return 0
  const left = proImagesLeft(entitlement)
  if (!Number.isFinite(left)) return Math.max(0, wantCount)
  return Math.max(0, Math.min(wantCount, left))
}

/** Overlay remaining quota onto the provider status chip. */
export function readinessWithQuota(
  readiness: ProviderReadiness,
  entitlement: Entitlement,
): ProviderReadiness {
  if (!readiness.configured) return readiness
  if (readiness.workerReady === false) return readiness

  const left = proImagesLeft(entitlement)
  const limit = proImageLimit(entitlement)
  const label = proImagingStatusLabel(entitlement)

  if (left <= 0) {
    return {
      ...readiness,
      tier: 'free',
      statusLabel: 'Free preview engine',
      statusHint: Number.isFinite(limit)
        ? `${label}. Free Pollinations still works; Creator gets 60/mo, Pro is unlimited.`
        : label,
    }
  }

  const build = String(import.meta.env.VITE_BUILD_ID || '').slice(0, 7)
  return {
    ...readiness,
    tier: 'pro',
    statusLabel: build ? `${label} · ${build}` : label,
    statusHint: Number.isFinite(limit)
      ? 'Each pro look spends one of your monthly fal images. After that, free preview continues.'
      : 'Pro plan — unlimited fal imaging on this device unlock.',
  }
}
