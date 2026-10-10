import { describe, expect, it } from 'vitest'
import {
  buildCreativeBrief,
  fullHeadline,
  naturalTitle,
  nicheIdForTopicKind,
  parseTopic,
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

  it('parses artist-song prompts and never invents WHAT X HIDES for music', () => {
    const parsed = parseTopic('Vishwanath and sons - pattamboochi song')
    expect(parsed.kind).toBe('music')
    expect(parsed.subject.toLowerCase()).toContain('vishwanath')
    expect(parsed.detail.toLowerCase()).toContain('pattamboochi')
    expect(nicheIdForTopicKind(parsed.kind)).toBe('music')

    const brief = buildCreativeBrief('Vishwanath and sons - pattamboochi song')
    expect(brief.kind).toBe('music')
    for (const concept of brief.concepts) {
      expect(concept.headline).not.toMatch(/^WHAT\s+\w+\s+HIDES$/i)
      expect(`${concept.headline} ${concept.subheadline || ''}`).toMatch(
        /pattamboochi|vishwanath|new drop|must hear|full song|out now|from silence/i,
      )
    }
    const curiosity = brief.concepts.find((c) => c.id === 'curiosity')
    if (curiosity) {
      expect(curiosity.headline).toMatch(/PATTAMBOOCHI|NEW/i)
      expect(curiosity.headline).not.toMatch(/VISHWANATH HIDES/i)
    }
  })

  it('keeps natural word order for story topics (no WHY…MATTERS scramble)', () => {
    const title = naturalTitle('elephant fell into a dug well')
    expect(title).toMatch(/ELEPHANT FELL INTO/)
    expect(title).toMatch(/WELL/)
    expect(title).not.toMatch(/^ELEPHANT FELL DUG$/)

    const brief = buildCreativeBrief('elephant fell into a dug well')
    const curiosity = brief.concepts.find((c) => c.id === 'curiosity')
    expect(curiosity).toBeTruthy()
    expect(curiosity!.headline).toMatch(/ELEPHANT/)
    expect(curiosity!.headline).toMatch(/FELL/)
    expect(curiosity!.headline).toMatch(/WELL/)
    expect(curiosity!.headline).not.toMatch(/^WHY\b/)
    expect(fullHeadline(curiosity!)).not.toMatch(/WHY .+ MATTERS/i)
    expect(fullHeadline(curiosity!)).not.toMatch(/FELL DUG(?! WELL)/i)
    expect(curiosity!.visual.toLowerCase()).toMatch(/elephant/)

    for (const concept of brief.concepts) {
      expect(fullHeadline(concept)).not.toMatch(/THAT WORKS/i)
      expect(fullHeadline(concept)).not.toMatch(/WHY .+ MATTERS/i)
      expect(concept.visual.toLowerCase()).toMatch(/elephant|dug|well|fell/)
    }
  })

  it('uses topic hook phrases instead of first-token HIDES for general curiosity', () => {
    const brief = buildCreativeBrief('iPhone 16 vs Pixel camera test')
    const curiosity = brief.concepts.find((c) => c.id === 'curiosity')
    if (curiosity) {
      expect(curiosity.headline).not.toMatch(/HIDES/i)
      expect(curiosity.headline).not.toMatch(/^WHY\b/)
      expect(fullHeadline(curiosity)).toMatch(/IPHONE|PIXEL|CAMERA/i)
    }
  })

  it('does not scramble home-buyer mistake titles into DON\'T MISTAKES', () => {
    const brief = buildCreativeBrief('5 mistakes first-time home buyers make')
    const warning = brief.concepts.find((c) => c.id === 'warning')
    expect(warning).toBeTruthy()
    expect(fullHeadline(warning!)).not.toMatch(/DON'T MISTAKES/i)
    expect(fullHeadline(warning!)).toMatch(/HOME|BUYER|MISTAKE|AVOID/i)
  })

  it('packages a Skoda Slavia YouTube title as a car story, not TITLED DID NOT BOOK faces', () => {
    const title = 'Why did i not book slavia? (My sad skoda story)'
    // Old bug: wrapping title in "YouTube video titled … High-CTR packaging still: …"
    const poisoned = `YouTube video titled “${title}” by tech panda tamil. High-CTR packaging still: one clear subject, dramatic light, empty space for a bold title. Do not invent burned-in text.`
    const cleaned = parseTopic(poisoned)
    expect(cleaned.raw.toLowerCase()).toMatch(/slavia|skoda/)
    expect(cleaned.raw).not.toMatch(/High-CTR packaging/i)
    expect(naturalTitle(poisoned)).not.toMatch(/TITLED/i)

    const brief = buildCreativeBrief(title)
    expect(brief.kind).toBe('tech')
    expect(brief.parsed.detail.toLowerCase()).toMatch(/sad skoda story/)
    expect(brief.concepts.map((c) => c.id).slice(0, 3)).toEqual(
      expect.arrayContaining(['warning', 'curiosity', 'outcome']),
    )
    for (const concept of brief.concepts) {
      expect(fullHeadline(concept)).not.toMatch(/TITLED DID NOT BOOK/i)
      expect(concept.visual.toLowerCase()).toMatch(/skoda|slavia|car|sedan|automotive/)
    }
    const curiosity = brief.concepts.find((c) => c.id === 'curiosity')
    expect(curiosity?.headline).toMatch(/SAD SKODA STORY/i)
  })
})
