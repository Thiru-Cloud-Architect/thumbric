import type { ExportCheck } from './exportValidation'
import { hasBlockingExportIssue } from './exportValidation'

/**
 * Export / download gate sequencing.
 * Quality checklist and auth/pay modals must never stack as opaque layers.
 */
export type ExportGateAction =
  | { type: 'show-quality'; checks: ExportCheck[]; blocking: boolean }
  | { type: 'download-watermark' }
  | { type: 'download-clean' }

/** First click on Download / Clean: only open the quality checklist. */
export function beginExportGate(checks: ExportCheck[]): ExportGateAction {
  return {
    type: 'show-quality',
    checks,
    blocking: hasBlockingExportIssue(checks),
  }
}

/** After the user confirms in the checklist modal. */
export function confirmExportGate(clean: boolean): ExportGateAction {
  return clean ? { type: 'download-clean' } : { type: 'download-watermark' }
}

/** Mutual exclusion: at most one opaque export-related overlay. */
export type ExportOverlay = 'none' | 'quality' | 'auth' | 'entitlement'

export function resolveExportOverlay(input: {
  exportChecksOpen: boolean
  authModalOpen: boolean
  entitlementModalOpen: boolean
}): ExportOverlay {
  // Priority: quality checklist owns the first click; never show auth/pay under it.
  if (input.exportChecksOpen) return 'quality'
  if (input.authModalOpen) return 'auth'
  if (input.entitlementModalOpen) return 'entitlement'
  return 'none'
}

export function overlaysAreStacked(input: {
  exportChecksOpen: boolean
  authModalOpen: boolean
  entitlementModalOpen: boolean
}): boolean {
  const open =
    Number(input.exportChecksOpen) +
    Number(input.authModalOpen) +
    Number(input.entitlementModalOpen)
  return open > 1
}
