import { describe, expect, it } from 'vitest'
import {
  AI_PROMPT_MAX_CHARS,
  AI_RETRY_LEAD_MS,
  AI_VARIANT_GAP_MS,
  AI_VARIANT_GAP_STEP_MS,
  analyzeScene,
  buildAiThumbnailPrompt,
  buildPollinationsCandidateUrls,
  clampAiPrompt,
  friendlyAiHttpMessage,
  sanitizeSceneText,
  suggestAiStyle,
  titleFromScene,
  userFacingAiError,
  visualSceneFromHint,
  waitMsBeforeLook,
} from './aiThumbnail'
import { studioPaletteForScene } from './studioLooks'
import { LOCAL_LOOK_RECIPES, cssFilterForGrade } from './aiLooks'
import { apiLookBudget } from './aiConfig'
import { splitTitleLines, TITLE_POSITION_PRESETS } from './titleKit'
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
    expect(titleFromScene('cute cartoon fox in a sunny jungle, big eyes', '')).toBe(
      'cute cartoon fox in a sunny jungle',
    )
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
    expect(prompt).toMatch(/singer|music-video|Tamil cinema/i)
    expect(prompt).not.toMatch(/\|/)
    expect(prompt).not.toMatch(/YOUR TITLE HERE/)
    expect(prompt).toMatch(/no text/i)
    expect(prompt).toMatch(/no watermarks/i)
    expect(prompt).toMatch(/no collage/i)
    expect(prompt).toMatch(/no split screen/i)
    expect(prompt).toMatch(/SINGLE full-bleed (photograph|hero frame)/i)
    expect(prompt).toMatch(/negative space/i)
    expect(prompt).toMatch(/never a collage/i)
    expect(prompt).toMatch(/do not paint any words/i)
    expect(prompt).toMatch(/phone-tile/i)
    expect(prompt).toMatch(/oversized|85mm|catchlights/i)
    expect(prompt.length).toBeLessThanOrEqual(AI_PROMPT_MAX_CHARS)
  })

  it('varies composition across the 3 looks', () => {
    const left = buildAiThumbnailPrompt({
      title: 'Hook',
      niche,
      platform,
      hint: 'creator pointing at a laptop',
      variantIndex: 0,
    })
    const right = buildAiThumbnailPrompt({
      title: 'Hook',
      niche,
      platform,
      hint: 'creator pointing at a laptop',
      variantIndex: 1,
    })
    expect(left).toMatch(/LEFT third/i)
    expect(right).toMatch(/RIGHT third/i)
    expect(left).not.toBe(right)
  })

  it('keeps the scene subject when the prompt is clamped', () => {
    const kept = clampAiPrompt(['one coherent scene only: cute pandas', 'x'.repeat(2000)], 80)
    expect(kept).toMatch(/cute pandas/)
    expect(kept.length).toBeLessThanOrEqual(80)
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
    expect(prompt).toMatch(/animals remain the only subjects|ONLY the described animals/i)
    expect(prompt).not.toMatch(/singer or instrument as clear hero subject/)
  })
})

describe('friendlyAiHttpMessage', () => {
  it('keeps 402/429 copy free of provider jargon', () => {
    const msg402 = friendlyAiHttpMessage(402)
    const msg429 = friendlyAiHttpMessage(429)
    expect(msg402).toMatch(/busy/i)
    expect(msg402).toMatch(/minute|try again/i)
    expect(msg402).not.toMatch(/402|Pollinations|API key|sequentially/i)
    expect(msg429).not.toMatch(/429|Pollinations/i)
  })
})

describe('userFacingAiError', () => {
  it('never mentions CORS, ad-block, or Pollinations', () => {
    const msg = userFacingAiError(new Error('Failed to fetch')).message
    expect(msg).toMatch(/studio looks|try again|reach/i)
    expect(msg).not.toMatch(/CORS|ad-block|Pollinations|402|API key/i)
    expect(userFacingAiError(new Error('No premium AI backend configured.')).message).not.toMatch(
      /premium|Worker|fal/i,
    )
  })
})

