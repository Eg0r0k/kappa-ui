import { expect, it } from 'vitest'

import { activeHeading } from '~/lib/scroll-spy'

it('marks the last heading that has reached its scroll margin', () => {
  const headings = [
    { id: 'usage', top: -400, margin: 80 },
    { id: 'examples', top: 60, margin: 80 },
    { id: 'api', top: 500, margin: 80 },
  ]
  expect(activeHeading(headings)).toBe('examples')
  expect(activeHeading(headings.map((heading) => ({ ...heading, top: heading.top + 1000 })))).toBeUndefined()
  expect(activeHeading([{ id: 'usage', top: 81, margin: 80 }])).toBe('usage')
  expect(activeHeading([{ id: 'usage', top: 82, margin: 80 }])).toBeUndefined()
  expect(activeHeading([])).toBeUndefined()
})
