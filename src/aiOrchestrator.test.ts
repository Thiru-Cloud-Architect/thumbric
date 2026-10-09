import { describe, expect, it } from 'vitest'
import {
  GENERATION_PROGRESS_STAGES,
  attachCreativeConcepts,
  labelForStage,
  progressStageIndex,
  stageForPipeline,
  structuredAiFailure,
  thumbOptionsFromBrief,
  variantIndexForPlacement,
} from './aiOrchestrator'
import { buildCreativeBrief } from './creativeBrief'
import { getNiche } from './niches'
import { getPlatform } from './platforms'
import { AiHttpError, type AiGeneratedImage } from './aiThumbnail'

describe('aiOrchestrator stages', () => {
  it('exposes planning → generating → assembling progress stages', () => {
    expect(GENERATION_PROGRESS_STAGES).toEqual(['planning', 'generating', 'assembling'])
    expect(labelForStage('planning')).toMatch(/Understanding/i)
    expect(labelForStage('generating')).toMatch(/creative directions/i)
    expect(labelForStage('assembling')).toMatch(/editable layers/i)
  })

  it('maps pipeline progress onto real stages without fake percentages', () => {
    expect(stageForPipeline(0, 3, false)).toBe('planning')
    expect(stageForPipeline(0, 3, true)).toBe('generating')
    expect(stageForPipeline(1, 3, true)).toBe('generating')
    expect(stageForPipeline(3, 3, true)).toBe('assembling')
    expect(progressStageIndex('generating')).toBe(1)
  })
})

describe('brief → variant wiring', () => {
  it('builds thumb options from the concept visual, not burned-in headline letters', () => {
    const brief = buildCreativeBrief('I tested 10 AI coding tools')
    const options = thumbOptionsFromBrief({
      brief,
      niche: getNiche('vlog'),
      platform: getPlatform('youtube'),
      fallbackTitle: 'Fallback',
      conceptIndex: 0,
    })
    expect(options.title).toBe(brief.concepts[0]!.headline)
    expect(options.hint).toMatch(/no text/i)
    expect(options.hint).toContain(brief.topic)
    expect(options.variantIndex).toBe(variantIndexForPlacement(brief.concepts[0]!.placement))
  })

  it('attaches strategy, why, headline, subheadline, and placement per concept', () => {
    const brief = buildCreativeBrief('5 mistakes first-time home buyers make')
    const images = brief.concepts.map(
      (_, index) =>
        ({
          image: new Image(),
          objectUrl: `blob:look-${index}`,
          prompt: 'x',
          seed: index,
          styleId: 'auto',
        }) satisfies AiGeneratedImage,
    )
    const tagged = attachCreativeConcepts(images, brief)
    expect(tagged[0]!.lookLabel).toBe(brief.concepts[0]!.strategy)
    expect(tagged[0]!.lookWhy).toBe(brief.concepts[0]!.why)
    expect(tagged[0]!.lookHeadline).toBe(brief.concepts[0]!.headline)
    expect(tagged[0]!.lookSubheadline).toBe(brief.concepts[0]!.subheadline)
    expect(tagged[0]!.lookPlacement).toBe(brief.concepts[0]!.placement)
    expect(new Set(tagged.map((item) => item.lookLabel)).size).toBe(3)
  })

  it('aligns empty title space with placement', () => {
    expect(variantIndexForPlacement('left')).toBe(1)
    expect(variantIndexForPlacement('right')).toBe(0)
    expect(variantIndexForPlacement('center')).toBe(2)
  })
})

describe('structured failure', () => {
  it('marks rate limits and preserves the idea', () => {
    const failure = structuredAiFailure(new AiHttpError(429, 'busy', true))
    expect(failure.rateLimited).toBe(true)
    expect(failure.preserveConcepts).toBe(true)
    expect(failure.message).toMatch(/safe/i)
    expect(failure.actionHint).toMatch(/cooldown|try again/i)
  })
})

describe('strategy rotation for new directions', () => {
  it('rotates strategy sets instead of repeating the same three', () => {
    const a = buildCreativeBrief('I tested 10 AI coding tools', { rotate: 0 })
    const b = buildCreativeBrief('I tested 10 AI coding tools', { rotate: 1 })
    expect(a.concepts.map((c) => c.id)).not.toEqual(b.concepts.map((c) => c.id))
  })
})
