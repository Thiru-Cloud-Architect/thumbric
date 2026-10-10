/**
 * Client-side AI generation orchestrator helpers (master doc §26 / §48 / §50 / §54).
 * Stages match real work on the free path — no fake critic / paid fal claims.
 */

import type { CreativeBrief, CreativeConcept } from './creativeBrief'
import { visualHintForConcept } from './creativeBrief'
import type { AiGeneratedImage, AiThumbOptions } from './aiThumbnail'
import { isAiRateLimitedError } from './aiThumbnail'
import type { Niche } from './niches'
import type { Platform } from './platforms'

/** Frontend state machine — critiquing reserved for a later critic slice. */
export type GenerationStage =
  | 'idle'
  | 'planning'
  | 'generating'
  | 'assembling'
  | 'completed'
  | 'failed'
  | 'cancelled'

/** Ordered busy stages shown in the maker progress UI. */
export const GENERATION_PROGRESS_STAGES: GenerationStage[] = [
  'planning',
  'generating',
  'assembling',
]

/** §26 copy — messages correspond to actual stages, not a rotating spinner. */
export const GENERATION_STAGE_LABELS: Record<GenerationStage, string> = {
  idle: '',
  planning: 'Understanding your video…',
  generating: 'Building three creative directions…',
  assembling: 'Preparing editable layers…',
  completed: 'Concepts are ready',
  failed: 'We could not finish this concept',
  cancelled: 'Cancelled',
}

export type StructuredAiFailure = {
  message: string
  rateLimited: boolean
  /** Preserve successful concepts when partial — §30 / §50. */
  preserveConcepts: boolean
  actionHint: string
}

/** Map pipeline progress onto the stage machine used by the maker UI. */
export function stageForPipeline(done: number, total: number, planningDone: boolean): GenerationStage {
  if (!planningDone) return 'planning'
  if (done <= 0) return 'generating'
  if (done < total) return 'generating'
  return 'assembling'
}

export function labelForStage(stage: GenerationStage) {
  return GENERATION_STAGE_LABELS[stage]
}

/** Attach creative-director metadata so each look is a distinct packaging strategy. */
export function attachCreativeConcepts(
  images: AiGeneratedImage[],
  brief: CreativeBrief | null,
): AiGeneratedImage[] {
  if (!brief) return images
  return images.map((item, index) => {
    const concept = brief.concepts[index]
    if (!concept) return item
    return {
      ...item,
      lookLabel: concept.strategy,
      lookWhy: concept.why,
      // Prefer song/topic hook as the visible title; artist stays as subline.
      lookHeadline: concept.headline,
      lookSubheadline: concept.subheadline,
      lookPlacement: concept.placement,
    }
  })
}

/**
 * Brief → image options for the primary model call.
 * Free path still uses one model call; concepts stay distinct via strategy/headline/placement.
 */
export function thumbOptionsFromBrief(input: {
  brief: CreativeBrief
  niche: Niche
  platform: Platform
  fallbackTitle: string
  conceptIndex?: number
}): AiThumbOptions {
  const concept = input.brief.concepts[input.conceptIndex ?? 0] ?? input.brief.concepts[0]!
  return {
    title: concept.headline || input.fallbackTitle,
    niche: input.niche,
    platform: input.platform,
    hint: visualHintForConcept(input.brief, concept),
    styleId: 'auto',
    variantIndex: variantIndexForPlacement(concept.placement),
  }
}

/** Align composition empty-space with where the editable title will sit. */
export function variantIndexForPlacement(placement: CreativeConcept['placement']) {
  if (placement === 'left') return 1
  if (placement === 'right') return 0
  return 2
}

export function structuredAiFailure(error: unknown): StructuredAiFailure {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      message: 'Cancelled.',
      rateLimited: false,
      preserveConcepts: true,
      actionHint: 'Your idea is still here — try again when ready.',
    }
  }
  const message =
    error instanceof Error ? error.message : 'We could not finish this concept. Your idea is safe.'
  const rateLimited = isAiRateLimitedError(error) || /busy|try again in a minute/i.test(message)
  return {
    message: rateLimited
      ? 'Free AI is busy right now. Your idea is safe — try again shortly.'
      : message || 'We could not finish this concept. Your idea is safe.',
    rateLimited,
    preserveConcepts: true,
    actionHint: rateLimited
      ? 'Wait for the cooldown, then try again.'
      : 'Try again, or edit the idea and create once more.',
  }
}

export function progressStageIndex(stage: GenerationStage) {
  const index = GENERATION_PROGRESS_STAGES.indexOf(stage)
  return index < 0 ? 0 : index
}
