import { describe, expect, it } from 'vitest'
import {
  beginExportGate,
  confirmExportGate,
  overlaysAreStacked,
  resolveExportOverlay,
} from './exportGate'
import type { ExportCheck } from './exportValidation'

function checks(partial: Partial<ExportCheck>[] = []): ExportCheck[] {
  const base: ExportCheck[] = [
    { id: 'size', ok: true, label: '1280 × 720' },
    { id: 'image', ok: true, label: 'Image loaded' },
    { id: 'title', ok: true, label: 'Headline present' },
    { id: 'clip', ok: true, label: 'Text inside canvas' },
    { id: 'safe', ok: true, label: 'Safe-area placement OK' },
    { id: 'readable', ok: true, label: 'Text size looks mobile-readable' },
  ]
  for (const p of partial) {
    const i = base.findIndex((c) => c.id === p.id)
    if (i >= 0) base[i] = { ...base[i], ...p }
  }
  return base
}

describe('exportGate (download modal stacking regression)', () => {
  it('beginExportGate only shows quality — never auto-downloads', () => {
    const action = beginExportGate(checks())
    expect(action.type).toBe('show-quality')
    if (action.type === 'show-quality') {
      expect(action.blocking).toBe(false)
      expect(action.checks.length).toBeGreaterThan(0)
    }
  })

  it('marks blocking when clip/size fail', () => {
    const action = beginExportGate(checks([{ id: 'clip', ok: false, label: 'clipped' }]))
    expect(action.type).toBe('show-quality')
    if (action.type === 'show-quality') expect(action.blocking).toBe(true)
  })

  it('confirmExportGate chooses watermark vs clean after user confirms', () => {
    expect(confirmExportGate(false)).toEqual({ type: 'download-watermark' })
    expect(confirmExportGate(true)).toEqual({ type: 'download-clean' })
  })

  it('quality checklist wins when auth would also be open (no stacking)', () => {
    expect(
      resolveExportOverlay({
        exportChecksOpen: true,
        authModalOpen: true,
        entitlementModalOpen: false,
      }),
    ).toBe('quality')
    expect(
      overlaysAreStacked({
        exportChecksOpen: true,
        authModalOpen: true,
        entitlementModalOpen: false,
      }),
    ).toBe(true)
  })

  it('healthy single-modal states are not stacked', () => {
    expect(
      overlaysAreStacked({
        exportChecksOpen: true,
        authModalOpen: false,
        entitlementModalOpen: false,
      }),
    ).toBe(false)
    expect(
      overlaysAreStacked({
        exportChecksOpen: false,
        authModalOpen: true,
        entitlementModalOpen: false,
      }),
    ).toBe(false)
  })
})
