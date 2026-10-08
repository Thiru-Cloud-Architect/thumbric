import type { ThumbInput } from './render'
import { textBoxFromInput } from './render'

export type ExportCheck = {
  id: string
  ok: boolean
  label: string
  fixable?: boolean
}

export function validateExport(input: ThumbInput): ExportCheck[] {
  const { platform } = input
  const title = input.title.trim()
  const box = textBoxFromInput(input)
  const clipped =
    box.x < -8 ||
    box.y < -8 ||
    box.x + Math.min(box.w, platform.width * 0.5) > platform.width + 8 ||
    box.y > platform.height - 24

  const checks: ExportCheck[] = [
    {
      id: 'size',
      ok: platform.width === 1280 && platform.height === 720 ? true : platform.width > 0,
      label: `${platform.width} × ${platform.height}`,
    },
    {
      id: 'image',
      ok: Boolean(input.photo),
      label: input.photo ? 'Image loaded' : 'No photo / AI still yet',
      fixable: !input.photo,
    },
    {
      id: 'title',
      ok: title.length > 0,
      label: title ? 'Headline present' : 'Headline empty',
      fixable: !title,
    },
    {
      id: 'clip',
      ok: !clipped,
      label: clipped ? 'Headline may be partly outside the canvas' : 'Text inside canvas',
      fixable: clipped,
    },
    {
      id: 'safe',
      ok: box.x >= platform.width * 0.02 && box.y >= platform.height * 0.02,
      label:
        box.x >= platform.width * 0.02
          ? 'Safe-area placement OK'
          : 'Text near edge — check safe zone',
      fixable: box.x < platform.width * 0.02,
    },
    {
      id: 'readable',
      ok: input.titleFontSizePx >= 64,
      label:
        input.titleFontSizePx >= 64
          ? 'Text size looks mobile-readable'
          : 'Type may be small on phones',
      fixable: input.titleFontSizePx < 64,
    },
  ]

  return checks
}

export function hasBlockingExportIssue(checks: ExportCheck[]) {
  return checks.some((c) => !c.ok && (c.id === 'clip' || c.id === 'size'))
}
