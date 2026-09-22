import { describe, expect, it } from 'vitest'

import { flattenToc, pickActiveHeading } from '~/lib/toc'

describe('flattenToc', () => {
  it('lists children after their parent', () => {
    const links = [
      { id: 'usage', text: 'Usage', depth: 2 },
      {
        id: 'examples',
        text: 'Examples',
        depth: 2,
        children: [
          { id: 'horizontal', text: 'Horizontal', depth: 3 },
          { id: 'masonry', text: 'Masonry', depth: 3 },
        ],
      },
    ]
    expect(flattenToc(links).map((link) => link.id)).toEqual(['usage', 'examples', 'horizontal', 'masonry'])
  })
})

describe('pickActiveHeading', () => {
  const ordered = ['usage', 'examples', 'api']

  it('picks the first visible heading in document order', () => {
    expect(pickActiveHeading(ordered, new Set(['api', 'examples']), null)).toBe('examples')
  })

  it('keeps the previous heading when none is visible', () => {
    expect(pickActiveHeading(ordered, new Set(), 'usage')).toBe('usage')
  })
})
