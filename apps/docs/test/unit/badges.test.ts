import { describe, expect, it } from 'vitest'

import badges from '~/generated/badges.json'
import { badgeOf } from '~/lib/badges'

describe('badgeOf', () => {
  const [name, badge] = Object.entries(badges as Record<string, { kind: string; until: string }>)[0]!

  it('reads the built badge, and drops it once its window has passed', () => {
    expect(badgeOf(name)).toBe(badge.kind)
    expect(badgeOf(name, Date.parse(badge.until) - 1)).toBe(badge.kind)
    expect(badgeOf(name, Date.parse(badge.until) + 1)).toBeUndefined()
  })

  it('has nothing for an unknown or missing component', () => {
    expect(badgeOf('no-such-item')).toBeUndefined()
    expect(badgeOf(undefined)).toBeUndefined()
  })
})
