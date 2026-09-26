export type NeutralName = 'neutral' | 'stone' | 'zinc' | 'slate' | 'brand'

export type SurfaceBorder = 'default' | 'strong' | 'brand' | 'none'

export type Surfaces = 'flat' | 'raised' | 'tinted'

export interface ThemeConfig {
  hue: number
  chroma: number
  neutral: NeutralName
  radius: number
  font: string
  surfaceBorder: SurfaceBorder
  surfaces: Surfaces
}

export interface ThemeFont {
  key: string
  name: string
  family: string
}

export const fonts: ThemeFont[] = [
  { key: 'inter', name: 'Inter', family: '"Inter Variable", "Inter"' },
  { key: 'geist', name: 'Geist', family: '"Geist"' },
  { key: 'manrope', name: 'Manrope', family: '"Manrope"' },
  { key: 'dm-sans', name: 'DM Sans', family: '"DM Sans"' },
  { key: 'figtree', name: 'Figtree', family: '"Figtree"' },
  { key: 'plus-jakarta-sans', name: 'Plus Jakarta Sans', family: '"Plus Jakarta Sans"' },
  { key: 'outfit', name: 'Outfit', family: '"Outfit"' },
  { key: 'space-grotesk', name: 'Space Grotesk', family: '"Space Grotesk"' },
  { key: 'ibm-plex-sans', name: 'IBM Plex Sans', family: '"IBM Plex Sans"' },
  { key: 'source-sans-3', name: 'Source Sans 3', family: '"Source Sans 3"' },
]

export const neutrals: { key: NeutralName; name: string; hue?: number; chroma: number }[] = [
  { key: 'neutral', name: 'Neutral', chroma: 0 },
  { key: 'stone', name: 'Stone', hue: 60, chroma: 0.006 },
  { key: 'zinc', name: 'Zinc', hue: 286, chroma: 0.006 },
  { key: 'slate', name: 'Slate', hue: 257, chroma: 0.018 },
  { key: 'brand', name: 'Brand', chroma: 0.014 },
]

export const presets = [
  { name: 'Blue', hue: 262, chroma: 0.2 },
  { name: 'Indigo', hue: 277, chroma: 0.2 },
  { name: 'Violet', hue: 293, chroma: 0.22 },
  { name: 'Pink', hue: 350, chroma: 0.2 },
  { name: 'Red', hue: 25, chroma: 0.2 },
  { name: 'Orange', hue: 45, chroma: 0.17 },
  { name: 'Amber', hue: 70, chroma: 0.14 },
  { name: 'Green', hue: 150, chroma: 0.15 },
  { name: 'Teal', hue: 185, chroma: 0.12 },
  { name: 'Cyan', hue: 215, chroma: 0.13 },
]

export const radii = [0, 0.25, 0.5, 0.75, 1, 1.25]

export const surfaceBorders: { key: SurfaceBorder; name: string }[] = [
  { key: 'default', name: 'Default' },
  { key: 'strong', name: 'Strong' },
  { key: 'brand', name: 'Brand' },
  { key: 'none', name: 'None' },
]

const surfaceBorderValues: Record<Exclude<SurfaceBorder, 'default'>, string> = {
  strong: 'var(--input)',
  brand: 'color-mix(in oklab, var(--primary) 35%, var(--border))',
  none: 'transparent',
}

export const surfaces: { key: Surfaces; name: string }[] = [
  { key: 'flat', name: 'Flat' },
  { key: 'raised', name: 'Raised' },
  { key: 'tinted', name: 'Tinted' },
]

const surfaceLightness: Record<Exclude<Surfaces, 'raised'>, Record<string, number>> = {
  flat: { background: 1, secondary: 0.97, muted: 0.97, accent: 0.97, 'muted-foreground': 0.556 },
  tinted: { background: 1, card: 0.98 },
}

export const chromaRange = { min: 0.04, max: 0.26 }

export const defaultTheme: ThemeConfig = {
  hue: 262,
  chroma: 0.2,
  neutral: 'neutral',
  radius: 0.75,
  font: 'inter',
  surfaceBorder: 'default',
  surfaces: 'raised',
}

const round = (value: number, digits = 3) => Number(value.toFixed(digits))

const oklch = (lightness: number, chroma: number, hue: number, alpha?: number) =>
  `oklch(${round(lightness)} ${round(chroma)} ${chroma === 0 ? 0 : round(hue, 1)}${alpha === undefined ? '' : ` / ${alpha}%`})`

const neutralTokens = {
  light: {
    background: 0.98,
    foreground: 0.145,
    card: 1,
    'card-foreground': 0.145,
    popover: 1,
    'popover-foreground': 0.145,
    secondary: 0.955,
    'secondary-foreground': 0.205,
    muted: 0.955,
    'muted-foreground': 0.54,
    accent: 0.955,
    'accent-foreground': 0.205,
    border: 0.922,
    input: 0.62,
  },
  dark: {
    background: 0.145,
    foreground: 0.985,
    card: 0.205,
    'card-foreground': 0.985,
    popover: 0.205,
    'popover-foreground': 0.985,
    secondary: 0.269,
    'secondary-foreground': 0.985,
    muted: 0.269,
    'muted-foreground': 0.708,
    accent: 0.269,
    'accent-foreground': 0.985,
  },
} as const

const darkAlpha = { border: 10, input: 40 } as const

export const neutralOf = (config: ThemeConfig) => {
  const neutral = neutrals.find((entry) => entry.key === config.neutral) ?? neutrals[0]!
  return { hue: neutral.hue ?? config.hue, chroma: neutral.chroma }
}

