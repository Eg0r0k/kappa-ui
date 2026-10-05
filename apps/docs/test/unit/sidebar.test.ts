import { describe, expect, it } from 'vitest'

import {
  bestMatch,
  CHANGELOG_PATH,
  componentGroups,
  filterGroups,
  groupOf,
  highlight,
  modKey,
  navigablePages,
  neighbours,
  pageId,
  sectionOf,
  sidebarGroups,
  stepPage,
} from '~/lib/sidebar'

const nav = [
  {
    title: 'Getting Started',
    path: '/docs/getting-started',
    children: [{ title: 'Introduction', path: '/docs/getting-started/introduction' }],
  },
  {
    title: 'Components',
    path: '/docs/components',
    children: [
      { title: 'Button', path: '/docs/components/button', component: 'button' },
      { title: 'Toggle', path: '/docs/components/toggle', component: 'toggle' },
      { title: 'Input', path: '/docs/components/input', component: 'input', description: 'A text field.' },
      { title: 'Press Scale', path: '/docs/components/press-scale', category: 'utilities' },
    ],
  },
  { title: 'Forms', path: '/docs/forms', children: [{ title: 'Formisch', path: '/docs/forms/formisch' }] },
]

describe('sectionOf', () => {
  it('puts the catalogue and component pages in components, the rest in docs', () => {
    expect(sectionOf('/docs/components')).toBe('components')
    expect(sectionOf('/docs/components/button')).toBe('components')
    expect(sectionOf('/docs/components-extra')).toBe('docs')
    expect(sectionOf('/docs/getting-started/introduction')).toBe('docs')
    expect(sectionOf(CHANGELOG_PATH)).toBe('docs')
  })
})

describe('componentGroups', () => {
  it('groups component pages by category in category order, keeping page order', () => {
    expect(
      componentGroups(nav).map((group) => [group.key, group.title, group.pages.map((page) => page.title)]),
    ).toEqual([
      ['actions', 'Actions', ['Button', 'Toggle']],
      ['text-input', 'Text input', ['Input']],
      ['utilities', 'Utilities', ['Press Scale']],
    ])
  })

  it('carries the page fields the sidebar and catalogue read', () => {
    expect(componentGroups(nav)[1]!.pages[0]).toEqual({
      title: 'Input',
      path: '/docs/components/input',
      component: 'input',
      category: undefined,
      description: 'A text field.',
    })
  })
})

describe('sidebarGroups', () => {
  it('puts guides, component categories and the project group in one tree', () => {
    expect(sidebarGroups(nav).map((group) => [group.key, group.pages.map((page) => page.path)])).toEqual([
      ['getting-started', ['/docs/getting-started/introduction']],
      ['actions', ['/docs/components/button', '/docs/components/toggle']],
      ['text-input', ['/docs/components/input']],
      ['forms', ['/docs/forms/formisch']],
      ['utilities', ['/docs/components/press-scale']],
      ['project', [CHANGELOG_PATH]],
    ])
  })
})

describe('filterGroups', () => {
  it('keeps matching pages, case-insensitively, and drops empty groups', () => {
    const groups = componentGroups(nav)
    expect(filterGroups(groups, 'TOG').map((group) => group.pages.map((page) => page.title))).toEqual([['Toggle']])
    expect(filterGroups(groups, '  ')).toBe(groups)
    expect(filterGroups(groups, 'zzz')).toEqual([])
  })
})

describe('highlight', () => {
  it('splits every case-insensitive occurrence of the query out of the text', () => {
    expect(highlight('Toggle Group', 'g')).toEqual([
      { text: 'To', match: false },
      { text: 'g', match: true },
      { text: 'g', match: true },
      { text: 'le ', match: false },
      { text: 'G', match: true },
      { text: 'roup', match: false },
    ])
    expect(highlight('Button', '')).toEqual([{ text: 'Button', match: false }])
  })
})

