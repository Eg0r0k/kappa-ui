import components from '~/assets/canvas/components.json'
import sizes from '~/assets/canvas/sizes.json'

export type CanvasSize = { width: number; height: number }
export type CanvasEntry = { slug: string; title: string; description: string; example: string }
export type CanvasComponent = CanvasEntry & { path: string; desktop: CanvasSize; phone: CanvasSize }
export type CanvasSizes = Record<string, { desktop: CanvasSize; phone: CanvasSize } | undefined>

const FALLBACK: CanvasSize = { width: 320, height: 160 }

export const canvasComponents = (
  entries: readonly CanvasEntry[] = components,
  measured: CanvasSizes = sizes,
): CanvasComponent[] =>
  entries.map((entry) => ({
    ...entry,
    path: `/docs/components/${entry.slug}`,
    desktop: measured[entry.slug]?.desktop ?? FALLBACK,
    phone: measured[entry.slug]?.phone ?? measured[entry.slug]?.desktop ?? FALLBACK,
  }))

export const CARD_PADDING = 48
export const CARD_CAPTION = 28
export const PLAQUE = { id: 'kappa-plaque', width: 460, height: 160 }
export const PHONE_BREAKPOINT = 640
export const MIN_USER_ZOOM = 0.75
export const MAX_USER_ZOOM = 1.6

/** The card's outer box: padding both sides and the caption, or the caption's width if the demo is narrower. */
export const footprint = (size: CanvasSize, title: string): CanvasSize => ({
  width: Math.max(size.width + CARD_PADDING, Math.ceil(title.length * 7.5) + 28),
  height: size.height + CARD_PADDING + CARD_CAPTION,
})

export const smooth = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)))
  return t * t * (3 - 2 * t)
}

/** Demos at their real size wherever the widest card fits the width minus 16px gutters; a short screen zooms out. */
export const baseZoom = (width: number, height: number, widest: number) =>
  Math.min(1, Math.max(0.45, Math.min((width - 32) / widest, height / 700)))

/**
 * The watch-face falloff for a card `dx, dy` screen pixels from the centre of a `2hx × 2hy` screen:
 * full size over most of the screen, shrinking and fading only near the edges, and drifting inward
 * so the gaps between shrinking cards don't open up. Measured against a screen at least 3:4 either
 * way, so a tall phone doesn't shrink everything left and right of the centre.
 */
export const falloff = (dx: number, dy: number, hx: number, hy: number) => {
  const rx = Math.max(hx, hy * 0.75)
  const ry = Math.max(hy, hx * 0.75)
  const d = Math.cbrt((Math.abs(dx) / rx) ** 3 + (Math.abs(dy) / ry) ** 3)
  return {
    scale: 1 - 0.58 * smooth(0.6, 1.18, d),
    opacity: 1 - smooth(0.96, 1.26, d),
    pull: 1 - 0.14 * smooth(0.6, 1.5, d),
  }
}
