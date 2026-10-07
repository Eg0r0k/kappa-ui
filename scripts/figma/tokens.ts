import { type CssRules, itemCssFromSource } from '../lib/registry-css.ts'
import { isColor, parseColor, withAlpha } from './color.ts'
import type {
  Alias,
  EffectStyleToken,
  Rgba,
  ShadowLayer,
  TextStyleToken,
  TokenPayload,
  TokenScope,
  TokenVariable,
} from './payload.ts'

export type TokenSources = { tokens: string; theme: string; tailwind: string }
export type TokenOptions = { theme: 'light' | 'dark'; prune: boolean }
export type TokenResult = { payload: TokenPayload; gamutMapped: string[] }

type ToneValue =
  { kind: 'theme'; name: string } | { kind: 'tone'; key: string } | { kind: 'mix'; key: string; fraction: number }

const REM = 16
const COLOR_SCOPES: TokenScope[] = ['ALL_FILLS', 'STROKE_COLOR', 'EFFECT_COLOR']
const TONE_ORDER = ['tone', 'foreground', 'text', 'soft', 'soft-foreground', 'border', 'border-subtle']
const DISABLED = [
  ['disabled', 'disabled-opacity'],
  ['disabled-container', 'disabled-container-opacity'],
] as const
const THEME_COLOR = /^--theme\(--color-([a-z-]+)(?:, .+)?\)$/
const TONE_VAR = /^var\(--tone(?:-([a-z-]+))?\)$/
const TONE_MIX = /^color-mix\(in oklab, var\(--tone(?:-([a-z-]+))?\) ([\d.]+)%, transparent\)$/

const pxOf = (value: string | undefined) => {
  const match = /^(-?[\d.]+)(px|rem)?$/.exec(value ?? '')
  if (!match) throw new Error(`Unsupported length: ${value}`)
  return Number(match[1]) * (match[2] === 'rem' ? REM : 1)
}

const fractionOf = (value: string | undefined) => {
  const match = /^([\d.]+)%$/.exec(value ?? '')
  if (!match) throw new Error(`Unsupported percentage: ${value}`)
  return Number(match[1]) / 100
}

const splitTopLevel = (value: string, separator: string) => {
  const parts = ['']
  let depth = 0
  for (const char of value) {
    if (char === '(') depth++
    if (char === ')') depth--
    if (char === separator && depth === 0) parts.push('')
    else parts[parts.length - 1] += char
  }
  return parts.map((part) => part.trim()).filter(Boolean)
}

const variablesOf = (sources: TokenSources, theme: TokenOptions['theme']) => {
  const tokens = itemCssFromSource(sources.tokens).cssVars ?? {}
  const base = itemCssFromSource(sources.theme).cssVars ?? {}
  const dark = theme === 'dark' ? { ...base.dark, ...tokens.dark } : {}
  return {
    vars: { ...base.light, ...tokens.light, ...dark } as Record<string, string>,
    themeVars: { ...base.theme, ...tokens.theme } as Record<string, string>,
  }
}

const colorVariable = (name: string, value: Rgba, code: string): TokenVariable => ({
  id: `Color/${name}`,
  collection: 'Color',
  name,
  type: 'COLOR',
  value,
  code,
  scopes: COLOR_SCOPES,
})

const colorsOf = (vars: Record<string, string>) => {
  const variables: TokenVariable[] = []
  const gamutMapped: string[] = []
  for (const [name, value] of Object.entries(vars)) {
    if (!isColor(value)) continue
    const { rgba, mapped } = parseColor(value)
    variables.push(colorVariable(name, rgba, `var(--${name})`))
    if (mapped) gamutMapped.push(`Color/${name}`)
  }
  const foreground = variables.find((variable) => variable.id === 'Color/foreground')
  if (!foreground) throw new Error('Missing --foreground')
  for (const [name, opacity] of DISABLED) {
    const value = withAlpha(foreground.value as Rgba, fractionOf(vars[opacity]))
    const code = `color-mix(in oklab, var(--foreground) var(--${opacity}), transparent)`
    variables.push(colorVariable(`state/${name}`, value, code))
  }
  return { variables, gamutMapped }
}

const propertyOf = (key: string) => (key === 'tone' ? '--tone' : `--tone-${key}`)

const toneDeclarationsOf = (rules: CssRules) =>
  Object.fromEntries(
    Object.entries(rules)
      .filter((entry): entry is [string, string] => entry[0].startsWith('--tone') && typeof entry[1] === 'string')
      .map(([property, value]) => [property === '--tone' ? 'tone' : property.slice('--tone-'.length), value]),
  )

const selectorsOf = (key: string) => key.split(',').map((selector) => selector.trim())

const toneGroupsOf = (tailwind: string) => {
  const css = itemCssFromSource(tailwind).css ?? {}
  const layer = css['@layer base']
  if (typeof layer !== 'object') throw new Error('Missing @layer base in core tailwind.css')
  const rules = Object.entries(layer).filter((entry): entry is [string, CssRules] => typeof entry[1] === 'object')
  const base = rules.find(([key]) => selectorsOf(key).includes('[data-slot][data-color]'))
  if (!base) throw new Error('Missing the [data-slot][data-color] rule in core tailwind.css')
  const groups = new Map<string, Record<string, string>>()
  for (const [key, body] of rules) {
    for (const selector of selectorsOf(key)) {
      const color = /^\[data-slot\]\[data-color="([a-z-]+)"\]$/.exec(selector)?.[1]
      if (color) groups.set(color, { ...toneDeclarationsOf(base[1]), ...toneDeclarationsOf(body) })
    }
  }
  for (const [key, body] of Object.entries(css)) {
    const group = /^@utility tone-([a-z-]+)$/.exec(key)?.[1]
    if (group && typeof body === 'object') groups.set(group, toneDeclarationsOf(body))
  }
  return groups
}

