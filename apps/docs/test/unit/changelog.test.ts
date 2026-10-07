import { describe, expect, it } from 'vitest'

import {
  buildChangelog,
  exportedNames,
  introduces,
  mentions,
  pascalName,
  parseChangelog,
  releaseDate,
  type Release,
} from '../../scripts/lib/changelog.ts'

const entry = (hash: string, text: string) =>
  `- [\`${hash}\`](https://github.com/Eg0r0k/kappa-ui/commit/${hash}aaaa) Thanks [@Eg0r0k](https://github.com/Eg0r0k)! - ${text}`

const markdown = [
  '# @kappa-ui/registry',
  '',
  '## 0.9.0',
  '',
  '### Minor Changes',
  '',
  entry('f3e1bd4', "New `AlertDialog`: shadcn's parts over Reka UI's AlertDialog."),
  '',
  entry('0c326fd', 'New `InputNumber`: a number field.'),
  '  ',
  '  `Input` now exports `textControlFrameVariant`.',
  '',
  `- [#12](https://github.com/Eg0r0k/kappa-ui/pull/12) ${entry('d9c272f', 'New `DatePicker`.').slice(2)}`,
  '',
  '### Patch Changes',
  '',
  entry('f4d7e8e', "ScrollArea's scrollbar carries `data-no-drag`."),
  '- Updated dependencies [[`e60d032`](https://github.com/Eg0r0k/kappa-ui/commit/e60d032)]:',
  '  - @kappa-ui/core@0.8.0',
  '',
  '## 0.8.0',
  '',
  '### Patch Changes',
  '',
  entry('a2a4d38', 'Button and Alert: the `outline` variant no longer paints `bg-background`.'),
].join('\n')

describe('parseChangelog', () => {
  it('reads releases, entries with their continuation lines, and skips dependency updates', () => {
    const releases = parseChangelog(markdown)
    expect(releases.map((release) => release.version)).toEqual(['0.9.0', '0.8.0'])
    expect(releases[0]!.entries.map((item) => [item.hash, item.bump])).toEqual([
      ['f3e1bd4', 'minor'],
      ['0c326fd', 'minor'],
      ['d9c272f', 'minor'],
      ['f4d7e8e', 'patch'],
    ])
    expect(releases[0]!.entries[1]!.text).toBe(
      'New `InputNumber`: a number field.\n\n`Input` now exports `textControlFrameVariant`.',
    )
    expect(releases[0]!.entries[0]!.url).toBe('https://github.com/Eg0r0k/kappa-ui/commit/f3e1bd4aaaa')
  })
})

describe('exportedNames', () => {
  it('collects default re-exports, named re-exports and declarations', () => {
    const source = [
      'export { default as Button } from "./Button.vue";',
      'export { buttonVariants, type ButtonVariants } from "./variants";',
      'export const buttonSizes = [];',
      'export type ButtonColor = "primary";',
      'import { cva } from "class-variance-authority";',
    ].join('\n')
    expect(exportedNames(source).sort()).toEqual([
      'Button',
      'ButtonColor',
      'ButtonVariants',
      'buttonSizes',
      'buttonVariants',
    ])
  })
})

describe('mentions', () => {
  it('matches a whole token only', () => {
    expect(mentions('Button and Alert: the outline', ['Button'])).toBe(true)
    expect(mentions('`ButtonGroupSeparator` keeps its width', ['Button'])).toBe(false)
    expect(mentions('a button', ['Button'])).toBe(false)
    expect(mentions('`AlertDialogMedia`, a sm size', ['AlertDialogMedia'])).toBe(true)
  })
})

describe('introduces', () => {
  it('recognises the three ways an entry introduces a component', () => {
    expect(introduces('New `AlertDialog`: parts', 'AlertDialog')).toBe(true)
    expect(introduces('Add the Table primitives', 'Table')).toBe(true)
    expect(introduces('Add HoverCard, from shadcn-vue', 'HoverCard')).toBe(true)
    expect(introduces('Stepper: `Stepper`, `StepperItem`', 'Stepper')).toBe(true)
    expect(introduces('`InputFloating` is the input with a floating label', 'InputFloating')).toBe(true)
    expect(introduces('Add `MenuTrigger`: a part', 'Menu')).toBe(false)
    expect(introduces('Drawer: `DrawerIndent` scales the page', 'Drawer')).toBe(false)
  })

  it('finds a component later in the list an entry opens with, by component or item name', () => {
    expect(introduces('New `Calendar` and `RangeCalendar`: a grid', 'RangeCalendar')).toBe(true)
    expect(introduces('New `Tabs`, `Tree` and `Toast`', 'Tree')).toBe(true)
    expect(introduces('New `navigation-menu` item: `NavigationMenu`', 'NavigationMenu', 'navigation-menu')).toBe(true)
    expect(introduces('New `Calendar`, built on `RangeCalendar`', 'RangeCalendar')).toBe(false)
    expect(introduces('`DatePicker` and `DateRangePicker` take a size', 'DateRangePicker')).toBe(false)
  })
})

