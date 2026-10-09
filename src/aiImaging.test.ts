import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  advanceImagingJob,
  cancelImagingJob,
  completeImagingJob,
  createImagingJob,
  failImagingJob,
  imagingPhaseFromStage,
  imagingRecoveryHint,
  imagingStageList,
  markImagingConceptDone,
  markImagingPlanningDone,
} from './aiImaging'

describe('ImagingJob pipeline', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('creates a queued plan→generate→assemble job on the free path', () => {
    vi.stubEnv('VITE_API_BASE', '')
    vi.stubEnv('VITE_FAL_KEY', '')
    const job = createImagingJob()
    expect(job.status).toBe('queued')
    expect(job.phase).toBe('plan')
    expect(job.stage).toBe('planning')
    expect(job.provider.tier).toBe('free')
    expect(job.provider.statusLabel).toBe('Free preview engine')
    expect(job.conceptTotal).toBe(3)
    expect(job.progressCopy).toMatch(/Understanding/i)
  })

  it('advances plan → generate → assemble → completed', () => {
    vi.stubEnv('VITE_API_BASE', '')
    vi.stubEnv('VITE_FAL_KEY', '')
    let job = createImagingJob({ conceptTotal: 3 })
    job = markImagingPlanningDone(job)
    expect(job.phase).toBe('generate')
    expect(job.stage).toBe('generating')
    expect(job.status).toBe('running')

    job = markImagingConceptDone(job)
    expect(job.conceptsDone).toBe(1)
    expect(job.phase).toBe('generate')

    job = markImagingConceptDone(job)
    job = markImagingConceptDone(job)
    expect(job.conceptsDone).toBe(3)
    expect(job.phase).toBe('assemble')
    expect(job.stage).toBe('assembling')

    job = completeImagingJob(job)
    expect(job.status).toBe('completed')
    expect(job.stage).toBe('completed')
    expect(job.progressCopy).toMatch(/ready/i)
  })

  it('preserves recovery copy on failure without claiming a charge on free path', () => {
    vi.stubEnv('VITE_API_BASE', '')
    vi.stubEnv('VITE_FAL_KEY', '')
    let job = createImagingJob()
    job = markImagingPlanningDone(job)
    job = failImagingJob(job, new Error('network'))
    expect(job.status).toBe('failed')
    expect(job.failure?.preserveConcepts).toBe(true)
    expect(imagingRecoveryHint(job)).toMatch(/try again/i)
  })

  it('uses pro progress copy when fal is configured', () => {
    vi.stubEnv('VITE_API_BASE', '')
    vi.stubEnv('VITE_FAL_KEY', 'fal_demo')
    let job = createImagingJob()
    job = markImagingPlanningDone(job)
    expect(job.provider.tier).toBe('pro')
    expect(job.progressCopy).toMatch(/pro imaging/i)
    job = failImagingJob(job, new Error('timeout'))
    expect(imagingRecoveryHint(job)).toMatch(/no generation credit/i)
  })

  it('maps stages to imaging phases and exposes the stage list', () => {
    expect(imagingPhaseFromStage('planning')).toBe('plan')
    expect(imagingPhaseFromStage('generating')).toBe('generate')
    expect(imagingPhaseFromStage('assembling')).toBe('assemble')
    expect(imagingStageList().map((item) => item.phase)).toEqual(['plan', 'generate', 'assemble'])
  })

  it('supports cancel and explicit assemble advance', () => {
    let job = createImagingJob()
    job = cancelImagingJob(job)
    expect(job.status).toBe('cancelled')
    job = createImagingJob()
    job = advanceImagingJob(job, {
      planningDone: true,
      conceptsDone: 3,
      status: 'running',
    })
    expect(job.stage).toBe('assembling')
  })
})
