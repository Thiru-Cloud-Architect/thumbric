/**
 * Phase 1A/1B — deterministic refine + “Improve this thumbnail” issues.
 * No unsupported CTR claims.
 */

import { clampTitleFontSize } from './fonts'
import type { LayoutId } from './layout'
import type { TextStyleId } from './textStyle'
import type { TitleAlign } from './titleKit'
import { TITLE_OUTLINE_AUTO } from './titleKit'

export type DesignSnapshot = {
  title: string
  titleLine2: string
  titleFontSizePx: number
  titleAlign: TitleAlign
  titleFill: string
  titleOutlineWidth: number
  titleShadow: boolean
  textStyleId: TextStyleId
  layout: LayoutId
  stickerCount: number
  hasPhoto: boolean
}

export type DesignIssue = {
  id: string
  severity: 'warn' | 'info'
  message: string
  fixId: RefineActionId
}

export type RefineActionId =
  | 'bigger-type'
  | 'shorter-text'
  | 'punchier'
  | 'cleaner'
  | 'more-dramatic'
  | 'more-premium'
  | 'mobile'
  | 'face-space'

export type RefinePatch = Partial<{
  title: string
  titleLine2: string
  titleFontSizePx: number
  titleAlign: TitleAlign
  titleFill: string
  titleOutlineWidth: number
  titleShadow: boolean
  textStyleId: TextStyleId
  layout: LayoutId
  clearStickers: boolean
  status: string
}>

const REFINE_CHIPS: { id: RefineActionId; label: string }[] = [
  { id: 'more-dramatic', label: 'More dramatic' },
  { id: 'bigger-type', label: 'Bigger type' },
  { id: 'shorter-text', label: 'Shorter text' },
  { id: 'punchier', label: 'Punchier' },
  { id: 'cleaner', label: 'Cleaner' },
  { id: 'more-premium', label: 'More premium' },
  { id: 'mobile', label: 'Better on mobile' },
  { id: 'face-space', label: 'More face space' },
]

export function refineChipList() {
  return REFINE_CHIPS
}

/** Heuristic issues from current design — not CTR. */
export function analyzeDesignIssues(snap: DesignSnapshot): DesignIssue[] {
  const issues: DesignIssue[] = []
  const full = `${snap.title} ${snap.titleLine2}`.trim()
  const words = full.split(/\s+/).filter(Boolean)

  if (!snap.hasPhoto) {
    issues.push({
      id: 'no-photo',
      severity: 'warn',
      message: 'No backdrop yet — add a photo or generate an AI concept.',
      fixId: 'cleaner',
    })
  }
  if (snap.titleFontSizePx < 72) {
    issues.push({
      id: 'small-type',
      severity: 'warn',
      message: 'Title is small for a phone tile.',
      fixId: 'bigger-type',
    })
  }
  if (words.length > 6) {
    issues.push({
      id: 'long-text',
      severity: 'warn',
      message: 'Text may be hard to read on mobile — shorten the hook.',
      fixId: 'shorter-text',
    })
  }
  if (snap.stickerCount > 1) {
    issues.push({
      id: 'clutter',
      severity: 'info',
      message: 'Stickers may compete with the face and title.',
      fixId: 'cleaner',
    })
  }
  if (snap.layout !== 'photo-full' && snap.hasPhoto) {
    issues.push({
      id: 'subject-size',
      severity: 'info',
      message: 'Subject may be too small — try a full-bleed photo.',
      fixId: 'face-space',
    })
  }
  if (snap.titleOutlineWidth === 0 || (snap.titleOutlineWidth < 0 && snap.textStyleId === 'minimal')) {
    issues.push({
      id: 'low-contrast',
      severity: 'info',
      message: 'Title may lack outline contrast on busy backgrounds.',
      fixId: 'punchier',
    })
  }

  return issues.slice(0, 4)
}

export function applyRefineAction(id: RefineActionId, snap: DesignSnapshot): RefinePatch {
  switch (id) {
    case 'bigger-type':
      return {
        titleFontSizePx: clampTitleFontSize(snap.titleFontSizePx + 18),
        status: 'Bigger type — readable on a phone tile.',
      }
    case 'shorter-text': {
      const words = snap.title.trim().split(/\s+/).filter(Boolean)
      const next = words.slice(0, Math.min(4, words.length)).join(' ').toUpperCase() || snap.title
      return {
        title: next,
        titleLine2: '',
        titleFontSizePx: clampTitleFontSize(Math.max(snap.titleFontSizePx, 88)),
        status: 'Shorter hook — fewer words, bigger impact.',
      }
    }
    case 'punchier':
      return {
        textStyleId: 'yellow-pop',
        titleOutlineWidth: Math.max(14, snap.titleOutlineWidth < 0 ? 14 : snap.titleOutlineWidth),
        titleShadow: true,
        titleFill: snap.titleFill || '#FFE44D',
        status: 'Punchier title — high contrast for the feed.',
      }
    case 'cleaner':
      return {
        titleAlign: 'left',
        layout: 'photo-full',
        clearStickers: true,
        titleOutlineWidth: TITLE_OUTLINE_AUTO,
        status: 'Cleaner layout — full-bleed photo, title on the left.',
      }
    case 'more-dramatic':
      return {
        textStyleId: 'red-alert',
        titleOutlineWidth: Math.max(16, snap.titleOutlineWidth < 0 ? 16 : snap.titleOutlineWidth),
        titleShadow: true,
        titleFontSizePx: clampTitleFontSize(snap.titleFontSizePx + 10),
        status: 'More dramatic — stronger outline and urgency.',
      }
    case 'more-premium':
      return {
        textStyleId: 'minimal',
        titleFill: '#FFFFFF',
        titleOutlineWidth: 8,
        titleShadow: true,
        titleAlign: 'left',
        layout: 'photo-full',
        clearStickers: true,
        status: 'More premium — clean type, less clutter.',
      }
    case 'mobile':
      return {
        titleFontSizePx: clampTitleFontSize(Math.max(snap.titleFontSizePx, 96)),
        titleLine2: snap.titleLine2 && snap.titleLine2.split(/\s+/).length > 3 ? '' : snap.titleLine2,
        titleShadow: true,
        titleOutlineWidth: Math.max(12, snap.titleOutlineWidth < 0 ? 12 : snap.titleOutlineWidth),
        status: 'Tuned for mobile readability.',
      }
    case 'face-space':
      return {
        layout: 'photo-full',
        titleAlign: 'left',
        clearStickers: true,
        status: 'More face space — full bleed, title on the left.',
      }
    default:
      return { status: 'Nothing to change.' }
  }
}

/** Map freeform refine text to an action id. */
export function parseRefineIntent(raw: string): RefineActionId | null {
  const t = raw.toLowerCase().trim()
  if (!t) return null
  if (/short|fewer word|less text|tighten/.test(t)) return 'shorter-text'
  if (/big(ger)?|larger|readable|phone/.test(t)) return 'bigger-type'
  if (/dramatic|urgent|intense|bold(er)?/.test(t)) return 'more-dramatic'
  if (/premium|luxury|clean(er)?|minimal|less busy|declutter/.test(t)) {
    if (/clean|minimal|busy|declutter/.test(t)) return 'cleaner'
    return 'more-premium'
  }
  if (/punch|contrast|pop|yellow/.test(t)) return 'punchier'
  if (/mobile|small screen/.test(t)) return 'mobile'
  if (/face|subject|closer|bigger (face|person|subject)/.test(t)) return 'face-space'
  if (/clean/.test(t)) return 'cleaner'
  return null
}
