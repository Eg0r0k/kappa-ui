import '~/assets/css/globals.css'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'

import DemoWidthHandle from '~/components/demo/DemoWidthHandle.vue'

enableAutoUnmount(afterEach)

const setup = (modelValue = 560) => {
  const wrapper = mount(DemoWidthHandle, {
    props: {
      modelValue,
      'onUpdate:modelValue': (value: number) => wrapper.setProps({ modelValue: value }),
    },
    attrs: { style: 'position: fixed; top: 0; bottom: 0; left: 500px' },
    attachTo: document.body,
  })
  return wrapper
}

const now = (wrapper: ReturnType<typeof setup>) => wrapper.attributes('aria-valuenow')

it('is a vertical separator with its bounds', () => {
  const wrapper = setup()
  expect(wrapper.attributes()).toMatchObject({
    role: 'separator',
    'aria-orientation': 'vertical',
    'aria-valuemin': '420',
    'aria-valuemax': '820',
    'aria-valuenow': '560',
    tabindex: '0',
  })
})

it('moves by 16px with the arrows, jumps with Home and End, and commits each step', async () => {
  const wrapper = setup()
  await wrapper.trigger('keydown', { key: 'ArrowLeft' })
  expect(now(wrapper)).toBe('576')
  await wrapper.trigger('keydown', { key: 'ArrowRight' })
  await wrapper.trigger('keydown', { key: 'ArrowRight' })
  expect(now(wrapper)).toBe('544')
  await wrapper.trigger('keydown', { key: 'Home' })
  expect(now(wrapper)).toBe('420')
  await wrapper.trigger('keydown', { key: 'ArrowRight' })
  expect(now(wrapper)).toBe('420')
  await wrapper.trigger('keydown', { key: 'End' })
  expect(now(wrapper)).toBe('820')
  expect(wrapper.emitted('commit')).toHaveLength(6)
})

it('resets on double-click', async () => {
  const wrapper = setup(700)
  await wrapper.trigger('dblclick')
  expect(now(wrapper)).toBe('560')
})

it('follows the pointer, clamped, and reports the drag', async () => {
  const wrapper = setup()
  const element = wrapper.element as HTMLElement
  const pointer = (type: string, clientX: number) =>
    element.dispatchEvent(new PointerEvent(type, { clientX, button: 0, pointerId: 1, bubbles: true }))
  pointer('pointerdown', 506)
  pointer('pointermove', 406)
  await wrapper.vm.$nextTick()
  expect(now(wrapper)).toBe('660')
  expect(wrapper.attributes('data-state')).toBe('drag')
  pointer('pointermove', 0)
  await wrapper.vm.$nextTick()
  expect(now(wrapper)).toBe('820')
  pointer('pointerup', 0)
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted('resizing')).toEqual([[true], [false]])
  expect(wrapper.emitted('commit')).toHaveLength(1)
})
