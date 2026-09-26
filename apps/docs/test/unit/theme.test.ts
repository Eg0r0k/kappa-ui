import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  chromaRange,
  defaultTheme,
  fonts,
  isDefaultTheme,
  neutrals,
  radii,
  randomTheme,
  siteCss,
  surfaceBorders,
  themeCss,
  themeFromQuery,
  themeToQuery,
  themeTokens,
} from '~/lib/theme'

const globals = readFileSync(new URL('../../app/assets/css/globals.css', import.meta.url), 'utf8')

const staticToken = (selector: string, name: string) => {
  const block = globals.slice(globals.indexOf(`${selector} {`))
  return block.match(new RegExp(`--${name}: ([^;]+);`))?.[1]
}

describe('theme', () => {
  it('reproduces the static fallbacks of the default theme', () => {
    const { light, dark } = themeTokens(defaultTheme)

    expect(light.primary).toBe(staticToken('.light', 'primary'))
    expect(light.ring).toBe(staticToken('.light', 'ring'))
    expect(light.radius).toBe(staticToken('.light', 'radius'))
    for (const name of ['primary', 'primary-foreground', 'ring']) expect(dark[name]).toBe(staticToken('.dark', name))
  })

  it('leaves the neutral tokens alone for the neutral base, and tints them otherwise', () => {
    expect(themeTokens(defaultTheme).light.background).toBeUndefined()

    const slate = themeTokens({ ...defaultTheme, neutral: 'slate' })
    expect(slate.light.background).toBe('oklch(1 0 0)')
    expect(slate.light.foreground).toBe('oklch(0.145 0.018 257)')
    expect(slate.dark.border).toBe('oklch(1 0.018 257 / 10%)')

    const brand = themeTokens({ ...defaultTheme, neutral: 'brand', hue: 150 })
    expect(brand.light.muted).toBe('oklch(0.97 0.014 150)')
  })

  it('writes CSS with the font import, both themes and the font', () => {
    const css = themeCss({ ...defaultTheme, font: 'geist', radius: 0.5 })

    expect(css).toMatch(/^@import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Geist:wght@400;500;600;700&display=swap"\);/)
    expect(css).toContain(':root {\n  --radius: 0.5rem;\n  --brand: oklch(0.48 0.2 262);')
    expect(css).toContain('.dark {\n  --primary: oklch(0.78 0.1 262);')
    expect(css).toContain('--font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;')
  })

  it('writes site CSS one step more specific than the stylesheet, with the font', () => {
    const css = siteCss({ ...defaultTheme, hue: 150, font: 'geist' })

    expect(css).toContain(':root:root, :root .light {\n  --radius: 0.75rem;\n  --brand: oklch(0.48 0.2 150);')
    expect(css).toContain('--font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;')
    expect(css).toContain(':root.dark, :root .dark {\n  --primary: oklch(0.78 0.1 150);')
  })

  it('sets the surface border in both themes, and leaves it to --border by default', () => {
    expect(surfaceBorders.map((option) => option.key)).toEqual(['default', 'strong', 'brand', 'none'])
    expect(themeTokens(defaultTheme).light['surface-border']).toBeUndefined()
    for (const [key, value] of [
      ['none', 'transparent'],
      ['strong', 'var(--input)'],
      ['brand', 'color-mix(in oklab, var(--primary) 35%, var(--border))'],
    ] as const) {
      const { light, dark } = themeTokens({ ...defaultTheme, surfaceBorder: key })
      expect([light['surface-border'], dark['surface-border']], key).toEqual([value, value])
    }
  })

  it('tells the default theme apart', () => {
    expect(isDefaultTheme({ ...defaultTheme })).toBe(true)
    expect(isDefaultTheme({ ...defaultTheme, radius: 0.5 })).toBe(false)
  })

  it('draws random themes from the allowed values', () => {
    for (let index = 0; index < 50; index++) {
      const theme = randomTheme()
      expect(theme.hue).toBeGreaterThanOrEqual(0)
      expect(theme.hue).toBeLessThanOrEqual(360)
      expect(theme.chroma).toBeGreaterThanOrEqual(chromaRange.min)
      expect(theme.chroma).toBeLessThanOrEqual(chromaRange.max)
      expect(radii).toContain(theme.radius)
      expect(neutrals.map((neutral) => neutral.key)).toContain(theme.neutral)
      expect(fonts.map((font) => font.key)).toContain(theme.font)
    }
    expect(randomTheme(() => 0.999)).toEqual({
      hue: 360,
      chroma: 0.26,
      neutral: 'brand',
      radius: 1.25,
      font: 'source-sans-3',
      surfaceBorder: 'none',
    })
  })

  it('round-trips through the query string, keeping only what differs from the default', () => {
    const theme = { ...defaultTheme, hue: 150, font: 'outfit', surfaceBorder: 'none' as const }

    expect(themeToQuery(defaultTheme)).toEqual({})
    expect(themeToQuery(theme)).toEqual({ hue: '150', font: 'outfit', surfaceBorder: 'none' })
    expect(themeFromQuery(themeToQuery(theme))).toEqual(theme)
  })

  it('falls back to the default for values it does not know', () => {
    expect(
      themeFromQuery({ hue: 'red', chroma: '9', neutral: 'plaid', radius: '0.3', font: 'comic', surfaceBorder: 'dotted' }),
    ).toEqual({
      ...defaultTheme,
      chroma: chromaRange.max,
    })
  })
})
