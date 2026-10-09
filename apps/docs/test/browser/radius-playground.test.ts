import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { nextTick } from 'vue'

import RadiusPlayground from '~/components/content/RadiusPlayground.vue'

const radiusOf = (selector: string) => getComputedStyle(document.querySelector(selector)!).borderTopLeftRadius

const press = async (button: Element, times: number) => {
  for (let index = 0; index < times; index++) {
    await userEvent.click(button)
    await nextTick()
  }
}

it('labels every element with its class and current radius, and follows the base', async () => {
  const wrapper = mount(RadiusPlayground, { attachTo: document.body })
  await wrapper.get('[data-test=show-radii]').trigger('click')
  expect(wrapper.get('[data-radius-label=input-group-button]').text()).toBe('rounded-inset · 4px')
  expect(wrapper.get('[data-radius-label=tabs-list]').text()).toBe('rounded-outset · 12px')
  await press(wrapper.get('[data-test=knob-base] [data-slot=input-number-decrement]').element, 4)
  expect(wrapper.get('[data-radius-label=input-group-button]').text()).toBe('rounded-inset · 2px')
  expect(radiusOf('[data-radius-target=input-group-button]')).toBe('2px')
})

it('lets a role knob leave Auto and override the base for that role only', async () => {
  const wrapper = mount(RadiusPlayground, { attachTo: document.body })
  await userEvent.click(wrapper.get('[data-test=knob-surface-auto]').element)
  expect(wrapper.get<HTMLInputElement>('[data-test=knob-surface] input').element.disabled).toBe(false)
  await press(wrapper.get('[data-test=knob-surface] [data-slot=input-number-decrement]').element, 8)
  expect(radiusOf('[data-radius-target=card]')).toBe('0px')
  expect(radiusOf('[data-radius-target=badge]')).not.toBe('0px')
})
