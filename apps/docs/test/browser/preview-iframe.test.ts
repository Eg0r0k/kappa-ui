import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'

import PreviewIframe from '~/components/PreviewIframe.vue'

const fakePreview = () =>
  URL.createObjectURL(
    new Blob(
      [
        `<!doctype html><script>
          addEventListener('message', (event) => {
            if (event.data?.type !== 'kappa:state') return
            parent.postMessage({ type: 'kappa:size', height: event.data.dir === 'rtl' ? 400 : 300 }, location.origin)
            if (event.data.restart === 2) parent.postMessage({ type: 'kappa:error', message: 'Boom' }, location.origin)
          })
          parent.postMessage({ type: 'not-ours' }, location.origin)
          parent.postMessage({ type: 'kappa:ready' }, location.origin)
        </script>`,
      ],
      { type: 'text/html' },
    ),
  )

const height = (element: Element) => (element.querySelector('iframe') as HTMLIFrameElement).style.height

it('sends its state once the preview is ready and follows the reported height', async () => {
  const wrapper = mount(PreviewIframe, {
    props: { name: 'button-demo', src: fakePreview(), colorScheme: 'light', dir: 'ltr', siteTheme: '', minHeight: 100 },
    attachTo: document.body,
  })
  await expect.poll(() => wrapper.emitted('ready')?.length).toBe(1)
  await expect.poll(() => height(wrapper.element)).toBe('300px')

  await wrapper.setProps({ dir: 'rtl' })
  await expect.poll(() => height(wrapper.element)).toBe('400px')

  await wrapper.setProps({ restart: 2 })
  await expect.poll(() => wrapper.emitted('error')?.[0]).toEqual(['Boom'])
})

it('never shrinks below its minimum height', () => {
  const wrapper = mount(PreviewIframe, {
    props: { name: 'button-demo', src: 'about:blank', colorScheme: 'light', dir: 'ltr', siteTheme: '', minHeight: 288 },
    attachTo: document.body,
  })
  expect(height(wrapper.element)).toBe('288px')
})

it('takes the prerendered content height on load, before the preview reports one', async () => {
  const src = URL.createObjectURL(
    new Blob(
      [
        `<!doctype html><body style="margin:0"><div style="padding:20px 0">
          <div data-slot="preview-content" style="height:460px"></div>
        </div></body>`,
      ],
      { type: 'text/html' },
    ),
  )
  const wrapper = mount(PreviewIframe, {
    props: { name: 'button-demo', src, colorScheme: 'light', dir: 'ltr', siteTheme: '', minHeight: 100 },
    attachTo: document.body,
  })
  await expect.poll(() => height(wrapper.element)).toBe('500px')
  expect(wrapper.emitted('ready')).toBeUndefined()
})

it('points at the preview route by default', () => {
  const wrapper = mount(PreviewIframe, {
    props: { name: 'button-demo', colorScheme: 'dark', dir: 'ltr', siteTheme: '' },
    attachTo: document.body,
  })
  expect(wrapper.find('iframe').attributes('src')).toBe('/preview/button-demo')
  expect(wrapper.find('iframe').attributes('title')).toBe('button-demo')
})

it('gives the iframe the colour scheme of its preview, so no backdrop of the other scheme shows through', async () => {
  const wrapper = mount(PreviewIframe, {
    props: { name: 'button-demo', src: 'about:blank', colorScheme: 'dark', dir: 'ltr', siteTheme: '' },
    attachTo: document.body,
  })
  expect(wrapper.find('iframe').element.style.colorScheme).toBe('dark')
  await wrapper.setProps({ colorScheme: 'light' })
  expect(wrapper.find('iframe').element.style.colorScheme).toBe('light')
})
