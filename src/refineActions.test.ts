import { describe, expect, it } from 'vitest'
import {
  analyzeDesignIssues,
  applyRefineAction,
  parseRefineIntent,
  type DesignSnapshot,
} from './refineActions'

const base: DesignSnapshot = {
  title: 'FIVE COSTLY MISTAKES WHEN BUYING A HOUSE TODAY',
  titleLine2: '',
  titleFontSizePx: 56,
  titleAlign: 'left',
  titleFill: '',
  titleOutlineWidth: -1,
  titleShadow: true,
  textStyleId: 'classic',
  layout: 'photo-left',
  stickerCount: 2,
  hasPhoto: true,
}

describe('refineActions', () => {
  it('flags small type and long text', () => {
    const issues = analyzeDesignIssues(base)
    expect(issues.some((i) => i.id === 'small-type')).toBe(true)
    expect(issues.some((i) => i.id === 'long-text')).toBe(true)
  })

  it('maps natural language refine intents', () => {
    expect(parseRefineIntent('make the text shorter')).toBe('shorter-text')
    expect(parseRefineIntent('make it more dramatic')).toBe('more-dramatic')
    expect(parseRefineIntent('make it work better on mobile')).toBe('mobile')
  })

  it('applies shorter-text without inventing empty titles', () => {
    const patch = applyRefineAction('shorter-text', base)
    expect(patch.title).toBeTruthy()
    expect(patch.title!.split(/\s+/).length).toBeLessThanOrEqual(4)
  })
})
