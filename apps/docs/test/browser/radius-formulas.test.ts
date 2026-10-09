import { expect, it } from 'vitest'

import { formatPx, insetRadius, outsetRadius, roleRadius, roleSteps } from '~/lib/radius'

// rounded-control-3xs rounded-control-2xs rounded-control-xs rounded-control-sm rounded-control-md rounded-control-lg rounded-control-xl rounded-surface-xs rounded-surface-sm rounded-surface-md rounded-surface-lg rounded-surface-xl rounded-item-xs rounded-item-sm rounded-item-md rounded-item-lg rounded-item-xl rounded-inset-[4px]/[6px] rounded-inset-[16px]/[4px] rounded-outset-[8px]/[4px] rounded-outset-[1px]/[4px]

const measure = (className: string, style = '') => {
  const element = document.createElement('div')
  element.className = className
  element.setAttribute('style', style)
  document.body.append(element)
  const value = getComputedStyle(element).borderTopLeftRadius
  element.remove()
  return value
}

it('matches the role utilities for a base and knobs set on the element', () => {
  const knobs = { base: 10, control: null, surface: 6, item: 14 }
  const style = '--radius: 10px; --surface-radius: 6px; --item-radius: 14px'
  for (const role of ['control', 'surface', 'item'] as const) {
    for (const { step } of roleSteps[role]) {
      expect(measure(`rounded-${role}-${step}`, style), `${role}-${step}`).toBe(formatPx(roleRadius(knobs, role, step)))
    }
  }
})

it('matches the nesting utilities', () => {
  expect(measure('rounded-inset-[4px]/[6px]')).toBe(formatPx(insetRadius(4, 6)))
  expect(measure('rounded-inset-[16px]/[4px]')).toBe(formatPx(insetRadius(16, 4)))
  expect(measure('rounded-outset-[8px]/[4px]')).toBe(formatPx(outsetRadius(8, 4)))
  expect(measure('rounded-outset-[1px]/[4px]')).toBe(formatPx(outsetRadius(1, 4)))
})
