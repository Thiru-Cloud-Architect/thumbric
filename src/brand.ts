/** Product brand. GitHub Pages path matches repo name `thumbric`. */
export const PRODUCT_NAME = 'Thumbric'

/** Header, titles, and footer. The live domain stays thumbric.app — no .ai suffix. */
export const PRODUCT_NAME_FULL = 'Thumbric'

export const PRODUCT_TAGLINE = 'Free YouTube, Shorts & social thumbnails'

/** Override with VITE_SITE_URL in CI. Default is the live custom domain. */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://thumbric.app/'
).replace(/\/?$/, '/')

export const DOWNLOAD_PREFIX = 'thumbric'

/** Mild corner mark for free downloads — keep short so it stays subtle. */
export const WATERMARK_LABEL = 'thumbric'

export const UI_BUILD = '2026.10.09-editor-ai'
