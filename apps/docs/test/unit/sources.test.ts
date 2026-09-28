import { describe, expect, it } from 'vitest'

import { loadStyle } from '~/lib/sources'

describe('loadStyle', () => {
  it('reads a cssSource from the core package', async () => {
    const css = await loadStyle('../core/src/tokens.css')
    expect(css).toContain('@import "@kappa-ui/core/tailwind.css";')
    expect(css).toMatch(/:root \{\n {2}--state-hover: 8%;/)
  })

  it('names the path it cannot find', async () => {
    await expect(loadStyle('../core/src/nope.css')).rejects.toThrow('../core/src/nope.css')
  })
})
