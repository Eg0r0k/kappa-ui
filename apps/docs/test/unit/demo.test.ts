import { describe, expect, it } from 'vitest'

import { DEMO_WIDTH, clampWidth, hasColorProp, neighbourExample, selectedExample, toneStyle } from '~/lib/demo'

const examples = [
  { name: 'button-sizes', slug: 'sizes' },
  { name: 'button-demo', slug: 'demo' },
  { name: 'button-loading', slug: 'loading' },
]

describe('clampWidth', () => {
  it('keeps the panel width inside its bounds', () => {
    expect(clampWidth(600)).toBe(600)
    expect(clampWidth(100)).toBe(DEMO_WIDTH.min)
    expect(clampWidth(5000)).toBe(DEMO_WIDTH.max)
    expect(clampWidth('640')).toBe(640)
    expect(clampWidth(Number.NaN)).toBe(DEMO_WIDTH.initial)
    expect(clampWidth(undefined)).toBe(DEMO_WIDTH.initial)
  })
})

describe('selectedExample', () => {
  it('reads the slug from the hash', () => {
    expect(selectedExample(examples, '#loading', 'button')?.name).toBe('button-loading')
    expect(selectedExample(examples, 'loading', 'button')?.name).toBe('button-loading')
  })

  it('falls back to the overview, then to the first example', () => {
    expect(selectedExample(examples, '', 'button')?.name).toBe('button-demo')
    expect(selectedExample(examples, '#api-reference', 'button')?.name).toBe('button-demo')
    expect(selectedExample(examples.slice(2), '', 'button')?.name).toBe('button-loading')
    expect(selectedExample([], '#loading', 'button')).toBeUndefined()
  })

  it('decodes the hash', () => {
    const named = [{ name: 'x-émoji', slug: 'émoji' }]
    expect(selectedExample(named, `#${encodeURIComponent('émoji')}`, 'x')?.name).toBe('x-émoji')
  })
})

describe('neighbourExample', () => {
  it('steps through the page order without wrapping', () => {
    expect(neighbourExample(examples, examples[1], 1)).toBe(examples[2])
    expect(neighbourExample(examples, examples[1], -1)).toBe(examples[0])
    expect(neighbourExample(examples, examples[2], 1)).toBeUndefined()
    expect(neighbourExample(examples, examples[0], -1)).toBeUndefined()
    expect(neighbourExample(examples, undefined, 1)).toBeUndefined()
  })
})

describe('toneStyle', () => {
  it('remaps primary to the chosen tone', () => {
    expect(toneStyle('primary')).toBe('')
    expect(toneStyle('neutral')).toBe('--primary: var(--foreground); --primary-foreground: var(--background)')
    expect(toneStyle('success')).toBe('--primary: var(--success); --primary-foreground: var(--success-foreground)')
  })
})

describe('hasColorProp', () => {
  const api = {
    Button: { props: [{ name: 'variant' }, { name: 'color' }] },
    Kbd: { props: [{ name: 'size' }] },
    KbdGroup: { props: [] },
  }

  it('looks for a color prop on the item parts', () => {
    expect(hasColorProp([{ path: 'src/ui/button/Button.vue' }, { path: 'src/ui/button/index.ts' }], api)).toBe(true)
    expect(hasColorProp([{ path: 'src/ui/kbd/Kbd.vue' }, { path: 'src/ui/kbd/KbdGroup.vue' }], api)).toBe(false)
    expect(hasColorProp([{ path: 'src/examples/button/Demo.vue' }], { Demo: { props: [{ name: 'color' }] } })).toBe(
      false,
    )
    expect(hasColorProp([{ path: 'src/ui/missing/Missing.vue' }], api)).toBe(false)
  })
})
