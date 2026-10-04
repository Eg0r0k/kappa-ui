import { expect, it } from 'vitest'

import { outlineOf } from '~/lib/outline'

const body = {
  toc: {
    links: [
      { id: 'installation', text: 'Installation', depth: 2 },
      { id: 'x', text: 'X', depth: 3 },
    ],
  },
}

it('lists h2 sections and adds Changelog to component pages', () => {
  expect(outlineOf({ body, examples: [], component: 'button' })!.headings.map((heading) => heading.id)).toEqual([
    'installation',
    'changelog',
  ])
  expect(outlineOf({ body, examples: [] })!.headings.map((heading) => heading.id)).toEqual(['installation'])
  expect(outlineOf(null)).toBeUndefined()
})
