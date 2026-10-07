import { describe, expect, it, vi } from 'vitest'

import { badgeOf } from '~/lib/badges'

vi.mock('~/generated/badges.json', () => ({
  default: { button: { kind: 'new', until: '2026-11-06T12:00:00.000Z' } },
}))

const until = Date.parse('2026-11-06T12:00:00Z')

describe('badgeOf', () => {
  it('reads the built badge of a component', () => {
    expect(badgeOf('button', until - 1)).toBe('new')
  })

  it('drops the badge once its window has passed', () => {
    expect(badgeOf('button', until + 1)).toBeUndefined()
  })

  it('keeps the badge when no time is given', () => {
    expect(badgeOf('button')).toBe('new')
  })

  it('has nothing for an unknown or missing component', () => {
    expect(badgeOf('no-such-item', until - 1)).toBeUndefined()
    expect(badgeOf(undefined, until - 1)).toBeUndefined()
  })
})
