import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  chromaRange,
  controlTokens,
  darkRoleShadowTokens,
  defaultTheme,
  isDefaultTheme,
  neutrals,
  shadowTokens,
  shadows,
  siteCss,
  statusTokens,
  statuses,
  surfaceBorders,
  surfaces,
  themeCss,
  themeFromQuery,
  themeToQuery,
  themeTokens,
} from '~/lib/theme'

const source = readFileSync(new URL('../../../../packages/core/src/theme.css', import.meta.url), 'utf8')
const tokens = readFileSync(new URL('../../../../packages/core/src/tokens.css', import.meta.url), 'utf8')

const staticToken = (selector: string, name: string, css = source) => {
  const block = css.slice(css.indexOf(`${selector} {`))
  return block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.replace(/\s+/g, ' ')
}

const statusSource = (selector: string, name: string) =>
  staticToken(selector, name, tokens) ?? staticToken(selector, name)

describe('theme', () => {
  it('reproduces the static fallbacks of the default theme', () => {
    const { light, dark } = themeTokens(defaultTheme)

    expect(light.primary).toBe(staticToken(':root', 'primary'))
    expect(light.ring).toBe(staticToken(':root', 'ring'))
    expect(light.radius).toBe(staticToken(':root', 'radius'))
    for (const name of ['primary', 'primary-foreground', 'ring']) expect(dark[name]).toBe(staticToken('.dark', name))
  })

  it('leaves the neutral tokens alone for the neutral base, and tints them otherwise', () => {
    expect(themeTokens(defaultTheme).light.background).toBeUndefined()

    const slate = themeTokens({ ...defaultTheme, neutral: 'slate' })
    expect(slate.light.background).toBe('oklch(0.98 0.018 257)')
    expect(slate.light.card).toBe('oklch(1 0 0)')
    expect(slate.light.foreground).toBe('oklch(0.145 0.018 257)')
    expect(slate.dark.border).toBe('oklch(1 0.018 257 / 10%)')

    const brand = themeTokens({ ...defaultTheme, neutral: 'brand', hue: 150 })
    expect(brand.light.muted).toBe('oklch(0.955 0.014 150)')
  })

  it('writes CSS with the font import, both themes and the font', () => {
    const css = themeCss({ ...defaultTheme, font: 'geist', radius: 0.5 })

    expect(css).toMatch(
      /^@import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Geist:wght@400;500;600;700&display=swap"\);/,
    )
    expect(css).toContain(':root {\n  --radius: 0.5rem;\n  --brand: oklch(0.48 0.2 262);')
    expect(css).toContain('.dark {\n  --primary: oklch(0.78 0.1 262);')
    expect(css).toContain('--font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;')
  })

  it('writes site CSS one step more specific than the stylesheet, with the font', () => {
    const css = siteCss({ ...defaultTheme, hue: 150, font: 'geist' })

    expect(css).toContain(':root:root, :root .light {\n  --radius: 0.5rem;\n  --brand: oklch(0.48 0.2 150);')
    expect(css).toContain('--font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;')
    expect(css).toContain(':root.dark, :root .dark {\n  --primary: oklch(0.78 0.1 150);')
  })

  it('leaves the static transparent edge by default, and sets a chosen one in both themes', () => {
    expect(surfaceBorders.map((option) => option.key)).toEqual(['none', 'subtle', 'strong', 'brand'])
    expect(defaultTheme.surfaceBorder).toBe('none')
    expect(staticToken(':root', 'surface-border')).toBe('transparent')
    expect(themeTokens(defaultTheme).light['surface-border']).toBeUndefined()
    for (const [key, value] of [
      ['subtle', 'var(--border)'],
      ['strong', 'var(--input)'],
      ['brand', 'color-mix(in oklab, var(--primary) 35%, var(--border))'],
    ] as const) {
      const { light, dark } = themeTokens({ ...defaultTheme, surfaceBorder: key })
      expect([light['surface-border'], dark['surface-border']], key).toEqual([value, value])
    }
  })

  it('reproduces the static shadow tokens, and emits them only once changed', () => {
    expect(shadows.map((option) => option.key)).toEqual(['none', 'subtle', 'default', 'strong'])
    for (const [name, value] of Object.entries(shadowTokens('default'))) {
      expect(value, name).toBe(staticToken(':root', name, tokens))
    }
    expect(themeTokens(defaultTheme).light['shadow-md']).toBeUndefined()
    expect(themeTokens({ ...defaultTheme, shadows: 'strong' }).light['shadow-sm']).toBe(
      '0 1px 3px 0 oklch(0 0 0 / 20%), 0 1px 2px -1px oklch(0 0 0 / 20%)',
    )
    expect(themeTokens({ ...defaultTheme, shadows: 'subtle' }).light['shadow-xs']).toBe(
      '0 1px 2px 0 oklch(0 0 0 / 2.5%)',
    )
    expect(Object.values(shadowTokens('none'))).toEqual(Array(5).fill('0 0 #0000'))
    expect(themeTokens({ ...defaultTheme, shadows: 'none' }).dark['shadow-md']).toBeUndefined()
  })

  it('reproduces the dark role shadows, and scales only their drop with the shadows', () => {
    for (const [name, value] of Object.entries(darkRoleShadowTokens('default'))) {
      expect(value, name).toBe(staticToken('.dark', name))
    }
    expect(themeTokens(defaultTheme).dark['shadow-popover']).toBeUndefined()
    expect(themeTokens({ ...defaultTheme, shadows: 'none' }).dark['shadow-popover']).toBe(
      'inset 0 1px 0 0 oklch(1 0 0 / 3%), inset 0 0 0 1px oklch(1 0 0 / 4%), 0 0 0 1px oklch(0 0 0 / 22%)',
    )
    expect(themeTokens({ ...defaultTheme, shadows: 'strong' }).dark['shadow-dialog']).toContain(
      '0 24px 24px -12px oklch(0 0 0 / 50%)',
    )
  })

  it('turns the ripple off for the whole page only once asked', () => {
    expect(themeCss(defaultTheme)).not.toContain('--kappa-ripple')
    const off = { ...defaultTheme, ripple: 'off' as const }
    expect(themeCss(off)).toMatch(/:root {[^}]*--kappa-ripple: none;/)
    expect(siteCss(off)).toContain('--kappa-ripple: none;')
  })

  it('reproduces the static control size tokens, and shifts the scale a step for a density', () => {
    const scale = controlTokens('default')
    expect(Object.keys(scale)).toHaveLength(20)
    for (const [name, value] of Object.entries(scale)) expect(value).toBe(staticToken(':root', name, tokens))

    expect(themeCss(defaultTheme)).not.toContain('--control-')
    const compact = themeTokens({ ...defaultTheme, density: 'compact' }).light
    expect(compact['control-height-md']).toBe(scale['control-height-sm'])
    expect(compact['control-icon-lg']).toBe(scale['control-icon-md'])
    expect(compact['control-height-xs']).toBe('calc(var(--spacing) * 6)')
    const comfortable = themeTokens({ ...defaultTheme, density: 'comfortable' }).light
    expect(comfortable['control-padding-md']).toBe(scale['control-padding-lg'])
    expect(comfortable['control-height-xl']).toBe('calc(var(--spacing) * 14)')
  })

  it('tells the default theme apart', () => {
    expect(isDefaultTheme({ ...defaultTheme })).toBe(true)
    expect(isDefaultTheme({ ...defaultTheme, radius: 1 })).toBe(false)
  })

  it('raises the light surfaces by default, and can flatten or tint them', () => {
    const lightness = (value?: string) =>
      value === undefined ? undefined : Number(value.match(/oklch\(([\d.]+)/)?.[1])
    const levels = (key: (typeof surfaces)[number]['key']) => {
      const { light } = themeTokens({ ...defaultTheme, surfaces: key })
      return ['background', 'card', 'popover', 'muted'].map((name) => lightness(light[name]))
    }

    expect(surfaces.map((option) => option.key)).toEqual(['flat', 'raised', 'tinted'])
    expect(defaultTheme.surfaces).toBe('raised')
    expect(levels('raised')).toEqual([undefined, undefined, undefined, undefined])
    expect(levels('flat')).toEqual([1, undefined, undefined, 0.97])
    expect(levels('tinted')).toEqual([1, 0.98, undefined, undefined])
    expect(themeTokens({ ...defaultTheme, surfaces: 'flat' }).dark.background).toBe('oklch(0.145 0 0)')
    expect(themeTokens({ ...defaultTheme, neutral: 'slate' }).light.background).toBe('oklch(0.98 0.018 257)')
  })

  it('gives the dark theme its own value for every colour the light surfaces change', () => {
    for (const neutral of neutrals) {
      for (const option of surfaces) {
        const { light, dark } = themeTokens({ ...defaultTheme, neutral: neutral.key, surfaces: option.key })
        const leaks = Object.keys(light).filter((name) => !['radius', 'brand'].includes(name) && !(name in dark))
        expect(leaks, `${neutral.key}, ${option.key}`).toEqual([])
      }
    }
  })

  it('keeps muted text at 4.5:1 on the page, cards, popovers and muted fills with every surface option', () => {
    const luminance = (value: number) => value ** 3
    const contrast = (a: number, b: number) =>
      (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05)
    for (const option of surfaces) {
      const { light } = themeTokens({ ...defaultTheme, surfaces: option.key })
      const level = (name: string) => Number((light[name] ?? staticToken(':root', name))?.match(/oklch\(([\d.]+)/)?.[1])
      for (const surface of ['background', 'card', 'popover', 'muted']) {
        expect(
          contrast(level('muted-foreground'), level(surface)),
          `${option.key} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('reproduces the static status tokens, and emits them only once changed', () => {
    const { light, dark } = statusTokens(defaultTheme, true)
    for (const status of statuses) {
      for (const name of Object.keys(status.light)) expect(light[name], name).toBe(statusSource(':root', name))
      for (const name of Object.keys(status.dark)) expect(dark[name], name).toBe(statusSource('.dark', name))
    }
    expect(Object.keys(statusTokens(defaultTheme).light)).toEqual([])
    expect(themeTokens(defaultTheme).light.success).toBeUndefined()
  })

  it('moves every role of a status colour with its hue and scales it with its chroma', () => {
    const { light, dark } = themeTokens({ ...defaultTheme, successHue: 170, successChroma: 0.085 })

    expect(light.success).toBe('oklch(0.72 0.085 170)')
    expect(light['success-foreground']).toBe('oklch(0.25 0.035 170)')
    expect(light['success-text']).toBe('oklch(0.5 0.065 172)')
    expect(dark['success-text']).toBe('oklch(0.78 0.065 175)')
    expect(light.warning).toBeUndefined()

    const wrapped = themeTokens({ ...defaultTheme, warningHue: 10 })
    expect(wrapped.light['warning-text']).toBe('oklch(0.54 0.14 350)')
    expect(themeTokens({ ...defaultTheme, destructiveHue: 0 }).light['destructive-foreground']).toBe('oklch(1 0 0)')
  })

  it('moves the fill of a status colour with its lightness, leaving the label and the text', () => {
    const { light, dark } = themeTokens({ ...defaultTheme, successLightness: 0.6 })

    expect(light.success).toBe('oklch(0.6 0.17 150)')
    expect(dark.success).toBe('oklch(0.66 0.13 155)')
    expect(light['success-foreground']).toBe('oklch(0.25 0.07 150)')
    expect(light['success-text']).toBe('oklch(0.5 0.13 152)')
    expect(themeTokens({ ...defaultTheme, destructiveLightness: 0.95 }).dark.destructive).toBe('oklch(1 0.14 25)')
  })

  it('round-trips through the query string, keeping only what differs from the default', () => {
    const theme = {
      ...defaultTheme,
      hue: 150,
      font: 'outfit',
      surfaceBorder: 'strong' as const,
      shadows: 'subtle' as const,
      ripple: 'off' as const,
      density: 'compact' as const,
      infoChroma: 0.2,
    }

    expect(themeToQuery(defaultTheme)).toEqual({})
    expect(themeToQuery(theme)).toEqual({
      hue: '150',
      font: 'outfit',
      surfaceBorder: 'strong',
      shadows: 'subtle',
      ripple: 'off',
      density: 'compact',
      infoChroma: '0.2',
    })
    expect(themeFromQuery(themeToQuery(theme))).toEqual(theme)
  })

  it('falls back to the default for values it does not know', () => {
    expect(
      themeFromQuery({
        hue: 'red',
        chroma: '9',
        neutral: 'plaid',
        radius: '0.3',
        font: 'comic',
        surfaceBorder: 'dotted',
        shadows: 'huge',
        ripple: 'sometimes',
        density: 'cosy',
        successHue: 'green',
        warningChroma: '0',
      }),
    ).toEqual({
      ...defaultTheme,
      chroma: chromaRange.max,
      warningChroma: chromaRange.min,
    })
  })
})

it('keeps the role radii on Auto by default and writes only the ones set', () => {
  expect([defaultTheme.controlRadius, defaultTheme.surfaceRadius, defaultTheme.itemRadius]).toEqual([null, null, null])
  expect(themeCss(defaultTheme)).not.toMatch(/--(control|surface|item)-radius/)
  const css = themeCss({ ...defaultTheme, controlRadius: 1.25, surfaceRadius: 0 })
  expect(css).toContain('--control-radius: 1.25rem;')
  expect(css).toContain('--surface-radius: 0rem;')
  expect(css).not.toContain('--item-radius')
})

it('reads the role radii from the query and ignores values off the list', () => {
  const theme = themeFromQuery({ controlRadius: '0.75', surfaceRadius: '0.3', itemRadius: 'auto' })
  expect([theme.controlRadius, theme.surfaceRadius, theme.itemRadius]).toEqual([0.75, null, null])
  expect(themeToQuery({ ...defaultTheme, itemRadius: 0 })).toEqual({ itemRadius: '0' })
})
