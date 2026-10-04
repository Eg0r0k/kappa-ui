import { describe, expect, it } from 'vitest'

import { pagePathOfRaw, rawPath } from '~/lib/raw'

describe('raw paths', () => {
  it('maps a page to its markdown and back', () => {
    expect(rawPath('/docs/components/button')).toBe('/raw/docs/components/button.md')
    expect(pagePathOfRaw('/raw/docs/components/button.md')).toBe('/docs/components/button')
    expect(pagePathOfRaw('/raw/docs/components/button')).toBeUndefined()
    expect(pagePathOfRaw('/docs/components/button.md')).toBeUndefined()
  })
})
