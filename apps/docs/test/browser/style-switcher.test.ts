import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { h } from 'vue'

import StyleSwitcher from '~/components/home/StyleSwitcher.vue'
import { showcaseStyles } from '~/lib/showcase-styles'

it('rounds the inner corners of the style toggles with the control radius', () => {
  const wrapper = mount(
    {
      render: () =>
        h('div', { style: '--control-radius: 3px' }, h(StyleSwitcher, { modelValue: showcaseStyles[0]!.key })),
    },
    { attachTo: document.body },
  )
  const items = [...document.querySelectorAll<HTMLElement>('[data-slot=toggle-group-item]')]
  expect(items.length).toBeGreaterThan(1)
  expect(getComputedStyle(items[1]!).borderTopLeftRadius).toBe('3px')
  wrapper.unmount()
})
