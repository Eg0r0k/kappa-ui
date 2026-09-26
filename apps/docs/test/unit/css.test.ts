import { describe, expect, it } from 'vitest'

import { serializeCssRules, serializeCssVars } from '~/lib/css'

describe('serializeCssRules', () => {
  it('writes declarations and nested rules with two-space indent', () => {
    expect(serializeCssRules({ '.a': { color: 'red', '&:hover': { color: 'blue' } } })).toBe(
      '.a {\n  color: red;\n  &:hover {\n    color: blue;\n  }\n}',
    )
  })

  it('writes a rule without a body as a statement', () => {
    expect(serializeCssRules({ '@import "@delta-ui/core/tailwind.css"': {} })).toBe('@import "@delta-ui/core/tailwind.css";')
  })
})

describe('serializeCssVars', () => {
  it('writes light, dark and theme blocks the way the CLI places them', () => {
    expect(
      serializeCssVars({
        light: { radius: '0.75rem' },
        dark: { background: 'black' },
        theme: { 'radius-lg': 'var(--radius)' },
      }),
    ).toBe(
      ':root {\n  --radius: 0.75rem;\n}\n\n.dark {\n  --background: black;\n}\n\n@theme inline {\n  --radius-lg: var(--radius);\n}',
    )
  })

  it('writes nothing for no variables', () => {
    expect(serializeCssVars({})).toBe('')
  })
})
