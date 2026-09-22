import { describe, expect, it } from 'vitest'

import { inlineCode } from '~/lib/inline-code'

describe('inlineCode', () => {
  it('splits backtick spans into code parts', () => {
    expect(inlineCode('Forces the bar on (`true`) or off.')).toEqual([
      { code: false, text: 'Forces the bar on (' },
      { code: true, text: 'true' },
      { code: false, text: ') or off.' },
    ])
  })

  it('returns plain text unchanged', () => {
    expect(inlineCode('Plain.')).toEqual([{ code: false, text: 'Plain.' }])
  })

  it('leaves an unpaired backtick as text', () => {
    expect(inlineCode('a ` b')).toEqual([{ code: false, text: 'a ` b' }])
  })
})
