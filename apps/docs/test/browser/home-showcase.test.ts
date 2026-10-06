import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import HomeShowcase from '~/components/home/HomeShowcase.vue'
import { showcaseCss } from '~/lib/showcase-styles'

enableAutoUnmount(afterEach)

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = showcaseCss()
  document.head.append(style)
})

const mountShowcase = (styleKey: 'kappa' | 'github', height = '56rem') =>
  mount(HomeShowcase, { props: { styleKey }, attrs: { style: `height: ${height}` }, attachTo: document.body })

const rootOf = (wrapper: ReturnType<typeof mountShowcase>) =>
  wrapper.get('[data-slot="home-showcase"]').element as HTMLElement

describe('HomeShowcase', () => {
  it('mounts without Vue warnings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mountShowcase('kappa')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('scopes a preset to the showcase', () => {
    const root = rootOf(mountShowcase('github'))
    expect(root.dataset.showcaseStyle).toBe('github')
    expect(getComputedStyle(root).getPropertyValue('--radius').trim()).toBe('0.375rem')
    expect(getComputedStyle(document.documentElement).getPropertyValue('--radius').trim()).toBe('0.5rem')
  })

  it('paints the wall in the brand page colour', () => {
    const root = rootOf(mountShowcase('github'))
    expect(getComputedStyle(root).backgroundColor).toBe('rgb(246, 248, 250)')
  })

  it('cross-fades the whole showcase, so the snapshot keeps its clip and fade', () => {
    const root = rootOf(mountShowcase('kappa'))
    expect(getComputedStyle(root).viewTransitionName).toBe('home-showcase')
  })

  it('leaves Kappa unscoped', () => {
    expect(rootOf(mountShowcase('kappa')).hasAttribute('data-showcase-style')).toBe(false)
  })

  it('portals overlays into the showcase', async () => {
    const root = rootOf(mountShowcase('github'))
    const trigger = [...root.querySelectorAll<HTMLElement>('[data-slot="select-trigger"]')].find(
      (element) => !element.closest('[inert]'),
    )
    trigger!.focus()
    await userEvent.keyboard('{Enter}')
    await vi.waitFor(() => {
      const content = document.querySelector('[data-slot="select-content"]')
      expect(content?.closest('[data-showcase-portal]')).not.toBeNull()
    })
  })

  it('makes cards that are mostly clipped inert', async () => {
    const root = rootOf(mountShowcase('kappa', '20rem'))
    await vi.waitFor(() => {
      const cards = [...root.querySelectorAll<HTMLElement>('[data-showcase-card]')]
      expect(cards.some((card) => card.inert)).toBe(true)
      expect(cards.some((card) => !card.inert)).toBe(true)
    })
  })

  it('keeps the hidden parts of clipped cards inside the showcase', () => {
    const frame = document.createElement('div')
    frame.style.cssText = 'height: 20rem; overflow: auto'
    document.body.append(frame)
    mount(HomeShowcase, { props: { styleKey: 'kappa' }, attrs: { style: 'height: 20rem' }, attachTo: frame })
    expect(frame.scrollHeight).toBe(frame.clientHeight)
    frame.remove()
  })
})
