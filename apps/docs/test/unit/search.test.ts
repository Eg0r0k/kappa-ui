import { describe, expect, it } from 'vitest'

import { searchSections, type SearchSection } from '~/lib/search'

const section = (id: string, title: string, content = '', titles: string[] = [], level = 2): SearchSection => ({
  id,
  title,
  titles,
  level,
  content,
})

const sections = [
  section('/docs/components/button', 'Button', 'A button with variants.', [], 1),
  section('/docs/components/button#sizes', 'Sizes', 'Icon sizes are square.', ['Button']),
  section('/docs/components/scroll-area#virtualize', 'Virtualize', 'Render only the items in view.', ['Scroll Area']),
  section('/docs/getting-started/theming', 'Theming', 'The button reads --primary.', [], 1),
]

describe('searchSections', () => {
  it('returns nothing for an empty query', () => {
    expect(searchSections(sections, '   ')).toEqual([])
  })

  it('requires every term to match', () => {
    expect(searchSections(sections, 'icon square').map((hit) => hit.id)).toEqual(['/docs/components/button#sizes'])
    expect(searchSections(sections, 'icon virtualize')).toEqual([])
  })

  it('ranks a title match above a content match', () => {
    expect(searchSections(sections, 'button').map((hit) => hit.id)).toEqual([
      '/docs/components/button',
      '/docs/components/button#sizes',
      '/docs/getting-started/theming',
    ])
  })

  it('is case-insensitive and respects the limit', () => {
    expect(searchSections(sections, 'BUTTON', 1).map((hit) => hit.id)).toEqual(['/docs/components/button'])
  })
})
