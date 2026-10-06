import { describe, expect, it } from 'vitest'
import { buildAiThumbnailPrompt, sanitizeSceneText, titleFromScene } from './aiThumbnail'
import { getNiche } from './niches'
import { getPlatform } from './platforms'

describe('sanitizeSceneText', () => {
  it('strips pipe / slash collage cues', () => {
    expect(sanitizeSceneText('Tamil Song Cover | Own Voice')).toBe('Tamil Song Cover Own Voice')
    expect(sanitizeSceneText('A / B \\ C')).toBe('A B C')
  })
})

describe('titleFromScene', () => {
  it('prefers a real user title', () => {
    expect(titleFromScene('ignored scene', 'My Real Title')).toBe('My Real Title')
  })

  it('derives a short title from the scene when title is empty', () => {
    expect(titleFromScene('Tamil Song Cover | Own Voice', '')).toBe('Tamil Song Cover Own Voice')
  })

  it('ignores the YOUR TITLE HERE placeholder', () => {
    expect(titleFromScene('warm stage singer', 'YOUR TITLE HERE')).toBe('warm stage singer')
  })

  it('falls back when scene is empty', () => {
    expect(titleFromScene('', '')).toBe('My Thumbnail')
  })
})

describe('buildAiThumbnailPrompt', () => {
  const niche = getNiche('music')
  const platform = getPlatform('youtube')

  it('frames a 16:9 YouTube still and bans collage / text / watermarks', () => {
    const prompt = buildAiThumbnailPrompt({
      title: '',
      niche,
      platform,
      hint: 'Tamil Song Cover | Own Voice',
    })
    expect(prompt).toMatch(/16:9/i)
    expect(prompt).toMatch(/YouTube thumbnail/i)
    expect(prompt).toMatch(/Tamil Song Cover Own Voice/)
    expect(prompt).not.toMatch(/\|/)
    expect(prompt).not.toMatch(/YOUR TITLE HERE/)
    expect(prompt).toMatch(/no text/i)
    expect(prompt).toMatch(/no watermarks/i)
    expect(prompt).toMatch(/no collage/i)
    expect(prompt).toMatch(/no split screen/i)
    expect(prompt).toMatch(/one coherent scene/i)
  })

  it('includes a real title as topic mood without forcing it into the image as text', () => {
    const prompt = buildAiThumbnailPrompt({
      title: 'Own Voice Cover',
      niche,
      platform,
      hint: 'Tamil singer on a warm stage',
    })
    expect(prompt).toMatch(/Own Voice Cover/)
    expect(prompt).toMatch(/Tamil singer on a warm stage/)
    expect(prompt).toMatch(/avoid:/i)
  })
})
