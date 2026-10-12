import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import ExampleControlsMenu from '~/components/ExampleControlsMenu.vue'

const controls = [
  { prop: 'size', values: ['sm', 'md', 'lg'], default: 'md' },
  { prop: 'disabled', values: [false, true], default: false },
]

it('keeps the canvas clear until Props opens the controls', async () => {
  const wrapper = mount(ExampleControlsMenu, {
    props: { controls, changed: false, modelValue: { size: 'md', disabled: false } },
    attachTo: document.body,
  })
  expect(document.querySelector('[data-slot=example-controls]')).toBeNull()
  const trigger = wrapper.findAll('button').find((button) => button.text().includes('Props'))!
  await userEvent.click(trigger.element)
  await expect.poll(() => document.querySelector('[data-slot=example-controls]')).not.toBeNull()
  expect(document.querySelector('[data-slot=example-controls]')!.textContent).toContain('size')
  wrapper.unmount()
})
