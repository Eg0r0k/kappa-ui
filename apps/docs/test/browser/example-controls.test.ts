import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { nextTick } from 'vue'

import ExampleControls from '~/components/ExampleControls.vue'

const controls = [
  { prop: 'variant', values: ['solid', 'soft', 'outline'], default: 'solid' },
  { prop: 'color', values: ['primary', 'neutral', 'destructive', 'success', 'warning', 'info'], default: 'primary' },
  { prop: 'disabled', values: [false, true], default: false },
]

const render = (changed = false) => {
  const updates: Record<string, string | boolean>[] = []
  const wrapper = mount(ExampleControls, {
    props: {
      controls,
      changed,
      modelValue: { variant: 'solid', color: 'primary', disabled: false },
      'onUpdate:modelValue': (value: Record<string, string | boolean>) => updates.push(value),
    },
    attachTo: document.body,
  })
  return { wrapper, updates }
}

it('labels every control with its prop and picks the control by its values', () => {
  const { wrapper } = render()
  expect(wrapper.attributes('data-slot')).toBe('example-controls')
  expect(wrapper.text()).toContain('variant')
  expect(wrapper.findAll('[data-slot=select-trigger]')).toHaveLength(2)
  expect(wrapper.find('[data-slot=switch]').exists()).toBe(true)
  wrapper.unmount()
})

it('emits the whole value object with one prop changed', async () => {
  const { wrapper, updates } = render()
  await userEvent.click(wrapper.get('[data-slot=select-trigger]').element)
  const soft = [...document.querySelectorAll<HTMLElement>('[data-slot=select-item]')].find(
    (item) => item.textContent?.trim() === 'soft',
  )!
  await userEvent.click(soft)
  await userEvent.click(wrapper.get('[data-slot=switch]').element)
  await nextTick()
  expect(updates).toEqual([
    { variant: 'soft', color: 'primary', disabled: false },
    { variant: 'solid', color: 'primary', disabled: true },
  ])
  wrapper.unmount()
})

it('shows Reset only when something changed', async () => {
  const unchanged = render(false)
  expect(unchanged.wrapper.text()).not.toContain('Reset')
  unchanged.wrapper.unmount()
  const { wrapper } = render(true)
  const reset = wrapper.findAll('button').find((button) => button.text().includes('Reset'))!
  await userEvent.click(reset.element)
  expect(wrapper.emitted('reset')).toHaveLength(1)
  wrapper.unmount()
})
