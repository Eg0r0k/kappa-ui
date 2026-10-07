import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { h } from 'vue'

import Callout from '~/components/content/Callout.vue'
import DoDont from '~/components/content/DoDont.vue'

it('draws a note as an info alert and a warning as a warning alert', () => {
  const note = mount(Callout, { slots: { default: () => 'Note' } })
  expect(note.get('[data-slot=alert]').attributes('data-color')).toBe('info')
  const warning = mount(Callout, { props: { type: 'warning' }, slots: { default: () => 'Careful' } })
  expect(warning.get('[data-slot=alert]').attributes('data-color')).toBe('warning')
})

it('pairs a do and a dont card, each labelled', () => {
  const wrapper = mount(DoDont, {
    slots: { do: () => h('p', 'Use a label.'), dont: () => h('p', 'Rely on a placeholder.') },
  })
  const cards = wrapper.findAll('[data-slot=card]')
  expect(cards).toHaveLength(2)
  expect(cards[0]!.text()).toContain('Do')
  expect(cards[0]!.text()).toContain('Use a label.')
  expect(cards[1]!.text()).toContain('Don’t')
  expect(cards[1]!.text()).toContain('Rely on a placeholder.')
})
