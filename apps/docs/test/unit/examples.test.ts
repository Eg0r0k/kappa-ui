import { readdirSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { exampleLabel, exampleSlug, overviewExample, pageExamples, pageSlugOf } from '~/lib/examples'
import { findItem, isExample } from '~/lib/registry'

const contentDir = new URL('../../content/docs/', import.meta.url)
const contentFiles = (readdirSync(contentDir, { recursive: true }) as string[])
  .map((file) => file.replaceAll('\\', '/'))
  .filter((file) => file.endsWith('.md'))
const slugOfFile = (file: string) =>
  file
    .split('/')
    .at(-1)!
    .replace(/^\d+\./, '')
    .replace(/\.md$/, '')
const examplesOf = (file: string) => pageExamples(readFileSync(new URL(file, contentDir), 'utf8'))

describe('pageExamples', () => {
  it('lists component previews in page order, whatever other attributes they carry', () => {
    const markdown = [
      '::component-preview{name="button-demo"}',
      '::',
      'Text',
      '::component-preview{class="h-96" name="button-sizes"}',
      '::',
      '  ::component-preview{name="indented-is-not-a-block"}',
    ].join('\n')
    expect(pageExamples(markdown)).toEqual(['button-demo', 'button-sizes'])
  })

  it('names only example items on every real page', () => {
    const offenders = contentFiles.flatMap((file) =>
      examplesOf(file)
        .filter((name) => {
          const item = findItem(name)
          return !item || !isExample(item)
        })
        .map((name) => `${file}: ${name}`),
    )
    expect(offenders).toEqual([])
  })

  it('gives every example on a real page its own slug', () => {
    const offenders = contentFiles.flatMap((file) => {
      const slugs = examplesOf(file).map((name) => exampleSlug(name, slugOfFile(file)))
      return slugs.filter((slug, index) => slugs.indexOf(slug) !== index).map((slug) => `${file}: ${slug}`)
    })
    expect(offenders).toEqual([])
  })
})

describe('exampleSlug', () => {
  it('drops the page prefix, and keeps a name from another page whole', () => {
    expect(exampleSlug('button-loading', 'button')).toBe('loading')
    expect(exampleSlug('button-group-demo', 'button')).toBe('group-demo')
    expect(exampleSlug('input-group-demo', 'button')).toBe('input-group-demo')
    expect(exampleSlug('button', 'button')).toBe('button')
  })
})

describe('overviewExample', () => {
  it('prefers the page demo, then the first example', () => {
    expect(overviewExample(['button-sizes', 'button-demo'], 'button')).toBe('button-demo')
    expect(overviewExample(['press-scale-card'], 'press-scale')).toBe('press-scale-card')
    expect(overviewExample([], 'button')).toBeUndefined()
  })
})

describe('pageSlugOf', () => {
  it('takes the last route segment', () => {
    expect(pageSlugOf('/docs/components/button-group')).toBe('button-group')
    expect(pageSlugOf('/docs/components/button-group/')).toBe('button-group')
  })
})

describe('exampleLabel', () => {
  it('drops the page title in front and capitalises what is left', () => {
    expect(exampleLabel('Button sizes', 'Button')).toBe('Sizes')
    expect(exampleLabel('Button with icons', 'Button')).toBe('With icons')
    expect(exampleLabel('button demo', 'Button')).toBe('Demo')
    expect(exampleLabel('Button group demo', 'Button Group')).toBe('Demo')
    expect(exampleLabel('Input group demo', 'Button')).toBe('Input group demo')
    expect(exampleLabel('Button', 'Button')).toBe('Button')
  })
})