export const themeTokens = (config: ThemeConfig) => {
  const { hue, chroma } = config
  const neutral = neutralOf(config)
  const tint = (lightness: number) => oklch(lightness, lightness >= 0.99 ? 0 : neutral.chroma, neutral.hue)

  const light: Record<string, string> = {
    radius: `${config.radius}rem`,
    brand: oklch(0.48, chroma, hue),
    primary: oklch(0.48, chroma, hue),
    'primary-foreground': oklch(1, 0, 0),
    ring: oklch(0.7, chroma * 0.6, hue),
  }
  const dark: Record<string, string> = {
    primary: oklch(0.78, chroma * 0.5, hue),
    'primary-foreground': oklch(0.25, chroma * 0.4, hue),
    ring: oklch(0.6, chroma * 0.6, hue),
  }

  if (neutral.chroma > 0) {
    for (const [name, lightness] of Object.entries(neutralTokens.light)) light[name] = tint(lightness)
    for (const [name, lightness] of Object.entries(neutralTokens.dark)) dark[name] = tint(lightness)
    for (const [name, alpha] of Object.entries(darkAlpha)) dark[name] = oklch(1, neutral.chroma, neutral.hue, alpha)
  }

  if (config.surfaces !== 'raised') {
    for (const [name, lightness] of Object.entries(surfaceLightness[config.surfaces])) light[name] = tint(lightness)
  }

  if (config.surfaceBorder !== 'default') {
    light['surface-border'] = surfaceBorderValues[config.surfaceBorder]
    dark['surface-border'] = surfaceBorderValues[config.surfaceBorder]
  }

  return { light, dark }
}

export const fontOf = (config: ThemeConfig) => fonts.find((font) => font.key === config.font) ?? fonts[0]!

export const fontStack = (font: ThemeFont) => `${font.family}, ui-sans-serif, system-ui, sans-serif`

export const fontUrl = (names: string[]) =>
  `https://fonts.googleapis.com/css2?${names.map((name) => `family=${name.replaceAll(' ', '+')}:wght@400;500;600;700`).join('&')}&display=swap`

const block = (selector: string, tokens: Record<string, string>) =>
  `${selector} {\n${Object.entries(tokens)
    .map(([name, value]) => `  --${name}: ${value};`)
    .join('\n')}\n}`

export const themeCss = (config: ThemeConfig) => {
  const { light, dark } = themeTokens(config)
  const font = fontOf(config)
  return [
    `@import url("${fontUrl([font.name])}");`,
    block(':root', light),
    block('.dark', dark),
    `@theme {\n  --font-sans: ${fontStack({ ...font, family: `"${font.name}"` })};\n}`,
  ].join('\n\n')
}

export const isDefaultTheme = (config: ThemeConfig) => Object.keys(themeToQuery(config)).length === 0

export const siteCss = (config: ThemeConfig) => {
  const { light, dark } = themeTokens(config)
  return [
    block(':root:root, :root .light', { ...light, 'font-sans': fontStack(fontOf(config)) }),
    block(':root.dark, :root .dark', dark),
  ].join('\n')
}

export const previewCss = (config: ThemeConfig, selector: string) => {
  const { light, dark } = themeTokens(config)
  return [
    block(selector, { ...light, 'font-sans': fontStack(fontOf(config)) }),
    `${selector} { font-family: var(--font-sans); }`,
    block(`.dark ${selector}`, dark),
  ].join('\n')
}

const pick = <T>(items: readonly T[], random: () => number) => items[Math.floor(random() * items.length)]!

export const randomTheme = (random: () => number = Math.random): ThemeConfig => ({
  hue: Math.round(random() * 360),
  chroma: round(chromaRange.min + random() * (chromaRange.max - chromaRange.min), 2),
  neutral: pick(neutrals, random).key,
  radius: pick(radii, random),
  font: pick(fonts, random).key,
  surfaceBorder: pick(surfaceBorders, random).key,
  surfaces: pick(surfaces, random).key,
})

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const themeFromQuery = (query: Record<string, unknown>): ThemeConfig => {
  const number = (key: string) => {
    const value = Number(query[key])
    return typeof query[key] === 'string' && Number.isFinite(value) ? value : undefined
  }
  const hue = number('hue')
  const chroma = number('chroma')
  const radius = number('radius')
  return {
    hue: hue === undefined ? defaultTheme.hue : clamp(Math.round(hue), 0, 360),
    chroma: chroma === undefined ? defaultTheme.chroma : clamp(chroma, chromaRange.min, chromaRange.max),
    neutral: neutrals.some((entry) => entry.key === query.neutral) ? (query.neutral as NeutralName) : defaultTheme.neutral,
    radius: radius !== undefined && radii.includes(radius) ? radius : defaultTheme.radius,
    font: fonts.some((font) => font.key === query.font) ? (query.font as string) : defaultTheme.font,
    surfaceBorder: surfaceBorders.some((option) => option.key === query.surfaceBorder)
      ? (query.surfaceBorder as SurfaceBorder)
      : defaultTheme.surfaceBorder,
    surfaces: surfaces.some((option) => option.key === query.surfaces) ? (query.surfaces as Surfaces) : defaultTheme.surfaces,
  }
}

export const themeToQuery = (config: ThemeConfig) => {
  const entries = Object.entries(config).filter(([key, value]) => defaultTheme[key as keyof ThemeConfig] !== value)
  return Object.fromEntries(entries.map(([key, value]) => [key, String(value)]))
}
