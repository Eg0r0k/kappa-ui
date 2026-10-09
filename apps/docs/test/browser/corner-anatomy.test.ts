import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { nextTick } from 'vue'

import CornerAnatomy from '~/components/content/CornerAnatomy.vue'

const names = ['frame', 'inset'] as const

const radiusOf = (name: string) =>
  getComputedStyle(document.querySelector(`[data-corner=${name}]`)!).borderTopRightRadius
const circleOf = (name: string) => document.querySelector<HTMLElement>(`[data-corner-circle=${name}]`)!.style.width

it('draws the corner at 4× with the real utility, concentric at the default radius', () => {
  const wrapper = mount(CornerAnatomy, { attachTo: document.body })
  expect(names.map(radiusOf)).toEqual(['32px', '16px'])
  expect(names.map(circleOf)).toEqual(['64px', '32px'])
  expect(wrapper.find('[data-corner-floor]').exists()).toBe(false)
  expect(wrapper.get('[data-test=corner-radius-value]').text()).toBe('8px')
})

it('follows the slider, squares everything at zero and marks the floor below 8px', async () => {
  const wrapper = mount(CornerAnatomy, { attachTo: document.body })
  await new Promise((resolve) => setTimeout(resolve, 20))
  wrapper.get<HTMLElement>('[data-slot=slider-thumb]').element.focus()
  await userEvent.keyboard('{Home}')
  await nextTick()
  expect(names.map(radiusOf)).toEqual(['0px', '0px'])
  expect(names.map(circleOf)).toEqual(['0px', '0px'])

  await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}')
  await nextTick()
  expect(wrapper.get('[data-test=corner-radius-value]').text()).toBe('4px')
  expect(names.map(radiusOf)).toEqual(['16px', '8px'])
  expect(wrapper.get('[data-corner-floor]').text()).toContain('R / 2')
})
