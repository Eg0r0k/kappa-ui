export type ColorScheme = 'light' | 'dark'
export type Direction = 'ltr' | 'rtl'

export const tones = ['primary', 'neutral', 'destructive', 'success', 'warning', 'info'] as const
export type Tone = (typeof tones)[number]

export type PreviewState = {
  type: 'kappa:state'
  colorScheme: ColorScheme
  dir: Direction
  restart: number
  siteTheme: string
  color: Tone
  inspect: boolean
}

export type PreviewEvent =
  | { type: 'kappa:ready' }
  | { type: 'kappa:size'; height: number }
  | { type: 'kappa:error'; message: string }
  | { type: 'kappa:shortcut' }

const record = (data: unknown): data is Record<string, unknown> => typeof data === 'object' && data !== null

export const isPreviewState = (data: unknown): data is PreviewState =>
  record(data) &&
  data.type === 'kappa:state' &&
  (data.colorScheme === 'light' || data.colorScheme === 'dark') &&
  (data.dir === 'ltr' || data.dir === 'rtl') &&
  typeof data.restart === 'number' &&
  typeof data.siteTheme === 'string' &&
  tones.includes(data.color as Tone) &&
  typeof data.inspect === 'boolean'

export const isPreviewEvent = (data: unknown): data is PreviewEvent => {
  if (!record(data)) return false
  if (data.type === 'kappa:ready' || data.type === 'kappa:shortcut') return true
  if (data.type === 'kappa:size') return typeof data.height === 'number' && Number.isFinite(data.height)
  if (data.type === 'kappa:error') return typeof data.message === 'string'
  return false
}

export const previewPath = (name: string) => `/preview/${name}`
