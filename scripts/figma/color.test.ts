import assert from 'node:assert/strict'
import { test } from 'node:test'

import { oklchToRgba, parseColor, withAlpha } from './color.ts'

const hexOf = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b]
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`

test('converts achromatic oklch to the Tailwind neutral greys', () => {
  assert.equal(hexOf(parseColor('oklch(0.145 0 0)').rgba), '#0a0a0a')
  assert.equal(hexOf(parseColor('oklch(0.205 0 0)').rgba), '#171717')
  assert.equal(hexOf(parseColor('oklch(0.922 0 0)').rgba), '#e5e5e5')
  assert.equal(hexOf(parseColor('oklch(0.985 0 0)').rgba), '#fafafa')
})

test('converts sRGB red back to #ff0000 without gamut mapping', () => {
  const { rgba, mapped } = parseColor('oklch(0.627955 0.257683 29.2339)')
  assert.equal(hexOf(rgba), '#ff0000')
  assert.equal(mapped, false)
})

test('clamps lightness 1 to white and 0 to black, keeping alpha', () => {
  assert.deepEqual(parseColor('oklch(1 0 0)').rgba, { r: 1, g: 1, b: 1, a: 1 })
  assert.deepEqual(parseColor('oklch(0 0 0 / 40%)').rgba, { r: 0, g: 0, b: 0, a: 0.4 })
})

test('reads alpha as a percentage or a number and lightness as a percentage', () => {
  assert.equal(parseColor('oklch(1 0 0 / 10%)').rgba.a, 0.1)
  assert.equal(parseColor('oklch(1 0 0 / 0.25)').rgba.a, 0.25)
  assert.equal(hexOf(parseColor('oklch(14.5% 0 0)').rgba), '#0a0a0a')
})

test('reduces the chroma of an out-of-gamut colour until it fits sRGB', () => {
  const { rgba, mapped } = oklchToRgba(0.7, 0.4, 150)
  assert.equal(mapped, true)
  for (const channel of [rgba.r, rgba.g, rgba.b]) assert.ok(channel >= 0 && channel <= 1)
  assert.ok(rgba.g > rgba.r && rgba.g > rgba.b)
})

test('reads transparent and rejects other syntaxes', () => {
  assert.deepEqual(parseColor('transparent').rgba, { r: 0, g: 0, b: 0, a: 0 })
  assert.throws(() => parseColor('#fff'), /Unsupported colour: #fff/)
  assert.throws(() => parseColor('oklch(from var(--brand) 0.48 c h)'), /Unsupported colour/)
})

test('scales alpha', () => {
  assert.deepEqual(withAlpha({ r: 1, g: 0, b: 0, a: 0.4 }, 0.12), { r: 1, g: 0, b: 0, a: 0.048 })
})
