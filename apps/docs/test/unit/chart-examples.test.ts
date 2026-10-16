import { readdirSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const root = new URL('../../../../packages/registry/src/examples/', import.meta.url)
const chartFiles = (readdirSync(root, { recursive: true }) as string[])
  .map((file) => file.replaceAll('\\', '/'))
  .filter((file) => file.startsWith('chart') && file.endsWith('.vue'))

describe('chart examples', () => {
  it('exist', () => {
    expect(chartFiles.length).toBeGreaterThan(0)
  })

  it('build dates from numbers, never from an ISO string that parses as UTC', () => {
    const offenders = chartFiles.filter((file) => /new Date\(\s*["'`]/.test(readFileSync(new URL(file, root), 'utf8')))
    expect(offenders).toEqual([])
  })
})
