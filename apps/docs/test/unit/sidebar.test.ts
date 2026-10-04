import { describe, expect, it } from 'vitest'

import {
  CHANGELOG_PATH,
  componentGroups,
  docsGroups,
  filterGroups,
  groupOf,
  highlight,
  modKey,
  neighbours,
  sectionOf,
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

describe('docsGroups', () => {
  it('makes a group per guide folder and ends with the project group', () => {
    expect(docsGroups(nav).map((group) => [group.key, group.pages.map((page) => page.path)])).toEqual([
      ['getting-started', ['/docs/getting-started/introduction']],
      ['forms', ['/docs/forms/formisch']],
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
