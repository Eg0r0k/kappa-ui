import { readdirSync, readFileSync } from 'node:fs'

import { expect, it } from 'vitest'

import api from '~/generated/api.json'
import { findItem } from '~/lib/registry'

const dir = new URL('../../content/docs/2.components/', import.meta.url)
const pages = readdirSync(dir).filter((file) => file.endsWith('.md'))
const field = (source: string, name: string) => source.match(new RegExp(`^${name}: (.+)$`, 'm'))?.[1]?.trim()

it('lists every part of the page item in its api-reference, and only parts with API data', () => {
  const offenders: string[] = []
  for (const file of pages) {
    const source = readFileSync(new URL(file, dir), 'utf8')
    if (source.includes('::component-api')) offenders.push(`${file}: still uses ::component-api`)
    const listed = source.match(/::api-reference\{parts="([^"]*)"\}/)?.[1]?.split(',') ?? []
    for (const part of listed) if (!(part in api)) offenders.push(`${file}: ${part} has no API data`)
    const item = findItem(field(source, 'component') ?? '')
    if (item?.type !== 'registry:ui') continue
    const parts = item.files
      .filter((entry) => entry.path.endsWith('.vue'))
      .map((entry) =>
        entry.path
          .split('/')
          .at(-1)!
          .replace(/\.vue$/, ''),
      )
    for (const part of parts) if (!listed.includes(part)) offenders.push(`${file}: ${part} is not listed`)
  }
  expect(offenders).toEqual([])
})
