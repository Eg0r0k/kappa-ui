import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { nextTick } from 'vue'

import CornerAnatomy from '~/components/content/CornerAnatomy.vue'

const corners = {
  frame: 'borderTopRightRadius',
  inset: 'borderTopRightRadius',
  panel: 'borderTopLeftRadius',
  item: 'borderTopLeftRadius',
} as const
type Corner = keyof typeof corners

const radiusOf = (name: Corner) => getComputedStyle(document.querySelector(`[data-corner=${name}]`)!)[corners[name]]
const circleOf = (name: Corner) => document.querySelector<HTMLElement>(`[data-corner-circle=${name}]`)!.style.width
const names = Object.keys(corners) as Corner[]

it('draws both corners at 4× with the real utilities, concentric at the default radius', () => {
  const wrapper = mount(CornerAnatomy, { attachTo: document.body })
  expect(names.map(radiusOf)).toEqual(['32px', '16px', '48px', '32px'])
  expect(names.map(circleOf)).toEqual(['64px', '32px', '96px', '64px'])
  expect(wrapper.find('[data-corner-floor]').exists()).toBe(false)
  expect(wrapper.get('[data-test=corner-radius-value]').text()).toBe('8px')
})

it('follows the slider, squares everything at zero and marks the floor below 8px', async () => {
  const wrapper = mount(CornerAnatomy, { attachTo: document.body })
  await new Promise((resolve) => setTimeout(resolve, 20))
  wrapper.get<HTMLElement>('[data-slot=slider-thumb]').element.focus()
  await userEvent.keyboard('{Home}')
  await nextTick()
  expect(names.map(radiusOf)).toEqual(['0px', '0px', '0px', '0px'])
  expect(names.map(circleOf)).toEqual(['0px', '0px', '0px', '0px'])

  await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}')
  await nextTick()
  expect(wrapper.get('[data-test=corner-radius-value]').text()).toBe('4px')
  expect(names.map(radiusOf)).toEqual(['16px', '8px', '32px', '16px'])
  expect(wrapper.get('[data-corner-floor]').text()).toContain('R / 2')
})
