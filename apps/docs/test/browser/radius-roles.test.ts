import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { nextTick } from 'vue'

import RadiusRoles from '~/components/content/RadiusRoles.vue'

const radiusOf = (name: string) =>
  getComputedStyle(document.querySelector(`[data-radius-target=${name}]`)!).borderTopLeftRadius
const circleOf = (name: string) => document.querySelector<HTMLElement>(`[data-radius-circle=${name}]`)!.style.width
const thumbOf = (role: string) =>
  document.querySelector<HTMLElement>(`[data-radius-role=${role}] [data-slot=slider-thumb]`)!

it('draws every role at the base, with a circle the size of its corner and the step it reads', () => {
  const wrapper = mount(RadiusRoles, { attachTo: document.body })
  expect(['button', 'card', 'item'].map(radiusOf)).toEqual(['8px', '11.2px', '8px'])
  expect(['button', 'card', 'item'].map(circleOf)).toEqual(['16px', '22.4px', '16px'])
  expect(wrapper.get('[data-radius-label=card]').text()).toBe('rounded-surface-md 11.2px')
  expect(wrapper.get('[data-radius-label=button]').text()).toBe('rounded-control-md 8px')
})

it('moves one role from its slider and leaves the others alone', async () => {
  const wrapper = mount(RadiusRoles, { attachTo: document.body })
  await new Promise((resolve) => setTimeout(resolve, 20))
  thumbOf('surface').focus()
  await userEvent.keyboard('{Home}')
  await nextTick()
  expect(radiusOf('card')).toBe('0px')
  expect(circleOf('card')).toBe('0px')
  expect([radiusOf('button'), radiusOf('item')]).toEqual(['8px', '8px'])

  thumbOf('control').focus()
  await userEvent.keyboard('{End}')
  await nextTick()
  expect(radiusOf('button')).toBe('16px')
  expect(circleOf('button')).toBe('32px')
  expect(wrapper.get('[data-radius-role=control] [data-radius-value]').text()).toBe('16px')
  expect(wrapper.get('[data-radius-label=button]').text()).toBe('rounded-control-md 16px')
})
