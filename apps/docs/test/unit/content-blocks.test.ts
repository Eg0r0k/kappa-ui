import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, it } from 'vitest'
import { parse } from 'yaml'

const contentDir = fileURLToPath(new URL('../../content', import.meta.url))
const markdown = (readdirSync(contentDir, { recursive: true }) as string[]).filter((file) => file.endsWith('.md'))

const blocks = /^::([a-z-]+)\n---\n([\s\S]*?)\n---\n::/gm

it('keeps every row field of an MDC block a string, so a colon inside backticks is quoted', () => {
  const offenders: string[] = []
  for (const file of markdown) {
    const source = readFileSync(join(contentDir, file), 'utf8')
    for (const [, name, yaml] of source.matchAll(blocks)) {
      let rows: Record<string, unknown>[]
      try {
        rows = (parse(yaml!) as { rows?: Record<string, unknown>[] }).rows ?? []
      } catch (error) {
        offenders.push(`${file} ::${name}: ${(error as Error).message.split('\n')[0]}`)
        continue
      }
      for (const row of rows)
        for (const [key, value] of Object.entries(row))
          if (typeof value !== 'string') offenders.push(`${file} ::${name}: ${key} is ${typeof value}`)
    }
  }
  expect(offenders).toEqual([])
})