describe('studioPaletteForScene', () => {
  it('nudges glow from the scene without copying slogans onto the still', () => {
    const niche = getNiche('music')
    const jungle = studioPaletteForScene('cute cartoon animals in the woods', niche, 'music-stage')
    const neon = studioPaletteForScene('rgb gamer neon room', niche, 'dark-moody')
    expect(jungle.glow).not.toBe(neon.glow)
    expect(jungle.deep).toBe(niche.background[0])
  })
})

describe('waitMsBeforeLook', () => {
  it('waits a short beat before premium looks 2 and 3', () => {
    expect(waitMsBeforeLook(0)).toBe(0)
    expect(waitMsBeforeLook(1)).toBe(AI_VARIANT_GAP_MS)
    expect(waitMsBeforeLook(2)).toBe(AI_VARIANT_GAP_MS + AI_VARIANT_GAP_STEP_MS)
    expect(waitMsBeforeLook(1, { firstOfRetryBatch: true })).toBe(AI_RETRY_LEAD_MS)
  })
})

describe('visualSceneFromHint', () => {
  it('turns slogan + language into a photograph, not a title card', () => {
    const visual = visualSceneFromHint('couple goals in tamil')
    expect(visual).toMatch(/romantic couple/i)
    expect(visual).toMatch(/cinema/i)
    expect(visual).not.toMatch(/couple goals in tamil/i)
  })

  it('rewrites song-cover meta prompts into a singer still', () => {
    const visual = visualSceneFromHint('cinematic still that matches: Tamil song cover')
    expect(visual).toMatch(/singer|music-video/i)
    expect(visual).not.toMatch(/cinematic still that matches/i)
    expect(visual).not.toMatch(/^tamil song cover$/i)
  })
})

describe('free path look budget', () => {
  it('only spends one model call on Pollinations, then local looks fill the rest', () => {
    expect(apiLookBudget('pollinations')).toBe(1)
    expect(apiLookBudget('worker')).toBe(3)
    expect(LOCAL_LOOK_RECIPES).toHaveLength(3)
    expect(cssFilterForGrade(LOCAL_LOOK_RECIPES[1]!.grade)).toMatch(/sepia/)
  })
})

describe('title kit', () => {
  it('has left/center/right presets and splits 2-line titles', () => {
    expect(TITLE_POSITION_PRESETS.map((item) => item.id)).toEqual(['left', 'center', 'right'])
    expect(splitTitleLines('I SPENT $1', 'AND THIS HAPPENED')).toEqual([
      'I SPENT $1',
      'AND THIS HAPPENED',
    ])
  })
})

describe('buildPollinationsCandidateUrls', () => {
  it('returns flux primary plus leaner fallbacks on image.pollinations.ai', () => {
    const urls = buildPollinationsCandidateUrls('kids animals scene', 1280, 720, 42, 'bust1')
    expect(urls).toHaveLength(3)
    expect(urls[0]?.label).toBe('flux')
    expect(urls[1]?.label).toBe('turbo')
    expect(urls[2]?.label).toBe('flux+enhance')
    for (const item of urls) {
      expect(item.url).toMatch(/^https:\/\/image\.pollinations\.ai\/prompt\//)
      expect(item.url).toMatch(/width=1280/)
      expect(item.url).toMatch(/height=720/)
      expect(item.url).toMatch(/seed=42/)
      expect(item.url).toMatch(/t=bust1/)
      expect(item.url).toMatch(/nologo=true/)
      expect(item.url).toMatch(/negative=/)
    }
    expect(urls[0]?.url).toMatch(/model=flux/)
    expect(urls[0]?.url).not.toMatch(/enhance=true/)
    expect(urls[1]?.url).toMatch(/model=turbo/)
    expect(urls[2]?.url).toMatch(/model=flux/)
    expect(urls[2]?.url).toMatch(/enhance=true/)
  })
})
