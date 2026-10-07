import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineComponent, h, ref } from 'vue'

import SidebarFilter from '~/components/layout/SidebarFilter.vue'
import SidebarNav from '~/components/layout/SidebarNav.vue'
import type { SidebarGroup } from '~/lib/sidebar'

const NuxtLink = defineComponent({
  props: { to: { type: [String, Object], required: true } },
  setup:
    (props, { slots, attrs }) =>
    () =>
      h('a', { ...attrs, href: typeof props.to === 'string' ? props.to : '' }, slots.default?.()),
})

const groups: SidebarGroup[] = [
  {
    key: 'actions',
    section: 'components',
    title: 'Actions',
    pages: [
      { title: 'Button', path: '/docs/components/button' },
      { title: 'Toggle Group', path: '/docs/components/toggle-group' },
    ],
  },
  { key: 'forms', title: 'Forms', section: 'components', pages: [{ title: 'Field', path: '/docs/components/field' }] },
]

const renderNav = (props: Record<string, unknown> = {}) => {
  const open = ref<string[]>((props.open as string[] | undefined) ?? ['actions'])
  const searched: string[] = []
  mount(
    {
      setup: () => () =>
        h(SidebarNav, {
          groups,
          activePath: '/docs/components/button',
          query: '',
          badges: { '/docs/components/toggle-group': 'new' },
          mod: 'Ctrl',
          onSearch: (query: string) => searched.push(query),
          ...props,
          open: open.value,
          'onUpdate:open': (value: string[]) => (open.value = value),
        }),
    },
    { attachTo: document.body, global: { components: { NuxtLink } } },
  )
  return { open, searched }
}

const visibleTexts = () =>
  [...document.querySelectorAll<HTMLAnchorElement>('nav a')]
    .filter((link) => link.checkVisibility())
    .map((link) =>
      [...link.childNodes]
        .filter((node) => node.nodeType !== Node.COMMENT_NODE)
        .map((node) => node.textContent?.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join(' '),
    )

describe('SidebarNav', () => {
  it('shows open groups, marks the current page and badges, and keeps the page outline out', async () => {
    renderNav()
    await expect.poll(visibleTexts).toEqual(['Button', 'Toggle Group new'])
    expect(document.querySelector('a[href="/docs/components/button"]')!.getAttribute('aria-current')).toBe('page')
    expect(document.querySelector('a[href^="#"]')).toBeNull()
  })

  it('opens and closes a group through v-model', async () => {
    const { open } = renderNav()
    await userEvent.click(document.querySelector<HTMLElement>('[data-group=forms] button')!)
    expect(open.value).toEqual(['actions', 'forms'])
    await userEvent.click(document.querySelector<HTMLElement>('[data-group=actions] button')!)
    expect(open.value).toEqual(['forms'])
  })

  it('turns the chevron of an open group only, even inside an open dialog', async () => {
    mount(
      {
        setup: () => () =>
          h('div', { 'data-state': 'open' }, [
            h(SidebarNav, { groups, activePath: '', query: '', badges: {}, mod: 'Ctrl', open: ['actions'] }),
          ]),
      },
      { attachTo: document.body, global: { components: { NuxtLink } } },
    )
    const rotation = (group: string) =>
      getComputedStyle(document.querySelector(`[data-group=${group}] button svg`)!).rotate
    await expect.poll(() => rotation('actions')).toBe('90deg')
    expect(rotation('forms')).toBe('none')
  })

  it('filters with highlighted matches, opening the groups that match', async () => {
    renderNav({ query: 'gro', open: [] })
    await expect.poll(visibleTexts).toEqual(['Toggle Group new'])
    expect(document.querySelector('mark')!.textContent).toBe('Gro')
  })

  it('offers search when nothing matches', async () => {
    const { searched } = renderNav({ query: 'zzz' })
    const searchButton = () =>
      [...document.querySelectorAll('button')].find((item) => item.textContent?.includes('Ctrl K'))
    await expect.poll(searchButton).toBeTruthy()
    await userEvent.click(searchButton()!)
    expect(searched).toEqual(['zzz'])
  })
})

describe('SidebarFilter', () => {
  it('takes focus on / unless the user is typing in a field', async () => {
    const query = ref('')
    mount(
      {
        setup: () => () =>
          h('div', [
            h(SidebarFilter, {
              modelValue: query.value,
              'onUpdate:modelValue': (value: string) => (query.value = value),
            }),
            h('textarea', { id: 'other' }),
          ]),
      },
      { attachTo: document.body },
    )
    const filter = document.querySelector<HTMLInputElement>('[data-slot=sidebar-filter] input')!
    await userEvent.keyboard('/')
    expect(document.activeElement).toBe(filter)
    await userEvent.keyboard('tog')
    expect(query.value).toBe('tog')
    await userEvent.click(document.querySelector('#other')!)
    await userEvent.keyboard('/')
    expect(document.activeElement!.id).toBe('other')
  })
})

describe('SidebarNav keyboard highlight', () => {
  it('marks the highlighted page, names every page link by id, and reports pointer moves', async () => {
    const highlighted: string[] = []
    renderNav({
      idPrefix: 'side-',
      highlighted: '/docs/components/toggle-group',
      onHighlight: (path: string) => highlighted.push(path),
    })
    const link = document.querySelector<HTMLAnchorElement>('#side--docs-components-toggle-group')!

    expect(link.dataset.highlighted).toBe('')
    expect(document.querySelector('#side--docs-components-button')!.hasAttribute('data-highlighted')).toBe(false)
    expect(document.querySelector('nav')!.id).toBe('side-nav')

    await userEvent.hover(document.querySelector('#side--docs-components-button')!)
    expect(highlighted.at(-1)).toBe('/docs/components/button')
  })
})

describe('SidebarFilter keys', () => {
  it('moves with the arrows, submits on Enter, clears on Escape and points at the highlighted page', async () => {
    const query = ref('tog')
    const moves: number[] = []
    let submits = 0
    mount(
      {
        setup: () => () =>
          h(SidebarFilter, {
            modelValue: query.value,
            'onUpdate:modelValue': (value: string) => (query.value = value),
            activeDescendant: 'side--docs-components-toggle',
            controls: 'side-nav',
            onMove: (delta: number) => moves.push(delta),
            onSubmit: () => submits++,
          }),
      },
      { attachTo: document.body },
    )
    const input = document.querySelector<HTMLInputElement>('[data-slot=sidebar-filter] input')!

    expect(input.getAttribute('aria-activedescendant')).toBe('side--docs-components-toggle')
    expect(input.getAttribute('aria-controls')).toBe('side-nav')

    input.focus()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Enter}')
    expect(moves).toEqual([1, 1, -1])
    expect(submits).toBe(1)

    await userEvent.keyboard('{Escape}')
    expect(query.value).toBe('')
  })
})

describe('SidebarFilter in a hidden sidebar', () => {
  it('leaves / alone when the sidebar is hidden with visibility', async () => {
    mount(
      { setup: () => () => h('aside', { style: 'visibility: hidden' }, [h(SidebarFilter, { modelValue: '' })]) },
      { attachTo: document.body },
    )
    let prevented: boolean | undefined
    window.addEventListener('keydown', (event) => (prevented = event.defaultPrevented), { once: true })

    await userEvent.keyboard('/')
    expect(prevented).toBe(false)
    expect(document.activeElement).toBe(document.body)
  })
})
