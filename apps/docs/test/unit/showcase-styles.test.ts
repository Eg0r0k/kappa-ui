import { describe, expect, it } from 'vitest'

import { showcaseCss, showcaseFontUrl, showcaseStyles } from '~/lib/showcase-styles'

const scope = (key: string) => `[data-showcase-style="${key}"]`

const blockOf = (css: string, selector: string) => {
  const start = css.indexOf(`${selector}{`)
  return start === -1 ? '' : css.slice(start, css.indexOf('}', start))
}

describe('showcase styles', () => {
  it('scopes every preset but Kappa to a light and a dark block', () => {
    const css = showcaseCss()
    for (const style of showcaseStyles) {
      if (style.key === 'kappa') {
        expect(css).not.toContain(scope(style.key))
        continue
      }
      expect(blockOf(css, scope(style.key))).not.toBe('')
      expect(blockOf(css, `.dark ${scope(style.key)}`)).not.toBe('')
    }
  })

  it('sets each preset radius and font', () => {
    const css = showcaseCss()
    expect(blockOf(css, scope('sharp'))).toContain('--radius:0rem;')
    expect(blockOf(css, scope('soft'))).toContain('--radius:1.25rem;')
    expect(blockOf(css, scope('terminal'))).toContain('font-family:"JetBrains Mono", ui-monospace')
  })

  it('gives Brutal a yellow primary, foreground borders and hard shadows', () => {
    const light = blockOf(showcaseCss(), scope('brutal'))
    expect(light).toContain('--primary:oklch(0.86 0.17 95);')
    expect(light).toContain('--surface-border:var(--foreground);')
    expect(light).toContain('--shadow-sm:3px 3px 0 0 var(--foreground);')
  })

  it('resets borders and shadows a site theme could have changed', () => {
    const soft = blockOf(showcaseCss(), scope('soft'))
    expect(soft).toContain('--surface-border:transparent;')
    expect(soft).toContain('--shadow-md:')
  })

  it('loads every preset font', () => {
    const url = showcaseFontUrl()
    for (const family of ['Plus+Jakarta+Sans', 'IBM+Plex+Sans', 'Space+Grotesk', 'JetBrains+Mono']) {
      expect(url).toContain(`family=${family}:`)
    }
  })
})
