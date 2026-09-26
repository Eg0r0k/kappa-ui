import { afterEach, expect, it } from 'vitest'

import { defaultTheme, siteCss, themeTokens } from '~/lib/theme'

const custom = { ...defaultTheme, hue: 150, neutral: 'slate' as const }
const token = (element: Element, name: string) => getComputedStyle(element).getPropertyValue(`--${name}`).trim()

afterEach(() => {
  document.documentElement.classList.remove('dark')
  document.querySelectorAll('[data-site-theme]').forEach((element) => element.remove())
  document.body.replaceChildren()
})

it('wins over the stylesheet in either theme and inside forced previews, even when loaded first', () => {
  const style = document.createElement('style')
  style.dataset.siteTheme = ''
  style.textContent = siteCss(custom)
  document.head.prepend(style)
  const { light, dark } = themeTokens(custom)

  const darkPreview = document.body.appendChild(document.createElement('div'))
  darkPreview.className = 'dark'
  const lightPreview = document.body.appendChild(document.createElement('div'))
  lightPreview.className = 'light'

  expect(token(document.documentElement, 'primary')).toBe(light.primary)
  expect(token(document.documentElement, 'background')).toBe(light.background)
  expect(token(darkPreview, 'primary')).toBe(dark.primary)

  document.documentElement.classList.add('dark')
  expect(token(document.documentElement, 'primary')).toBe(dark.primary)
  expect(token(document.documentElement, 'border')).toBe(dark.border)
  expect(token(lightPreview, 'primary')).toBe(light.primary)
})

it('resolves a chosen surface border inside each preview, not from the page', () => {
  const style = document.createElement('style')
  style.dataset.siteTheme = ''
  style.textContent = siteCss({ ...defaultTheme, surfaceBorder: 'strong' })
  document.head.prepend(style)

  const darkPreview = document.body.appendChild(document.createElement('div'))
  darkPreview.className = 'dark'

  expect(token(document.documentElement, 'surface-border')).toBe(token(document.documentElement, 'input'))
  expect(token(darkPreview, 'surface-border')).toBe(token(darkPreview, 'input'))
  expect(token(darkPreview, 'input')).not.toBe(token(document.documentElement, 'input'))
})
