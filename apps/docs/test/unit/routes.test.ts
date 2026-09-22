import { describe, expect, it } from 'vitest'

import { contentFileToRoute } from '../../scripts/lib/routes.ts'

describe('contentFileToRoute', () => {
  it('strips numeric prefixes and the extension', () => {
    expect(contentFileToRoute('1.getting-started/1.introduction.md')).toBe('/docs/getting-started/introduction')
  })

  it('accepts Windows separators', () => {
    expect(contentFileToRoute('2.components\\3.scroll-area.md')).toBe('/docs/components/scroll-area')
  })

  it('maps an index page to its folder', () => {
    expect(contentFileToRoute('1.getting-started/index.md')).toBe('/docs/getting-started')
    expect(contentFileToRoute('index.md')).toBe('/docs')
  })
})
