import { describe, expect, it } from 'vitest'

import { showcaseCss, showcaseFontUrl, showcaseStyles } from '~/lib/showcase-styles'

const scope = (key: string) => `[data-showcase-style="${key}"]`

const blockOf = (css: string, selector: string) => {
  const start = css.indexOf(`${selector}{`)
  return start === -1 ? '' : css.slice(start, css.indexOf('}', start))
}

describe('showcase styles', () => {
  it('offers Kappa first, then the five brands', () => {
    expect(showcaseStyles.map((style) => style.name)).toEqual([
      'Kappa',
      'Twitch',
      'GitHub',
      'Telegram',
      'Spotify',
      'Discord',
    ])
  })

  it('scopes every brand to a light and a dark block and leaves Kappa unscoped', () => {
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

  it('sets every brand colour in both modes, since the light block also applies in dark', () => {
    for (const style of showcaseStyles.filter((entry) => entry.light)) {
      expect(Object.keys(style.dark ?? {}).sort()).toEqual(Object.keys(style.light ?? {}).sort())
    }
  })

  it('copies the brand colours', () => {
    const css = showcaseCss()
    expect(blockOf(css, scope('github'))).toContain('--primary:#0969da;')
    expect(blockOf(css, scope('github'))).toContain('--success:#1f883d;')
    expect(blockOf(css, `.dark ${scope('github')}`)).toContain('--background:#010409;')
    expect(blockOf(css, scope('spotify'))).toContain('--primary-foreground:#000000;')
    expect(blockOf(css, `.dark ${scope('spotify')}`)).toContain('--primary-foreground:#000000;')
    expect(blockOf(css, `.dark ${scope('telegram')}`)).toContain('--primary:#3685fa;')
    expect(blockOf(css, scope('discord'))).toContain('--primary:#5865f2;')
    expect(blockOf(css, scope('twitch'))).toContain('--primary:#9147ff;')
  })

  it('sets each brand radius and font', () => {
    const css = showcaseCss()
    expect(blockOf(css, scope('github'))).toContain('--radius:0.375rem;')
    expect(blockOf(css, scope('twitch'))).toContain('--radius:0.25rem;')
    expect(blockOf(css, scope('spotify'))).toContain('font-family:"Figtree", ui-sans-serif')
  })

  it('resets the card edge a site theme could have changed, unless the brand draws one', () => {
    const css = showcaseCss()
    expect(blockOf(css, scope('twitch'))).toContain('--surface-border:transparent;')
    expect(blockOf(css, scope('github'))).toContain('--surface-border:#d1d9e0;')
    expect(blockOf(css, scope('github'))).not.toContain('--surface-border:transparent;')
  })

  it('loads every brand font', () => {
    const url = showcaseFontUrl()
    for (const family of ['Inter', 'Mona+Sans', 'Roboto', 'Figtree', 'Noto+Sans']) {
      expect(url).toContain(`family=${family}:`)
    }
  })
})
