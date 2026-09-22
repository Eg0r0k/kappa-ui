import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, onMounted } from 'vue'

import PreviewFrame from '~/components/content/PreviewFrame.vue'

const LIGHT_BACKGROUND = 'oklch(1 0 0)'
const DARK_BACKGROUND = 'oklch(0.145 0 0)'

const background = (element: Element) => getComputedStyle(element).getPropertyValue('--background').trim()

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
})
