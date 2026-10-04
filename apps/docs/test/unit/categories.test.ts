import { readdirSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { categories, categoryOf, pageCategory } from '~/lib/categories'
import { registryItems } from '~/lib/registry'

const dir = new URL('../../content/docs/2.components/', import.meta.url)
const frontmatter = (file: string) => {
  const head = readFileSync(new URL(file, dir), 'utf8').split('---')[1] ?? ''
  const field = (name: string) => head.match(new RegExp(`^${name}: (.+)$`, 'm'))?.[1]?.trim()
  return { component: field('component'), category: field('category') }
}
const pages = readdirSync(dir)
  .filter((file) => file.endsWith('.md'))
  .sort()

describe('categories', () => {
  it('names every category an item uses, and nothing else', () => {
    const used = new Set(registryItems.flatMap((item) => categoryOf(item) ?? []))
    const unknown = registryItems.flatMap((item) =>
      (item.categories ?? []).filter((name) => name !== 'example' && categoryOf(item) !== name),
    )
    expect([...used].sort()).toEqual(categories.map((category) => category.key).sort())
    expect(unknown).toEqual([])
  })

  it('puts every component page in a category', () => {
    const missing = pages.filter((file) => pageCategory(frontmatter(file)) === undefined)
    expect(missing).toEqual([])
  })

  it('numbers the component pages group by group, in the order of the categories', () => {
    const order = pages.map((file) =>
      categories.findIndex((category) => category.key === pageCategory(frontmatter(file))),
    )
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it('takes a frontmatter category over the item one', () => {
    expect(pageCategory({ category: 'utilities', component: 'button' })).toBe('utilities')
    expect(pageCategory({ component: 'button' })).toBe('actions')
    expect(pageCategory({})).toBeUndefined()
  })
})
