import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, onMounted } from 'vue'

import PreviewFrame from '~/components/content/PreviewFrame.vue'
import { Tabs, TabsList, TabsTrigger } from '@/ui/tabs'

const teleports = document.createElement('div')
teleports.id = 'teleports'
document.body.append(teleports)

const LIGHT_BACKGROUND = 'oklch(0.98 0 0)'
const DARK_BACKGROUND = 'oklch(0.145 0 0)'

const background = (element: Element) => getComputedStyle(element).getPropertyValue('--background').trim()

const tabs = () =>
  h(Tabs, { defaultValue: 'one' }, () =>
    h(TabsList, () => [h(TabsTrigger, { value: 'one' }, () => 'One'), h(TabsTrigger, { value: 'two' }, () => 'Two')]),
  )
const pill = async () => {
  await expect.poll(() => document.querySelector('[data-slot=tabs-indicator]')).not.toBeNull()
  return getComputedStyle(document.querySelector('[data-slot=tabs-indicator]')!).backgroundColor
}

afterEach(() => {
  document.documentElement.classList.remove('dark')
})

describe('PreviewFrame', () => {
  it('remounts its content when the direction changes', async () => {
    let mounts = 0
    const Probe = defineComponent({
      setup: () => {
        onMounted(() => {
          mounts += 1
        })
        return () => h('span', 'probe')
      },
    })
    const wrapper = mount(PreviewFrame, {
      props: { dir: 'ltr' },
      slots: { default: () => h(Probe) },
      attachTo: document.body,
    })

    expect(mounts).toBe(1)
    await wrapper.setProps({ dir: 'rtl' })
    expect(mounts).toBe(2)
    expect(wrapper.attributes('dir')).toBe('rtl')

    wrapper.unmount()
  })

  it('renders its overlay target outside the frame, with the frame theme and direction', () => {
    const wrapper = mount(PreviewFrame, { props: { dir: 'rtl', theme: 'dark' }, attachTo: document.body })
    const target = document.querySelector('[data-slot=preview-portal]')!

    expect(target.parentElement).toBe(teleports)
    expect(wrapper.element.contains(target)).toBe(false)
    expect(target.classList.contains('dark')).toBe(true)
    expect(target.getAttribute('dir')).toBe('rtl')

    wrapper.unmount()
  })

  it('inherits the document theme when no theme is set', () => {
    document.documentElement.classList.add('dark')
    const wrapper = mount(PreviewFrame, { props: { dir: 'ltr' }, attachTo: document.body })

    expect(background(wrapper.element)).toBe(DARK_BACKGROUND)

    wrapper.unmount()
  })

  it('scopes dark tokens to the frame', () => {
    const wrapper = mount(PreviewFrame, { props: { dir: 'ltr', theme: 'dark' }, attachTo: document.body })

    expect(background(wrapper.element)).toBe(DARK_BACKGROUND)
    expect(background(document.documentElement)).toBe(LIGHT_BACKGROUND)

    wrapper.unmount()
  })

  it('scopes light tokens to the frame inside a dark document', () => {
    document.documentElement.classList.add('dark')
    const wrapper = mount(PreviewFrame, { props: { dir: 'ltr', theme: 'light' }, attachTo: document.body })

    expect(background(wrapper.element)).toBe(LIGHT_BACKGROUND)
    expect(background(document.documentElement)).toBe(DARK_BACKGROUND)

    wrapper.unmount()
  })

  it('keeps dark: utilities out of a light frame inside a dark document, and in a dark frame inside a light one', async () => {
    document.documentElement.classList.add('dark')
    const light = mount(PreviewFrame, {
      props: { dir: 'ltr', theme: 'light' },
      slots: { default: tabs },
      attachTo: document.body,
    })
    expect(await pill()).toBe(LIGHT_BACKGROUND)
    light.unmount()

    document.documentElement.classList.remove('dark')
    const dark = mount(PreviewFrame, {
      props: { dir: 'ltr', theme: 'dark' },
      slots: { default: tabs },
      attachTo: document.body,
    })
    expect(await pill()).not.toBe(DARK_BACKGROUND)
    dark.unmount()
  })
})
