import '~/assets/css/globals.css'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { h } from 'vue'

import LazyPreview from '~/components/LazyPreview.vue'

enableAutoUnmount(afterEach)

const props = { name: 'button-demo', src: 'about:blank', colorScheme: 'light', dir: 'ltr', siteTheme: '', rootMargin: '0px' } as const
const frames = (count: number) =>
  new Promise<void>((resolve) => {
    const tick = (left: number) => (left ? requestAnimationFrame(() => tick(left - 1)) : resolve())
    tick(count)
  })

it('mounts the iframe near the viewport and drops it when far', async () => {
  const wrapper = mount(
    { render: () => h('div', [h('div', { style: 'height: 3000px' }), h(LazyPreview, props)]) },
    { attachTo: document.body },
  )
  await frames(4)
  expect(wrapper.find('iframe').exists()).toBe(false)
  expect(wrapper.find('[data-slot=skeleton]').exists()).toBe(true)

  wrapper.find('[data-slot=lazy-preview]').element.scrollIntoView()
  await expect.poll(() => wrapper.find('iframe').exists()).toBe(true)

  window.scrollTo(0, 0)
  await expect.poll(() => wrapper.find('iframe').exists()).toBe(false)
})

it('never mounts the iframe of a hidden variant', async () => {
  const wrapper = mount(
    { render: () => h('div', { style: 'display: none' }, [h(LazyPreview, props)]) },
    { attachTo: document.body },
  )
  await frames(6)
  expect(wrapper.find('iframe').exists()).toBe(false)
})
