import type { Rgba } from './payload.ts'

export type Converted = { rgba: Rgba; mapped: boolean }

const EPSILON = 1e-4
const OKLCH = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/

const round = (value: number) => Math.round(value * 1e4) / 1e4

const linearOf = (l: number, c: number, h: number) => {
  const hue = (h * Math.PI) / 180
  const a = c * Math.cos(hue)
  const b = c * Math.sin(hue)
  const long = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const medium = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const short = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ]
}

const inGamut = (rgb: number[]) => rgb.every((channel) => channel >= -EPSILON && channel <= 1 + EPSILON)

const encode = (channel: number) => {
  const linear = Math.min(1, Math.max(0, channel))
  return linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055
}

const maxChromaOf = (l: number, c: number, h: number) => {
  let low = 0
  let high = c
  while (high - low > 1e-5) {
    const middle = (low + high) / 2
    if (inGamut(linearOf(l, middle, h))) low = middle
    else high = middle
  }
  return low
}

export const oklchToRgba = (l: number, c: number, h: number, alpha = 1): Converted => {
  if (l >= 1) return { rgba: { r: 1, g: 1, b: 1, a: round(alpha) }, mapped: false }
  if (l <= 0) return { rgba: { r: 0, g: 0, b: 0, a: round(alpha) }, mapped: false }
  const mapped = !inGamut(linearOf(l, c, h))
  const [r, g, b] = linearOf(l, mapped ? maxChromaOf(l, c, h) : c, h).map((channel) => round(encode(channel)))
  return { rgba: { r, g, b, a: round(alpha) }, mapped }
}

const numberOf = (value: string, percent: string | undefined) => Number(value) / (percent ? 100 : 1)

export const isColor = (value: string) => value === 'transparent' || value.startsWith('oklch(')

export const parseColor = (value: string): Converted => {
  if (value === 'transparent') return { rgba: { r: 0, g: 0, b: 0, a: 0 }, mapped: false }
  const match = OKLCH.exec(value)
  if (!match) throw new Error(`Unsupported colour: ${value}`)
  const [, l, lPercent, c, h, alpha, alphaPercent] = match
  return oklchToRgba(numberOf(l, lPercent), Number(c), Number(h), alpha ? numberOf(alpha, alphaPercent) : 1)
}

export const withAlpha = (rgba: Rgba, factor: number): Rgba => ({ ...rgba, a: round(rgba.a * factor) })
