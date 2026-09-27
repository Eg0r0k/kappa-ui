import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, it } from 'vitest'

const contentDir = fileURLToPath(new URL('../../content', import.meta.url))
const markdown = (readdirSync(contentDir, { recursive: true }) as string[]).filter((file) => file.endsWith('.md'))

it("shows imports with the consumer's aliases in every page", () => {
  const offenders = markdown.filter((file) =>
    /["']@\/(ui|examples)\//.test(readFileSync(join(contentDir, file), 'utf8')),
  )
  expect(offenders).toEqual([])
})
