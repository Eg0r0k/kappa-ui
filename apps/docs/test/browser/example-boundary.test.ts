import '~/assets/css/globals.css'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import ExampleBoundary from '~/components/ExampleBoundary.vue'

enableAutoUnmount(afterEach)

it('shows Empty when the example throws, and Restart remounts it', async () => {
  let failures = 1
  const Flaky = defineComponent({
    setup: () => {
      if (failures > 0) {
        failures -= 1
        throw new Error('Boom')
      }
      return () => h('p', { 'data-testid': 'example' }, 'Mounted')
    },
  })
  const wrapper = mount(ExampleBoundary, { slots: { default: () => h(Flaky) }, attachTo: document.body })

  await expect.poll(() => wrapper.find('[data-slot=empty]').exists()).toBe(true)
  expect(wrapper.text()).toContain('Boom')
  expect(wrapper.emitted('error')).toEqual([['Boom']])

  await wrapper.find('button').trigger('click')
  await expect.poll(() => wrapper.find('[data-testid=example]').exists()).toBe(true)
  expect(wrapper.find('[data-slot=empty]').exists()).toBe(false)
})
