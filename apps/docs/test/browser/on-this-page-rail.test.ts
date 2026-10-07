import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import OnThisPageRail from '~/components/layout/OnThisPageRail.vue'

const NuxtLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup:
    (props, { slots, attrs }) =>
    () =>
      h('a', { ...attrs, href: props.to }, slots.default?.()),
})

const outline = {
  headings: [
    { id: 'installation', text: 'Installation' },
    { id: 'examples', text: 'Examples' },
    { id: 'api-reference', text: 'API Reference' },
  ],
  examples: [
    { name: 'button-demo', slug: 'demo', title: 'Button demo' },
    { name: 'button-sizes', slug: 'sizes', title: 'Button sizes' },
  ],
}

describe('OnThisPageRail', () => {
  it('lists the headings with the examples under Examples, and marks the heading in view', () => {
    mount(OnThisPageRail, {
      props: { outline, active: 'examples' },
      attachTo: document.body,
      global: { components: { NuxtLink } },
    })
    const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-slot=on-this-page-rail] a')]
    expect(links.map((link) => [link.getAttribute('href'), link.textContent?.trim()])).toEqual([
      ['#installation', 'Installation'],
      ['#examples', 'Examples'],
      ['#demo', 'Button demo'],
      ['#sizes', 'Button sizes'],
      ['#api-reference', 'API Reference'],
    ])
    expect(document.querySelector('a[aria-current=location]')!.getAttribute('href')).toBe('#examples')
  })
})
