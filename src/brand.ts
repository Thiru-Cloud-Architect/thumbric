/** Product brand. GitHub Pages path matches repo name `thumbric`. */
export const PRODUCT_NAME = 'Thumbric'

export const PRODUCT_NAME_FULL = 'Thumbric.ai'

export const PRODUCT_TAGLINE = 'Free YouTube, Shorts & social thumbnails'

/** Override with VITE_SITE_URL in CI. Default is the live custom domain. */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://thumbric.app/'
).replace(/\/?$/, '/')

export const DOWNLOAD_PREFIX = 'thumbric'

export const WATERMARK_LABEL = `${PRODUCT_NAME_FULL} · free preview`

export const UI_BUILD = '2026.10.08-nav-polish'
