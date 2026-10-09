import { describe, expect, it } from 'vitest'
import { isThemeId, resolveTheme } from './theme'

describe('resolveTheme', () => {
  it('uses saved light or dark', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('falls back to prefers-color-scheme when unset', () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme(undefined, false)).toBe('light')
    expect(resolveTheme('weird', true)).toBe('dark')
  })
})

describe('isThemeId', () => {
  it('accepts only light|dark', () => {
    expect(isThemeId('light')).toBe(true)
    expect(isThemeId('dark')).toBe(true)
    expect(isThemeId('auto')).toBe(false)
    expect(isThemeId(null)).toBe(false)
  })
})
