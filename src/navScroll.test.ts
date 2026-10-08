import { describe, expect, it } from 'vitest'
import { normalizeHash, scrollTargetIdForHash } from './nav'

describe('hash scroll targets', () => {
  it('normalizes leading hash marks', () => {
    expect(normalizeHash('#editor-ai')).toBe('editor-ai')
    expect(normalizeHash('editor')).toBe('editor')
  })

  it('maps editor hashes to the studio section id', () => {
    expect(scrollTargetIdForHash('editor-ai')).toBe('editor')
    expect(scrollTargetIdForHash('#editor-improve')).toBe('editor')
    expect(scrollTargetIdForHash('editor-title')).toBe('editor')
    expect(scrollTargetIdForHash('editor')).toBe('editor')
  })

  it('leaves non-editor hashes alone', () => {
    expect(scrollTargetIdForHash('how')).toBe('how')
    expect(scrollTargetIdForHash('#faq')).toBe('faq')
  })
})