describe('releaseDate', () => {
  it('takes the oldest commit that added the release heading', () => {
    const calls: string[][] = []
    const git = (args: string[]) => {
      calls.push(args)
      return '2026-10-03T10:00:00+03:00\n2026-10-04T09:00:00+03:00\n'
    }
    expect(releaseDate(git, 'packages/registry/CHANGELOG.md', '0.9.0')).toBe('2026-10-03T10:00:00+03:00')
    expect(calls[0]).toEqual([
      'log',
      '-S',
      '## 0.9.0',
      '--format=%cI',
      '--reverse',
      '--',
      'packages/registry/CHANGELOG.md',
    ])
  })

  it('fails with the release it could not date', () => {
    expect(() => releaseDate(() => '', 'packages/core/CHANGELOG.md', '0.2.0')).toThrow(
      'No commit adds "## 0.2.0" to packages/core/CHANGELOG.md. A shallow clone has no history; check out with fetch-depth: 0.',
    )
  })
})

describe('buildChangelog', () => {
  const [latest, previous] = parseChangelog(markdown)
  const releases: Release[] = [
    { ...latest!, package: 'registry', date: '2026-10-03T10:00:00.000Z' },
    { ...previous!, package: 'registry', date: '2026-08-01T10:00:00.000Z' },
  ]
  const items = [
    { name: 'alert-dialog', main: 'AlertDialog', tokens: ['AlertDialog', 'AlertDialogMedia'] },
    { name: 'input', main: 'Input', tokens: ['Input', 'textControlFrameVariant'] },
    { name: 'button', main: 'Button', tokens: ['Button', 'buttonVariants'] },
    { name: 'kbd', main: 'Kbd', tokens: ['Kbd'] },
  ]
  const data = buildChangelog(releases, items, new Date('2026-10-04T00:00:00.000Z'))

  it('keeps every release, newest first', () => {
    expect(data.releases.map((release) => release.version)).toEqual(['0.9.0', '0.8.0'])
  })

  it('groups the entries that mention an item by release', () => {
    expect(data.items['input']!.releases).toEqual([
      {
        package: 'registry',
        version: '0.9.0',
        date: '2026-10-03T10:00:00.000Z',
        entries: [
          {
            hash: '0c326fd',
            url: 'https://github.com/Eg0r0k/kappa-ui/commit/0c326fdaaaa',
            text: 'New `InputNumber`: a number field.\n\n`Input` now exports `textControlFrameVariant`.',
          },
        ],
      },
    ])
    expect(data.items['kbd']!.releases).toEqual([])
  })

  it('badges an item introduced in the last 30 days as new, one changed in them as updated', () => {
    expect(data.items['alert-dialog']!.badge).toEqual({ kind: 'new', until: '2026-11-02T10:00:00.000Z' })
    expect(data.items['input']!.badge).toEqual({ kind: 'updated', until: '2026-11-02T10:00:00.000Z' })
    expect(data.items['button']!.badge).toBeUndefined()
    expect(data.items['kbd']!.badge).toBeUndefined()
  })

  it('finds the introducing entry even when another release of the same day mentions the item first', () => {
    const core: Release = {
      package: 'core',
      version: '0.8.0',
      date: '2026-10-03T10:00:00.000Z',
      entries: [
        { hash: 'e60d032', url: 'u', bump: 'minor', text: '`@kappa-ui/core/dialog` exports `AlertDialogMedia`.' },
      ],
    }
    const both = buildChangelog([releases[0]!, core], items, new Date('2026-10-04T00:00:00.000Z'))
    expect(both.items['alert-dialog']!.badge?.kind).toBe('new')
  })
})

describe('pascalName', () => {
  it('turns an item name into its component name', () => {
    expect(pascalName('color-picker')).toBe('ColorPicker')
    expect(pascalName('drag')).toBe('Drag')
  })
})
