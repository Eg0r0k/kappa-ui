import { fileURLToPath, URL } from 'node:url'

import { describe, expect, it } from 'vitest'

import { typeMembers } from '../../scripts/lib/type-members.ts'

const registryRoot = fileURLToPath(new URL('../../../../packages/registry', import.meta.url))

describe('typeMembers', () => {
  it('lists the members of an exported type with their types', () => {
    const members = typeMembers(registryRoot, 'ui/scroll-area/index.ts', 'ScrollAreaApi')

    expect(members.map((member) => member.name)).toEqual([
      'getScrollTarget',
      'getScroll',
      'getScrollPosition',
      'getScrollPercentage',
      'setScrollPosition',
      'setScrollPercentage',
      'scrollTo',
      'reset',
      'refresh',
      'virtualizer',
    ])
    expect(members.find((member) => member.name === 'reset')?.type).toBe('() => void')
  })

  it('throws for a type the file does not export', () => {
    expect(() => typeMembers(registryRoot, 'ui/scroll-area/index.ts', 'Nope')).toThrow(
      'ui/scroll-area/index.ts does not export a type named "Nope"',
    )
  })
})
