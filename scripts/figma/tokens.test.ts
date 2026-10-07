import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import type { TokenVariable } from './payload.ts'
import { tokensOf } from './tokens.ts'

const sources = {
  theme: `:root {
  --radius: 0.5rem;
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.48 0.2 262);
  --secondary: oklch(0.955 0 0);
}

.dark {
  color-scheme: dark;
  --foreground: oklch(0.985 0 0);
}

@supports (color: oklch(from red l c h)) {
  :root {
    --primary: oklch(from var(--brand) 0.48 c h);
  }
}

@theme inline {
  --radius-xs: calc(var(--radius) * 0.2);
  --radius-lg: var(--radius);
  --color-primary: var(--primary);
}
`,
  tokens: `:root {
  --disabled-opacity: 38%;
  --disabled-container-opacity: 12%;
  --typescale-label-lg-size: 0.875rem;
  --typescale-label-lg-line-height: 1.25rem;
  --typescale-label-lg-weight: 500;
  --shadow-sm: 0 1px 3px 0 oklch(0 0 0 / 10%), 0 1px 2px -1px oklch(0 0 0 / 10%);
}
`,
  tailwind: `@layer base {
  [data-slot][data-color],
  [data-slot][data-state="on"][data-active-color] {
    --tone-soft: color-mix(in oklab, var(--tone) 12%, transparent);
    --tone-border: var(--tone-text);
  }

  [data-slot][data-color="primary"],
  [data-slot][data-state="on"][data-active-color="primary"] {
    --tone: --theme(--color-primary);
    --tone-text: --theme(--color-primary);
  }
}

@utility tone-invalid {
  --tone: --theme(--color-foreground);
  --tone-border: var(--tone);
  --halo-color: var(--tone);
}
`,
}

const light = { theme: 'light', prune: false } as const
const PRIMARY = { r: 0.0702, g: 0.3173, b: 0.7984, a: 1 }
const FOREGROUND = { r: 0.0394, g: 0.0394, b: 0.0394, a: 1 }

const variable = (variables: TokenVariable[], id: string) => {
  const found = variables.find((item) => item.id === id)
  assert.ok(found, `${id} is missing`)
  return found
}

test('turns theme colours into Color variables with code syntax, ignoring @supports', () => {
  const { payload } = tokensOf(sources, light)
  assert.deepEqual(variable(payload.variables, 'Color/primary'), {
    id: 'Color/primary',
    collection: 'Color',
    name: 'primary',
    type: 'COLOR',
    value: PRIMARY,
    code: 'var(--primary)',
    scopes: ['ALL_FILLS', 'STROKE_COLOR', 'EFFECT_COLOR'],
  })
})

test('derives the disabled colours from foreground and the opacity tokens', () => {
  const { payload } = tokensOf(sources, light)
  assert.deepEqual(variable(payload.variables, 'Color/state/disabled').value, { ...FOREGROUND, a: 0.38 })
  assert.deepEqual(variable(payload.variables, 'Color/state/disabled-container').value, { ...FOREGROUND, a: 0.12 })
  assert.equal(
    variable(payload.variables, 'Color/state/disabled').code,
    'color-mix(in oklab, var(--foreground) var(--disabled-opacity), transparent)',
  )
})

test('builds tone groups from the data-color rules and the tone utilities', () => {
  const { payload } = tokensOf(sources, light)
  const tones = payload.variables.filter((item) => item.collection === 'Tone')
  assert.deepEqual(
    tones.map((item) => [item.name, item.value, item.code]),
    [
      ['primary/tone', { alias: 'Color/primary' }, 'var(--tone)'],
      ['primary/text', { alias: 'Color/primary' }, 'var(--tone-text)'],
      ['primary/soft', { ...PRIMARY, a: 0.12 }, 'var(--tone-soft)'],
      ['primary/border', { alias: 'Tone/primary/text' }, 'var(--tone-border)'],
      ['invalid/tone', { alias: 'Color/foreground' }, 'var(--tone)'],
      ['invalid/border', { alias: 'Tone/invalid/tone' }, 'var(--tone-border)'],
    ],
  )
})