const toneValueOf = (group: string, key: string, value: string): ToneValue => {
  const theme = THEME_COLOR.exec(value)
  if (theme) return { kind: 'theme', name: theme[1] }
  const tone = TONE_VAR.exec(value)
  if (tone) return { kind: 'tone', key: tone[1] ?? 'tone' }
  const mix = TONE_MIX.exec(value)
  if (mix) return { kind: 'mix', key: mix[1] ?? 'tone', fraction: Number(mix[2]) / 100 }
  throw new Error(`Unsupported tone value in ${group}: ${propertyOf(key)}: ${value}`)
}

const rankOf = (key: string) => {
  const rank = TONE_ORDER.indexOf(key)
  return rank === -1 ? TONE_ORDER.length : rank
}

const tonesOf = (groups: Map<string, Record<string, string>>, colors: TokenVariable[]): TokenVariable[] => {
  const colorValues = new Map(colors.map((variable) => [variable.id, variable.value as Rgba]))
  const colorOf = (name: string) => {
    const value = colorValues.get(`Color/${name}`)
    if (!value) throw new Error(`Unknown theme colour --color-${name}`)
    return value
  }
  const parsed = (group: string, key: string) => {
    const value = groups.get(group)?.[key]
    if (value === undefined) throw new Error(`Tone ${group} has no ${propertyOf(key)}`)
    return toneValueOf(group, key, value)
  }
  const rgbaOf = (group: string, key: string): Rgba => {
    const value = parsed(group, key)
    if (value.kind === 'theme') return colorOf(value.name)
    if (value.kind === 'tone') return rgbaOf(group, value.key)
    return withAlpha(rgbaOf(group, value.key), value.fraction)
  }
  const tokenValueOf = (group: string, key: string): TokenVariable['value'] => {
    const value = parsed(group, key)
    if (value.kind === 'theme') {
      colorOf(value.name)
      return { alias: `Color/${value.name}` }
    }
    if (value.kind === 'tone') {
      parsed(group, value.key)
      return { alias: `Tone/${group}/${value.key}` }
    }
    return rgbaOf(group, key)
  }
  return [...groups].flatMap(([group, declarations]) =>
    Object.keys(declarations)
      .sort((a, b) => rankOf(a) - rankOf(b))
      .map((key) => ({
        id: `Tone/${group}/${key}`,
        collection: 'Tone',
        name: `${group}/${key}`,
        type: 'COLOR' as const,
        value: tokenValueOf(group, key),
        code: `var(${propertyOf(key)})`,
        scopes: COLOR_SCOPES,
      })),
  )
}

const radiusVariable = (name: string, value: number | Alias): TokenVariable => ({
  id: `Radius/${name}`,
  collection: 'Radius',
  name,
  type: 'FLOAT',
  value,
  code: `var(--${name})`,
  scopes: ['CORNER_RADIUS'],
})

const radiiOf = (vars: Record<string, string>, themeVars: Record<string, string>) => {
  const radius = pxOf(vars.radius)
  const derived = Object.entries(themeVars)
    .filter(([name]) => name.startsWith('radius-'))
    .map(([name, value]) => {
      if (value === 'var(--radius)') return radiusVariable(name, { alias: 'Radius/radius' })
      const factor = /^calc\(var\(--radius\) \* ([\d.]+)\)$/.exec(value)?.[1]
      if (!factor) throw new Error(`Unsupported radius: --${name}: ${value}`)
      return radiusVariable(name, Math.round(radius * Number(factor) * 100) / 100)
    })
  return [radiusVariable('radius', radius), ...derived]
}

const textStylesOf = (vars: Record<string, string>): TextStyleToken[] =>
  Object.keys(vars).flatMap((key) => {
    const match = /^typescale-([a-z]+)-([a-z]+)-size$/.exec(key)
    if (!match) return []
    const [, role, size] = match
    const fontWeight = Number(vars[`typescale-${role}-${size}-weight`])
    if (!Number.isInteger(fontWeight)) throw new Error(`Missing --typescale-${role}-${size}-weight`)
    const lineHeight = pxOf(vars[`typescale-${role}-${size}-line-height`])
    return [{ id: `Text/${role}/${size}`, name: `${role}/${size}`, fontSize: pxOf(vars[key]), lineHeight, fontWeight }]
  })

const shadowLayerOf = (layer: string): ShadowLayer => {
  const parts = splitTopLevel(layer, ' ')
  if (parts.length !== 5) throw new Error(`Unsupported shadow layer: ${layer}`)
  const [x, y, blur, spread] = parts.slice(0, 4).map(pxOf)
  return { x, y, blur, spread, color: parseColor(parts[4]).rgba }
}

const effectStylesOf = (vars: Record<string, string>): EffectStyleToken[] =>
  Object.entries(vars).flatMap(([key, value]) => {
    const size = /^shadow-([a-z0-9]+)$/.exec(key)?.[1]
    if (!size) return []
    return [
      { id: `Effect/shadow/${size}`, name: `shadow/${size}`, layers: splitTopLevel(value, ',').map(shadowLayerOf) },
    ]
  })

export const tokensOf = (sources: TokenSources, options: TokenOptions): TokenResult => {
  const { vars, themeVars } = variablesOf(sources, options.theme)
  const colors = colorsOf(vars)
  const tones = tonesOf(toneGroupsOf(sources.tailwind), colors.variables)
  return {
    payload: {
      theme: options.theme,
      prune: options.prune,
      variables: [...colors.variables, ...tones, ...radiiOf(vars, themeVars)],
      textStyles: textStylesOf(vars),
      effectStyles: effectStylesOf(vars),
    },
    gamutMapped: colors.gamutMapped,
  }
}
