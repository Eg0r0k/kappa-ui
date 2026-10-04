import { afterEach, expect, it } from 'vitest'

import { hashTarget } from '~/lib/hash'

afterEach(() => {
  document.body.replaceChildren()
})

it('finds a heading by id first, then an example card by slug', () => {
  document.body.innerHTML = `
    <h2 id="loading">Loading</h2>
    <div data-example="loading"></div>
    <div data-example="sizes"></div>
    <h2 id="a b">Spaced</h2>
  `
  expect(hashTarget('#loading')!.tagName).toBe('H2')
  expect(hashTarget('#sizes')!.dataset.example).toBe('sizes')
  expect(hashTarget('#a%20b')!.id).toBe('a b')
  expect(hashTarget('#missing')).toBeNull()
  expect(hashTarget('')).toBeNull()
})
