import { describe, expect, it } from 'vitest'
import {
  analyzeScene,
  buildAiThumbnailPrompt,
  buildPollinationsCandidateUrls,
  friendlyAiHttpMessage,
  sanitizeSceneText,
  suggestAiStyle,
  titleFromScene,
} from './aiThumbnail'
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

describe('analyzeScene / suggestAiStyle', () => {
  it('detects animals in woods without a human ask', () => {
    const cues = analyzeScene('cute cartoon animals playing in the woods')
    expect(cues.animals).toBe(true)
    expect(cues.cartoon).toBe(true)
    expect(cues.wantsHuman).toBe(false)
    expect(cues.nonHumanSubject).toBe(true)
  })

  it('suggests Kids/fun or Cartoon when Music stage is selected for animals', () => {
    expect(suggestAiStyle('cute cartoon animals playing in the woods', 'music-stage')).toBe(
      'cartoon',
    )
    expect(suggestAiStyle('puppy playing in a sunny park for kids', 'face-reaction')).toBe(
      'kids-fun',
    )
    expect(suggestAiStyle('cute cartoon animals playing in the woods', 'kids-fun')).toBeNull()
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
    expect(prompt).toMatch(/negative space/i)
    expect(prompt).toMatch(/320px/i)
  })

  it('includes style recipe when a chip is selected', () => {
    const prompt = buildAiThumbnailPrompt({
      title: 'Kids Animals',
      niche: getNiche('parenting'),
      platform,
      hint: 'cute cartoon animals in a sunny jungle',
      styleId: 'kids-fun',
    })
    expect(prompt).toMatch(/Kids \/ fun|kids content|cartoon/i)
    expect(prompt).toMatch(/cute cartoon animals/)
  })

  it('hard-bans human / kemonomimi faces when Music stage + animals woods', () => {
    const prompt = buildAiThumbnailPrompt({
      title: 'Cute animals',
      niche,
      platform,
      hint: 'cute cartoon animals playing in the woods',
      styleId: 'music-stage',
    })
    expect(prompt).toMatch(/cute cartoon animals playing in the woods/)
    expect(prompt).toMatch(/NO human face|no human/i)
    expect(prompt).toMatch(/kemonomimi/i)
    expect(prompt).toMatch(/furry humanoid/i)
    expect(prompt).toMatch(/animals remain the only subjects|ONLY the described non-human/i)
    expect(prompt).not.toMatch(/singer or instrument as clear hero subject/)
  })
})

describe('friendlyAiHttpMessage', () => {
  it('explains Pollinations 402 without raw jargon alone', () => {
    const msg = friendlyAiHttpMessage(402)
    expect(msg).toMatch(/rate-limited|payment|402/i)
    expect(msg).toMatch(/wait|try again/i)
  })
})

describe('buildPollinationsCandidateUrls', () => {
  it('returns flux primary plus leaner fallbacks on image.pollinations.ai', () => {
    const urls = buildPollinationsCandidateUrls('kids animals scene', 1280, 720, 42, 'bust1')
    expect(urls).toHaveLength(3)
    expect(urls[0]?.label).toBe('flux+enhance')
    expect(urls[1]?.label).toBe('flux')
    expect(urls[2]?.label).toBe('turbo')
    for (const item of urls) {
      expect(item.url).toMatch(/^https:\/\/image\.pollinations\.ai\/prompt\//)
      expect(item.url).toMatch(/width=1280/)
      expect(item.url).toMatch(/height=720/)
      expect(item.url).toMatch(/seed=42/)
      expect(item.url).toMatch(/t=bust1/)
      expect(item.url).toMatch(/nologo=true/)
    }
    expect(urls[0]?.url).toMatch(/model=flux/)
    expect(urls[0]?.url).toMatch(/enhance=true/)
    expect(urls[1]?.url).toMatch(/model=flux/)
    expect(urls[1]?.url).not.toMatch(/enhance=true/)
    expect(urls[2]?.url).toMatch(/model=turbo/)
  })
})
