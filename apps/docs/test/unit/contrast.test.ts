import { describe, expect, it } from 'vitest'

import { contrastRatio, formatRatio, gradeOf, luminance } from '~/lib/contrast'

describe('contrast', () => {
  it('measures WCAG relative luminance and contrast', () => {
    expect(luminance([0, 0, 0])).toBe(0)
    expect(luminance([255, 255, 255])).toBe(1)
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBe(21)
    expect(contrastRatio([255, 255, 255], [0, 0, 0])).toBe(21)
    expect(contrastRatio([118, 118, 118], [255, 255, 255])).toBeCloseTo(4.54, 2)
  })

  it('grades against the target, with a middle grade for large text only', () => {
    expect(gradeOf(4.5, 4.5)).toBe('pass')
    expect(gradeOf(3.2, 4.5)).toBe('large')
    expect(gradeOf(2.9, 4.5)).toBe('fail')
    expect(gradeOf(2.9, 3)).toBe('fail')
    expect(gradeOf(3, 3)).toBe('pass')
  })

  it('rounds the ratio down, so a failing pair never reads as 4.50', () => {
    expect(formatRatio(4.499)).toBe('4.49:1')
    expect(formatRatio(21)).toBe('21.00:1')
  })
})
