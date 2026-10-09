import { describe, expect, it } from 'vitest'
import {
  buildCreativeBrief,
  fullHeadline,
  pickStrategyIds,
  visualHintForConcept,
} from './creativeBrief'

describe('creativeBrief', () => {
  it('builds three meaningfully different strategies for a home-buying topic', () => {
    const brief = buildCreativeBrief(
      'My video is about 5 mistakes people make when buying their first house.',
    )
    expect(brief.concepts).toHaveLength(3)
    const ids = brief.concepts.map((c) => c.id)
    expect(new Set(ids).size).toBe(3)
    expect(ids).toContain('warning')
    expect(brief.concepts.every((c) => c.headline && c.visual && c.why)).toBe(true)
    expect(brief.concepts.every((c) => !/collage|2x2|split screen/i.test(c.visual))).toBe(true)
  })

  it('keeps image hints free of burned-in title instructions as letters to paint', () => {
    const brief = buildCreativeBrief('I tested 10 AI coding tools')
    const hint = visualHintForConcept(brief, brief.concepts[0]!)
    expect(hint).toMatch(/no text/i)
    expect(fullHeadline(brief.concepts[0]!).length).toBeGreaterThan(2)
  })

  it('picks curiosity/contrarian families for myth-busting topics', () => {
    const ids = pickStrategyIds('the truth about investing myths nobody tells you')
    expect(ids.some((id) => id === 'contrarian' || id === 'curiosity')).toBe(true)
  })

  it('rotates strategy order when generate-new-directions asks for a fresh set', () => {
    const base = pickStrategyIds('I tested 10 AI coding tools', 0)
    const rotated = pickStrategyIds('I tested 10 AI coding tools', 2)
    expect(rotated).toHaveLength(3)
    expect(rotated).not.toEqual(base)
  })
})
