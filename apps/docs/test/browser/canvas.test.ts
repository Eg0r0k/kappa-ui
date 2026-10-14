import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineComponent, h, nextTick } from 'vue'

import ComponentCanvas from '~/components/home/canvas/ComponentCanvas.vue'
import DemoCard from '~/components/home/canvas/DemoCard.vue'
import DescriptionPanel from '~/components/home/canvas/DescriptionPanel.vue'
import MiniMap from '~/components/home/canvas/MiniMap.vue'
import type { CanvasComponent } from '~/lib/canvas'
import { pack } from '~/lib/canvas-layout'

const NuxtLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup:
    (props, { slots }) =>
    () =>
      h('a', { href: props.to }, slots.default?.()),
})

const Box = (width: number, height: number) =>
  defineComponent({
    setup: () => () => h('div', { 'data-slot': 'box', style: `width:${width}px;height:${height}px;background:#888` }),
  })

const component = (index: number): CanvasComponent => ({
  slug: `item-${index}`,
  title: `Item ${index}`,
  description: `Describes item ${index} in a few words.`,
  example: `item-${index}-demo`,
  path: `/docs/components/item-${index}`,
  desktop: { width: 300, height: 200 },
  phone: { width: 200, height: 160 },
})

const components = Array.from({ length: 60 }, (_, index) => component(index))
const boxes = new Map(components.map((entry) => [entry.slug, Box(entry.desktop.width, entry.desktop.height)]))
const load = (entry: CanvasComponent) => boxes.get(entry.slug)!

const settle = () => new Promise((resolve) => setTimeout(resolve, 400))

const mountCanvas = (mode: 'inline' | 'fullscreen' = 'inline', open: string | null = null) =>
  mount(ComponentCanvas, {
    props: { components, load, count: '60 components', mode, open },
    attrs: { style: 'width: 1000px; height: 700px' },
    attachTo: document.body,
  })

const cards = () => [...document.querySelectorAll<HTMLElement>('[data-item]')]

afterEach(() => {
  localStorage.clear()
})

describe('DemoCard', () => {
  it('keeps the measured box and makes a closed card inert', () => {
    const wrapper = mount(DemoCard, {
      props: { title: 'Button', component: Box(100, 40), width: 100, height: 40, live: true },
      attachTo: document.body,
    })
    const body = wrapper.get('[data-slot="demo-body"]').element as HTMLElement
    expect(body.style.width).toBe('100px')
    expect(body.style.height).toBe('40px')
    expect(body.inert).toBe(true)
    expect(body.hasAttribute('data-open-body')).toBe(false)
  })

  it('opens the body to the pointer', async () => {
    const wrapper = mount(DemoCard, {
      props: { title: 'Button', component: Box(100, 40), width: 100, height: 40, live: true, open: true },
      attachTo: document.body,
    })
    const body = wrapper.get('[data-slot="demo-body"]').element as HTMLElement
    expect(body.inert).toBe(false)
    expect(body.hasAttribute('data-open-body')).toBe(true)
    expect(wrapper.get('[data-slot="demo-card"]').classes()).toContain('ring-primary')
  })

  it('shows the sketch until the demo is live', async () => {
    const wrapper = mount(DemoCard, {
      props: { title: 'Button', component: Box(100, 40), width: 100, height: 40, thumbnail: '<svg data-sketch></svg>' },
      attachTo: document.body,
    })
    expect(wrapper.find('[data-sketch]').exists()).toBe(true)
    expect(wrapper.find('[data-slot="box"]').exists()).toBe(false)
    await wrapper.setProps({ live: true })
    expect(wrapper.find('[data-sketch]').exists()).toBe(false)
    expect(wrapper.find('[data-slot="box"]').exists()).toBe(true)
  })

  it('scales a demo that outgrows its box instead of clipping it', async () => {
    const wrapper = mount(DemoCard, {
      props: { title: 'Wide', component: Box(600, 300), width: 200, height: 100, live: true },
      attachTo: document.body,
    })
    await vi.waitFor(() => {
      const inner = wrapper.get('[data-slot="demo-body"] > div').element as HTMLElement
      const scale = Number(/scale\(([\d.]+)\)/.exec(inner.style.transform)?.[1])
      expect(scale).toBeLessThan(0.4)
    })
  })
})

