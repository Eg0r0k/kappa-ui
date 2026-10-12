import { describe, expect, it } from 'vitest'

import { changedProps, controlKind, defaultsOf } from '~/lib/example-controls'

const controls = [
  { prop: 'variant', values: ['solid', 'soft', 'outline'], default: 'solid' },
  { prop: 'color', values: ['primary', 'neutral', 'destructive', 'success', 'warning', 'info'], default: 'primary' },
  { prop: 'disabled', values: [false, true], default: false },
]

describe('example controls', () => {
  it('collects the defaults', () => {
    expect(defaultsOf(controls)).toEqual({ variant: 'solid', color: 'primary', disabled: false })
  })

  it('keeps only changed props, in control order', () => {
    expect(changedProps(controls, { disabled: true, color: 'primary', variant: 'soft' })).toEqual({
      variant: 'soft',
      disabled: true,
    })
    expect(Object.keys(changedProps(controls, { disabled: true, variant: 'soft' }))).toEqual(['variant', 'disabled'])
  })

  it('picks a switch for a boolean and a select for everything else', () => {
    expect(controls.map(controlKind)).toEqual(['select', 'select', 'switch'])
  })
})
