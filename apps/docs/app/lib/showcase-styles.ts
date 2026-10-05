import { type ThemeConfig, defaultTheme, fontUrl, shadowTokens, themeTokens } from '~/lib/theme'

export type ShowcaseStyleKey = 'kappa' | 'soft' | 'sharp' | 'brutal' | 'terminal'

export interface ShowcaseStyle {
  key: ShowcaseStyleKey
  name: string
  font?: string
  mono?: boolean
  swatch: string
  theme?: Partial<ThemeConfig>
  overrides?: { light?: Record<string, string>; dark?: Record<string, string> }
}

const hard = (offset: number) => `${offset}px ${offset}px 0 0 var(--foreground)`

const brutalEdges = {
  primary: 'oklch(0.86 0.17 95)',
  'primary-foreground': 'oklch(0.145 0 0)',
  'surface-border': 'var(--foreground)',
  border: 'var(--foreground)',
  input: 'var(--foreground)',
}

export const showcaseStyles: ShowcaseStyle[] = [
  { key: 'kappa', name: 'Kappa', swatch: 'var(--primary)' },
  {
    key: 'soft',
    name: 'Soft',
    font: 'Plus Jakarta Sans',
    swatch: 'oklch(0.6 0.22 293)',
    theme: { hue: 293, chroma: 0.22, neutral: 'stone', radius: 1.25, surfaces: 'tinted', shadows: 'subtle' },
  },
  {
    key: 'sharp',
    name: 'Sharp',
    font: 'IBM Plex Sans',
    swatch: 'oklch(0.6 0.12 185)',
    theme: {
      hue: 185,
      chroma: 0.12,
      neutral: 'slate',
      radius: 0,
      surfaces: 'flat',
      shadows: 'none',
      surfaceBorder: 'strong',
    },
  },
  {
    key: 'brutal',
    name: 'Brutal',
    font: 'Space Grotesk',
    swatch: 'oklch(0.86 0.17 95)',
    theme: { radius: 0, surfaces: 'flat' },
    overrides: {
      light: {
        ...brutalEdges,
        'shadow-xs': hard(2),
        'shadow-sm': hard(3),
        'shadow-md': hard(4),
        'shadow-lg': hard(5),
        'shadow-xl': hard(6),
      },
      dark: brutalEdges,
    },
  },
  {
    key: 'terminal',
    name: 'Terminal',
    font: 'JetBrains Mono',
    mono: true,
    swatch: 'oklch(0.6 0.15 150)',
    theme: {
      hue: 150,
      chroma: 0.15,
      neutral: 'zinc',
      radius: 0.25,
      surfaces: 'flat',
      shadows: 'none',
      surfaceBorder: 'subtle',
    },
  },
]

export const showcaseFontStack = (style: ShowcaseStyle) =>
  style.font &&
  `"${style.font}", ${style.mono ? 'ui-monospace, monospace' : 'ui-sans-serif, system-ui, sans-serif'}`

const declarations = (tokens: Record<string, string>) =>
  Object.entries(tokens)
    .map(([name, value]) => `--${name}:${value};`)
    .join('')

const presetCss = (style: ShowcaseStyle) => {
  const config = { ...defaultTheme, ...style.theme }
  const { light, dark } = themeTokens(config)
  const font = showcaseFontStack(style)
  const scope = `[data-showcase-style="${style.key}"]`
  const lightTokens = {
    'surface-border': 'transparent',
    ...shadowTokens(config.shadows),
    ...light,
    ...style.overrides?.light,
    ...(font && { 'font-sans': font }),
  }
  return [
    `${scope}{${declarations(lightTokens)}${font ? `font-family:${font};` : ''}}`,
    `.dark ${scope}{${declarations({ ...dark, ...style.overrides?.dark })}}`,
  ].join('\n')
}

export const showcaseCss = () =>
  showcaseStyles
    .filter((style) => style.theme)
    .map(presetCss)
    .join('\n')

export const showcaseFontUrl = () => fontUrl(showcaseStyles.flatMap((style) => (style.font ? [style.font] : [])))