describe('groupOf', () => {
  it('finds the group holding a path', () => {
    const groups = componentGroups(nav)
    expect(groupOf(groups, '/docs/components/input')).toBe('text-input')
    expect(groupOf(groups, '/docs/components')).toBeUndefined()
  })
})

describe('modKey', () => {
  it('reads Apple platforms as the command key', () => {
    expect(modKey('MacIntel')).toBe('⌘')
    expect(modKey('iPhone')).toBe('⌘')
    expect(modKey('Win32')).toBe('Ctrl')
    expect(modKey('')).toBe('Ctrl')
  })
})

describe('neighbours', () => {
  it('finds the previous and next page across groups', () => {
    const groups = componentGroups(nav)
    expect(neighbours(groups, '/docs/components/input')).toEqual({
      previous: expect.objectContaining({ title: 'Toggle' }),
      next: expect.objectContaining({ title: 'Press Scale' }),
    })
    expect(neighbours(groups, '/docs/components/button').previous).toBeUndefined()
    expect(neighbours(groups, '/docs/nowhere')).toEqual({})
  })
})

describe('bestMatch', () => {
  const groups = [
    {
      key: 'a',
      title: 'A',
      section: 'components' as const,
      pages: [
        { title: 'Alert Dialog', path: '/docs/components/alert-dialog' },
        { title: 'Dialog', path: '/docs/components/dialog' },
        { title: 'Toggle Group', path: '/docs/components/toggle-group' },
      ],
    },
  ]

  it('prefers a title prefix, then a word prefix, then any substring', () => {
    expect(bestMatch(groups, 'dia')?.path).toBe('/docs/components/dialog')
    expect(bestMatch(groups, 'Grou')?.path).toBe('/docs/components/toggle-group')
    expect(bestMatch(groups, 'ert')?.path).toBe('/docs/components/alert-dialog')
    expect(bestMatch(groups, 'zzz')).toBeUndefined()
    expect(bestMatch(groups, '  ')).toBeUndefined()
  })
})

describe('keyboard navigation', () => {
  const groups = [
    {
      key: 'actions',
      title: 'Actions',
      section: 'components' as const,
      pages: [
        { title: 'Button', path: '/docs/components/button' },
        { title: 'Toggle', path: '/docs/components/toggle' },
      ],
    },
    {
      key: 'forms',
      title: 'Forms',
      section: 'components' as const,
      pages: [{ title: 'Toggle Group', path: '/docs/components/toggle-group' }],
    },
  ]
  const paths = (pages: { path: string }[]) => pages.map((page) => page.path)

  it('walks the pages of open groups, or every match while filtering', () => {
    expect(paths(navigablePages(groups, '', ['forms']))).toEqual(['/docs/components/toggle-group'])
    expect(paths(navigablePages(groups, 'togg', []))).toEqual([
      '/docs/components/toggle',
      '/docs/components/toggle-group',
    ])
  })

  it('steps through the pages and wraps around at both ends', () => {
    const pages = navigablePages(groups, '', ['actions', 'forms'])
    expect(stepPage(pages, '/docs/components/button', 1)).toBe('/docs/components/toggle')
    expect(stepPage(pages, '/docs/components/toggle-group', 1)).toBe('/docs/components/button')
    expect(stepPage(pages, '/docs/components/button', -1)).toBe('/docs/components/toggle-group')
  })

  it('starts on the current page when it is listed, otherwise at the end it moves from', () => {
    const pages = navigablePages(groups, '', ['actions', 'forms'])
    expect(stepPage(pages, undefined, 1, '/docs/components/toggle')).toBe('/docs/components/toggle')
    expect(stepPage(pages, undefined, 1, '/docs/elsewhere')).toBe('/docs/components/button')
    expect(stepPage(pages, '/docs/gone', -1)).toBe('/docs/components/toggle-group')
    expect(stepPage([], undefined, 1)).toBeUndefined()
  })

  it('gives every page a stable element id under a prefix', () => {
    expect(pageId('v-1', '/docs/components/toggle-group')).toBe('v-1-docs-components-toggle-group')
  })
})
