import { describe, expect, it } from 'vitest'
import { hasBlockingExportIssue, validateExport } from './exportValidation'
import { getNiche } from './niches'
import { getPlatform } from './platforms'

function baseInput(overrides: Record<string, unknown> = {}) {
  return {
    title: 'TEST TITLE',
    tag: '',
    niche: getNiche('tech'),
    platform: getPlatform('youtube'),
    layout: 'photo-full' as const,
    photoShape: 'rounded' as const,
    accentOverride: '',
    watermark: true,
    photo: null,
    stickers: [],
    fontId: 'bebas' as const,
    titleFontSizePx: 110,
    textStyleId: 'classic' as const,
    textPos: { x: 0.08, y: 0.12 },
    ...overrides,
  }
}

describe('exportValidation', () => {
  it('flags empty title and missing photo', () => {
    const checks = validateExport(baseInput({ title: '', titleFontSizePx: 40 }))
    expect(checks.find((c) => c.id === 'title')?.ok).toBe(false)
    expect(checks.find((c) => c.id === 'image')?.ok).toBe(false)
    expect(checks.find((c) => c.id === 'readable')?.ok).toBe(false)
  })

  it('passes a healthy draft size check', () => {
    const checks = validateExport(baseInput())
    expect(checks.find((c) => c.id === 'size')?.ok).toBe(true)
    expect(hasBlockingExportIssue(checks)).toBe(false)
  })
})