describe('DescriptionPanel', () => {
  const entry = component(1)

  it('staggers the words and links to the docs page', () => {
    const wrapper = mount(DescriptionPanel, {
      props: { component: entry },
      attachTo: document.body,
      global: { components: { NuxtLink } },
    })
    const words = wrapper.findAll('p .kappa-canvas-word')
    expect(words.map((word) => word.text())).toEqual(entry.description.split(' '))
    expect((words[2]!.element as HTMLElement).style.getPropertyValue('--i')).toBe('3')
    const link = wrapper.get('a')
    expect(link.attributes('href')).toBe('/docs/components/item-1')
    expect(link.text()).toContain('Documentation')
    expect((link.element as HTMLElement).style.getPropertyValue('--i')).toBe(String(words.length + 1))
    expect(wrapper.attributes('aria-live')).toBe('polite')
  })

  it('keeps the link inline-flex so its icon stays on the line', () => {
    const wrapper = mount(DescriptionPanel, {
      props: { component: entry },
      attachTo: document.body,
      global: { components: { NuxtLink } },
    })
    expect(getComputedStyle(wrapper.get('a').element).display).toMatch(/flex$/)
    expect(getComputedStyle(wrapper.get('p .kappa-canvas-word').element).display).toBe('inline-block')
    const icon = wrapper.get('a svg').element.getBoundingClientRect()
    const label = wrapper.get('a').element.getBoundingClientRect()
    expect(Math.abs(icon.top + icon.height / 2 - (label.top + label.height / 2))).toBeLessThan(2)
  })

  it('closes from its button', async () => {
    const wrapper = mount(DescriptionPanel, {
      props: { component: entry },
      attachTo: document.body,
      global: { components: { NuxtLink } },
    })
    await wrapper.get('[aria-label="Close"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})

describe('MiniMap', () => {
  const tile = pack(
    components.slice(0, 10).map((entry) => ({ id: entry.slug, width: 300, height: 200 })),
    { aspect: 1, minWidth: 2000, minHeight: 2000, centre: { id: 'kappa-plaque', width: 460, height: 160 } },
  )

  it('draws every card and four copies of the viewport frame', () => {
    const wrapper = mount(MiniMap, { props: { tile, openId: 'item-2', size: 160 }, attachTo: document.body })
    expect(wrapper.findAll('svg rect')).toHaveLength(1 + tile.items.length + 4)
    expect(wrapper.findAll('svg rect.fill-primary')).toHaveLength(1)
    expect(wrapper.findAll('svg rect.fill-primary\\/40')).toHaveLength(1)
  })

  it('wraps the frame across the edge', async () => {
    const wrapper = mount(MiniMap, { props: { tile, openId: null, size: 160 }, attachTo: document.body })
    ;(wrapper.vm as unknown as { update: (x: number, y: number, w: number, h: number) => void }).update(
      100,
      100,
      800,
      600,
    )
    const frames = wrapper.findAll('svg rect.stroke-primary')
    expect(frames.map((frame) => [Number(frame.attributes('x')), Number(frame.attributes('y'))])).toEqual([
      [tile.width - 300, tile.height - 200],
      [-300, tile.height - 200],
      [tile.width - 300, -200],
      [-300, -200],
    ])
  })

  it('jumps to the point under the pointer', async () => {
    const wrapper = mount(MiniMap, { props: { tile, openId: null, size: 160 }, attachTo: document.body })
    const svg = wrapper.get('svg').element
    const bounds = svg.getBoundingClientRect()
    svg.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: bounds.left + bounds.width / 2,
        clientY: bounds.top + bounds.height / 4,
        pointerId: 1,
        bubbles: true,
      }),
    )
    const [x, y] = wrapper.emitted('jump')![0] as [number, number]
    expect(x).toBeCloseTo(tile.width / 2, -1)
    expect(y).toBeCloseTo(tile.height / 4, -1)
  })

  it('collapses into a button and remembers it', async () => {
    const wrapper = mount(MiniMap, { props: { tile, openId: null, size: 160 }, attachTo: document.body })
    await wrapper.get('[aria-label="Collapse map"]').trigger('click')
    expect(localStorage.getItem('kappa-canvas:map-collapsed')).toBe('1')
    expect(wrapper.find('[aria-label="Show map"]').exists()).toBe(true)
    expect((wrapper.element as HTMLElement).style.width).toBe('40px')
    wrapper.unmount()
    const again = mount(MiniMap, { props: { tile, openId: null, size: 160 }, attachTo: document.body })
    expect(again.find('[aria-label="Show map"]').exists()).toBe(true)
  })
})

describe('ComponentCanvas', () => {
  it('mounts without warnings and keeps only the cards on screen in the DOM', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mountCanvas()
    await settle()
    expect(warn).not.toHaveBeenCalled()
    expect(cards().length).toBeGreaterThan(0)
    expect(cards().length).toBeLessThan(components.length)
    expect(document.querySelector('[data-slot="canvas-plaque"]')).not.toBeNull()
  })

  it('mounts the demos one by one and keeps the closed ones inert', async () => {
    mountCanvas()
    await vi.waitFor(() => expect(document.querySelectorAll('[data-slot="box"]').length).toBeGreaterThan(0))
    await settle()
    await settle()
    expect(document.querySelectorAll('[data-slot="box"]').length).toBe(cards().length)
    expect(cards().every((card) => card.querySelector('[data-slot="demo-body"]')!.matches('[inert]'))).toBe(true)
  })

  it('opens a card on a press without movement and flies it to the centre', async () => {
    const wrapper = mountCanvas()
    await settle()
    const card = cards()[0]!
    const slug = card.dataset.item!
    const rect = card.getBoundingClientRect()
    const at = {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      pointerId: 1,
      button: 0,
      bubbles: true,
    }
    card.dispatchEvent(new PointerEvent('pointerdown', at))
    card.dispatchEvent(new PointerEvent('pointerup', at))
    await nextTick()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([slug])
    await wrapper.setProps({ open: slug })
    await new Promise((resolve) => setTimeout(resolve, 700))
    const open = document.querySelector<HTMLElement>(`[data-item="${slug}"]`)!
    expect(open.querySelector('[data-open-body]')).not.toBeNull()
    const box = open.getBoundingClientRect()
    const frame = wrapper.element.getBoundingClientRect()
    expect(Math.abs(box.left + box.width / 2 - (frame.left + frame.width / 2))).toBeLessThan(2)
    expect(Math.abs(box.top + box.height / 2 - (frame.top + frame.height / 2))).toBeLessThan(2)
    expect(open.style.zIndex).toBe('1000')
  })

  it('closes the open card on a press on empty canvas', async () => {
    const wrapper = mountCanvas('inline', 'item-0')
    await settle()
    const at = { clientX: 20, clientY: 20, pointerId: 1, button: 0, bubbles: true }
    wrapper.element.dispatchEvent(new PointerEvent('pointerdown', at))
    wrapper.element.dispatchEvent(new PointerEvent('pointerup', at))
    await nextTick()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([null])
  })

  it('hands a touch tap on a card to fullscreen while inline', async () => {
    const wrapper = mountCanvas()
    await settle()
    const card = cards()[0]!
    const rect = card.getBoundingClientRect()
    const at = {
      clientX: rect.left + 10,
      clientY: rect.top + 10,
      pointerId: 2,
      pointerType: 'touch',
      button: 0,
      bubbles: true,
    }
    card.dispatchEvent(new PointerEvent('pointerdown', at))
    card.dispatchEvent(new PointerEvent('pointerup', at))
    expect(wrapper.emitted('explore')).toEqual([[card.dataset.item]])
    expect(wrapper.emitted('update:open')).toBeUndefined()
  })

  it('leaves the wheel to the page while inline, except with Ctrl for zoom', async () => {
    const wrapper = mountCanvas()
    await settle()
    const scroll = new WheelEvent('wheel', { deltaY: 40, bubbles: true, cancelable: true })
    wrapper.element.dispatchEvent(scroll)
    expect(scroll.defaultPrevented).toBe(false)
    const zoom = new WheelEvent('wheel', { deltaY: 40, ctrlKey: true, bubbles: true, cancelable: true })
    wrapper.element.dispatchEvent(zoom)
    expect(zoom.defaultPrevented).toBe(true)
    expect(wrapper.classes()).toContain('touch-none')
  })

  it('takes the wheel fullscreen', async () => {
    const wrapper = mountCanvas('fullscreen')
    await settle()
    const scroll = new WheelEvent('wheel', { deltaY: 40, bubbles: true, cancelable: true })
    wrapper.element.dispatchEvent(scroll)
    expect(scroll.defaultPrevented).toBe(true)
    expect(wrapper.classes()).toContain('touch-none')
  })

  it('pans with the arrow keys and opens the focused card with Enter', async () => {
    const wrapper = mountCanvas()
    await settle()
    const before = cards().map((card) => [card.dataset.item, card.style.transform])
    ;(wrapper.element as HTMLElement).focus()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    const after = new Map(cards().map((card) => [card.dataset.item, card.style.transform]))
    expect(before.some(([id, transform]) => after.has(id) && after.get(id) !== transform)).toBe(true)
    const card = cards()[0]!
    card.focus()
    await userEvent.keyboard('{Enter}')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([card.dataset.item])
  })

  it('labels closed cards as buttons that open them', async () => {
    mountCanvas()
    await settle()
    const card = cards()[0]!
    expect(card.getAttribute('role')).toBe('button')
    expect(card.getAttribute('aria-label')).toBe(`Open Item ${card.dataset.item!.slice(5)}`)
    expect(card.tabIndex).toBe(0)
  })
})
