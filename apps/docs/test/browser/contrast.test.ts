import { afterEach, expect, it } from 'vitest'

import { createContrastMeter, themeChecks } from '~/lib/contrast'
import { defaultTheme, themeTokens } from '~/lib/theme'

afterEach(() => {
  document.body.replaceChildren()
})

const scope = (style: string) => {
  const element = document.body.appendChild(document.createElement('div'))
  element.setAttribute('style', style)
  return element
}

it('measures the rendered colours of two tokens', () => {
  const meter = createContrastMeter()
  const [result] = meter(scope('--background: rgb(255, 255, 255); --foreground: rgb(0, 0, 0)'), [
    { label: 'Text', fg: 'foreground', bg: 'background', min: 4.5 },
  ])
  expect(result!.ratio).toBe(21)
  expect(result!.grade).toBe('pass')
})

it('composites a translucent colour over the surface under it', () => {
  const meter = createContrastMeter()
  const [result] = meter(scope('--background: rgb(0, 0, 0); --input: rgb(255 255 255 / 0%)'), [
    { label: 'Borders', fg: 'input', bg: 'background', min: 3 },
  ])
  expect(result!.ratio).toBe(1)
  expect(result!.grade).toBe('fail')
})

it('passes every check with the default theme, in both themes', () => {
  const meter = createContrastMeter()

  const light = scope('')
  light.className = 'light'
  const dark = scope('')
  dark.className = 'dark'

  for (const [name, element] of [
    ['light', light],
    ['dark', dark],
  ] as const) {
    const failing = meter(element, themeChecks).filter((result) => result.grade !== 'pass')
    expect(
      failing.map((result) => `${result.label} ${result.ratio.toFixed(2)}`),
      name,
    ).toEqual([])
  }
  expect(themeTokens(defaultTheme).light.success).toBeUndefined()
})
