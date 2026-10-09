/**
 * Staged AI imaging pipeline hooks (master doc §4 / §26 / Phase 1 imaging).
 * Plan → generate → assemble. Does not claim face-swap or YouTube frames.
 */

import {
  GENERATION_PROGRESS_STAGES,
  labelForStage,
  stageForPipeline,
  structuredAiFailure,
  type GenerationStage,
  type StructuredAiFailure,
} from './aiOrchestrator'
import {
  getProviderReadiness,
  type ProviderReadiness,
} from './aiConfig'

export type ImagingJobPhase = 'plan' | 'generate' | 'assemble'

export type ImagingJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

/** Structured job for the imaging pipeline — ready for paid providers later. */
export type ImagingJob = {
  id: string
  status: ImagingJobStatus
  /** High-level pipeline phase. */
  phase: ImagingJobPhase
  /** UI stage machine mapping. */
  stage: GenerationStage
  conceptTotal: number
  conceptsDone: number
  planningDone: boolean
  provider: ProviderReadiness
  /** User-facing progress line. */
  progressCopy: string
  failure: StructuredAiFailure | null
  createdAt: number
  updatedAt: number
}

export type ImagingJobPatch = Partial<
  Pick<ImagingJob, 'status' | 'conceptsDone' | 'planningDone' | 'failure'>
> & {
  /** Force a stage (e.g. cancelled). */
  stage?: GenerationStage
}

const PHASE_FROM_STAGE: Record<GenerationStage, ImagingJobPhase> = {
  idle: 'plan',
  planning: 'plan',
  generating: 'generate',
  assembling: 'assemble',
  completed: 'assemble',
  failed: 'assemble',
  cancelled: 'assemble',
}

export function imagingPhaseFromStage(stage: GenerationStage): ImagingJobPhase {
  return PHASE_FROM_STAGE[stage]
}

export function progressCopyForJob(job: Pick<ImagingJob, 'stage' | 'provider' | 'status'>) {
  if (job.status === 'failed') return labelForStage('failed')
  if (job.status === 'cancelled') return labelForStage('cancelled')
  if (job.status === 'completed') return labelForStage('completed')
  const base = labelForStage(job.stage)
  if (job.stage === 'generating' && job.provider.tier === 'pro') {
    return 'Building three pro imaging directions…'
  }
  return base
}

function newJobId() {
  return `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/** Create a queued imaging job with honest provider readiness baked in. */
export function createImagingJob(options?: {
  conceptTotal?: number
  provider?: ProviderReadiness
}): ImagingJob {
  const provider = options?.provider ?? getProviderReadiness()
  const now = Date.now()
  const stage: GenerationStage = 'planning'
  const job: ImagingJob = {
    id: newJobId(),
    status: 'queued',
    phase: 'plan',
    stage,
    conceptTotal: Math.max(1, options?.conceptTotal ?? 3),
    conceptsDone: 0,
    planningDone: false,
    provider,
    progressCopy: progressCopyForJob({ stage, provider, status: 'queued' }),
    failure: null,
    createdAt: now,
    updatedAt: now,
  }
  return job
}

/** Advance job state from pipeline progress (plan → generate → assemble). */
export function advanceImagingJob(job: ImagingJob, patch: ImagingJobPatch = {}): ImagingJob {
  const planningDone = patch.planningDone ?? job.planningDone
  const conceptsDone = Math.min(
    job.conceptTotal,
    Math.max(0, patch.conceptsDone ?? job.conceptsDone),
  )
  let status = patch.status ?? job.status
  let stage = patch.stage
  let failure = patch.failure === undefined ? job.failure : patch.failure

  if (status === 'cancelled') {
    stage = stage ?? 'cancelled'
  } else if (status === 'failed') {
    stage = stage ?? 'failed'
    failure = failure ?? structuredAiFailure(new Error('Imaging failed'))
  } else if (status === 'completed') {
    stage = stage ?? 'completed'
  } else {
    status = status === 'queued' ? 'running' : status
    stage = stage ?? stageForPipeline(conceptsDone, job.conceptTotal, planningDone)
    if (planningDone && conceptsDone >= job.conceptTotal && status === 'running') {
      stage = 'assembling'
    }
  }

  const next: ImagingJob = {
    ...job,
    status,
    stage,
    phase: imagingPhaseFromStage(stage),
    conceptsDone,
    planningDone,
    failure,
    progressCopy: progressCopyForJob({ stage, provider: job.provider, status }),
    updatedAt: Date.now(),
  }
  return next
}

/** Mark planning complete and move into generate. */
export function markImagingPlanningDone(job: ImagingJob): ImagingJob {
  return advanceImagingJob(job, { planningDone: true, status: 'running', conceptsDone: 0 })
}

/** Record one concept finished; moves to assemble when all are done. */
export function markImagingConceptDone(job: ImagingJob): ImagingJob {
  const conceptsDone = job.conceptsDone + 1
  if (conceptsDone >= job.conceptTotal) {
    return advanceImagingJob(job, {
      planningDone: true,
      conceptsDone: job.conceptTotal,
      status: 'running',
      stage: 'assembling',
    })
  }
  return advanceImagingJob(job, {
    planningDone: true,
    conceptsDone,
    status: 'running',
  })
}

export function completeImagingJob(job: ImagingJob): ImagingJob {
  return advanceImagingJob(job, {
    planningDone: true,
    conceptsDone: job.conceptTotal,
    status: 'completed',
    stage: 'completed',
  })
}

export function failImagingJob(job: ImagingJob, error: unknown): ImagingJob {
  return advanceImagingJob(job, {
    status: 'failed',
    stage: 'failed',
    failure: structuredAiFailure(error),
  })
}

export function cancelImagingJob(job: ImagingJob): ImagingJob {
  return advanceImagingJob(job, { status: 'cancelled', stage: 'cancelled' })
}

/** Ordered phases for progress UI (maps to GENERATION_PROGRESS_STAGES). */
export const IMAGING_PIPELINE_PHASES: ImagingJobPhase[] = ['plan', 'generate', 'assemble']

export function imagingStageList() {
  return GENERATION_PROGRESS_STAGES.map((stage, index) => ({
    stage,
    phase: IMAGING_PIPELINE_PHASES[index]!,
    label: labelForStage(stage),
  }))
}

/**
 * Recovery hint after failure — preserves the idea; never claims a charge.
 * Free path has no credits; pro path still says "no credit charged" for future billing.
 */
export function imagingRecoveryHint(job: ImagingJob): string {
  if (job.failure?.rateLimited) {
    return job.failure.actionHint
  }
  if (job.provider.tier === 'pro') {
    return 'Your idea is safe — no generation credit was charged. Try again, or keep editing the idea.'
  }
  return job.failure?.actionHint || 'Try again, or edit the idea and create once more.'
}
