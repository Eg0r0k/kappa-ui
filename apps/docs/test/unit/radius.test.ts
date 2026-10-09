import { expect, it } from 'vitest'

import { formatPx, insetRadius, outsetRadius, roleRadius, roleSteps } from '~/lib/radius'

const auto = { base: 8, control: null, surface: null, item: null }

it('derives each role step from the base or its knob', () => {
  expect(roleSteps.control.map(({ step }) => roleRadius(auto, 'control', step))).toEqual([1.6, 4.8, 6.4, 8, 8, 8, 11.2])
  expect(roleSteps.surface.map(({ step }) => roleRadius(auto, 'surface', step))).toEqual([6.4, 8, 11.2, 14.4, 17.6])
  expect(roleRadius({ ...auto, item: 20 }, 'item', 'xl')).toBe(28)
  expect(roleRadius({ ...auto, base: 0 }, 'control', 'xl')).toBe(0)
})

it('applies the inward floor and the outward damping', () => {
  expect([insetRadius(4, 6), insetRadius(8, 6), insetRadius(16, 4), insetRadius(0, 4)]).toEqual([2, 4, 12, 0])
  expect([outsetRadius(8, 4), outsetRadius(1, 4), outsetRadius(0, 4)]).toEqual([12, 4, 0])
})

it('prints px without float noise', () => {
  expect([formatPx(11.200000000000001), formatPx(8), formatPx(0)]).toEqual(['11.2px', '8px', '0px'])
})