test('rejects tone values it cannot express', () => {
  const tailwind = sources.tailwind.replace('in oklab, var(--tone) 12%, transparent', 'in srgb, var(--tone) 12%, white')
  assert.throws(() => tokensOf({ ...sources, tailwind }, light), /Unsupported tone value in primary: --tone-soft/)
})

test('aliases a theme colour written with a fallback', () => {
  const tailwind = sources.tailwind.replace(
    '--tone-text: --theme(--color-primary)',
    '--tone-text: --theme(--color-primary, oklch(0.5 0.13 152))',
  )
  const { payload } = tokensOf({ ...sources, tailwind }, light)
  assert.deepEqual(variable(payload.variables, 'Tone/primary/text').value, { alias: 'Color/primary' })
})

test('rejects aliases to unknown theme colours', () => {
  const tailwind = sources.tailwind.replace('--tone: --theme(--color-primary)', '--tone: --theme(--color-nope)')
  assert.throws(() => tokensOf({ ...sources, tailwind }, light), /Unknown theme colour --color-nope/)
})

test('applies the .dark overrides for the dark theme', () => {
  const { payload } = tokensOf(sources, { theme: 'dark', prune: true })
  assert.equal(payload.theme, 'dark')
  assert.equal(payload.prune, true)
  assert.deepEqual(variable(payload.variables, 'Color/foreground').value, { r: 0.9803, g: 0.9803, b: 0.9803, a: 1 })
  assert.equal((variable(payload.variables, 'Color/state/disabled').value as { a: number }).a, 0.38)
})

test('computes radii in px and keeps var(--radius) an alias', () => {
  const { payload } = tokensOf(sources, light)
  const radii = payload.variables.filter((item) => item.collection === 'Radius')
  assert.deepEqual(
    radii.map((item) => [item.name, item.value, item.scopes]),
    [
      ['radius', 8, ['CORNER_RADIUS']],
      ['radius-xs', 1.6, ['CORNER_RADIUS']],
      ['radius-lg', { alias: 'Radius/radius' }, ['CORNER_RADIUS']],
    ],
  )
})

test('reads the typescale into text styles and the shadows into effect styles', () => {
  const { payload } = tokensOf(sources, light)
  assert.deepEqual(payload.textStyles, [
    { id: 'Text/label/lg', name: 'label/lg', fontSize: 14, lineHeight: 20, fontWeight: 500 },
  ])
  const shadow = { r: 0, g: 0, b: 0, a: 0.1 }
  assert.deepEqual(payload.effectStyles, [
    {
      id: 'Effect/shadow/sm',
      name: 'shadow/sm',
      layers: [
        { x: 0, y: 1, blur: 3, spread: 0, color: shadow },
        { x: 0, y: 1, blur: 2, spread: -1, color: shadow },
      ],
    },
  ])
})

const core = (file: string) => readFileSync(new URL(`../../packages/core/src/${file}`, import.meta.url), 'utf8')
const real = { tokens: core('tokens.css'), theme: core('theme.css'), tailwind: core('tailwind.css') }

test('reads the real core sources', () => {
  const { payload, gamutMapped } = tokensOf(real, light)
  const count = (collection: string) => payload.variables.filter((item) => item.collection === collection).length
  assert.deepEqual([count('Color'), count('Tone'), count('Radius')], [33, 47, 9])
  assert.equal(payload.textStyles.length, 15)
  assert.equal(payload.effectStyles.length, 5)
  const tones = payload.variables.filter((item) => item.collection === 'Tone')
  const groups = new Set(tones.map((item) => item.name.split('/')[0]))
  assert.deepEqual(
    [...groups],
    ['primary', 'neutral', 'destructive', 'success', 'warning', 'info', 'control', 'invalid'],
  )
  assert.deepEqual(variable(payload.variables, 'Tone/neutral/soft').value, { alias: 'Color/secondary' })
  assert.deepEqual(gamutMapped, ['Color/success-foreground', 'Color/warning-text', 'Color/info'])
  assert.deepEqual(tokensOf(real, { theme: 'dark', prune: false }).gamutMapped, [
    'Color/warning-foreground',
    'Color/info',
    'Color/info-text',
  ])
})
