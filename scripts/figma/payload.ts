export type Rgba = { r: number; g: number; b: number; a: number }
export type Alias = { alias: string }
export type TokenScope = 'ALL_FILLS' | 'STROKE_COLOR' | 'EFFECT_COLOR' | 'CORNER_RADIUS' | 'WIDTH_HEIGHT' | 'GAP'

export type TokenVariable = {
  id: string
  collection: string
  name: string
  type: 'COLOR' | 'FLOAT'
  value: Rgba | number | Alias
  code: string
  scopes: TokenScope[]
}

export type TextStyleToken = { id: string; name: string; fontSize: number; lineHeight: number; fontWeight: number }
export type ShadowLayer = { x: number; y: number; blur: number; spread: number; color: Rgba; inset?: true }
export type EffectStyleToken = { id: string; name: string; layers: ShadowLayer[] }

export type TokenPayload = {
  theme: 'light' | 'dark'
  prune: boolean
  variables: TokenVariable[]
  textStyles: TextStyleToken[]
  effectStyles: EffectStyleToken[]
}

export type IconToken = { id: string; name: string; svg: string }
export type IconPayload = { icons: IconToken[] }

export type ThumbPayload = { endpoint: string; only?: string[] }
export type ThumbExport = { name: string; svg: string; sentinels: Record<string, string> }

export type SyncReport = { created: string[]; updated: number; orphans: string[]; removed: string[] }
