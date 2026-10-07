import { readdirSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { thumbnailOf, thumbnails } from '~/lib/thumbnails'

const dir = new URL('../../content/docs/2.components/', import.meta.url)
const slugs = readdirSync(dir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/^\d+\./, '').replace(/\.md$/, ''))
const COLOR = /(?:fill|stroke|stop-color)(?:="|:)([^";]+)/g

describe('thumbnails', () => {
  it('has a thumbnail for every component page', () => {
    expect(slugs.filter((slug) => !thumbnails[slug])).toEqual([])
  })

  it('has no thumbnail without a component page', () => {
    expect(Object.keys(thumbnails).filter((slug) => !slugs.includes(slug))).toEqual([])
  })

  it('finds a thumbnail by page path', () => {
    expect(thumbnailOf('/docs/components/button')).toBe(thumbnails.button)
    expect(thumbnailOf('/docs/components/nothing')).toBeUndefined()
  })

  it('draws every thumbnail on a 320 by 200 view box without a fixed size', () => {
    for (const [slug, svg] of Object.entries(thumbnails)) {
      expect(svg, slug).toMatch(/^<svg viewBox="0 0 320 200" fill="none" xmlns="http:\/\/www.w3.org\/2000\/svg">/)
    }
  })

  it('paints only with the site colour variables', () => {
    const literal = Object.entries(thumbnails).flatMap(([slug, svg]) =>
      [...svg.matchAll(COLOR)]
        .map((match) => match[1])
        .filter((value) => value !== 'none' && !/^var\(--[a-z-]+\)$/.test(value))
        .map((value) => `${slug}: ${value}`),
    )
    expect(literal).toEqual([])
  })

  it('keeps ids unique across the page', () => {
    const ids = Object.values(thumbnails).flatMap((svg) =>
      [...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]),
    )
    expect(ids.length).toBe(new Set(ids).size)
  })
})
