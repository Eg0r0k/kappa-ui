import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { canvasEntries, pageSlug, readCanvasEntries } from '../../scripts/lib/canvas.ts'
import components from '~/assets/canvas/components.json'
import sizes from '~/assets/canvas/sizes.json'
import { CARD_CAPTION, CARD_PADDING, baseZoom, canvasComponents, falloff, footprint, smooth } from '~/lib/canvas'
import { registryItems } from '~/lib/registry'

const docsRoot = new URL('../../', import.meta.url)
const contentDir = new URL('content/docs/2.components/', docsRoot)
const pages = readdirSync(contentDir).filter((file) => file.endsWith('.md'))
const measured = sizes as Record<string, { desktop?: unknown; phone?: unknown } | undefined>

const page = (file: string, head: Record<string, string>, body = '::component-preview{name="x-demo"}\n::\n') => ({
  file,
  markdown: `---\n${Object.entries(head)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')}\n---\n\n${body}`,
})

const items = [
  { name: 'x', categories: ['actions'] },
  { name: 'x-demo', categories: ['example'] },
  { name: 'x-other', categories: ['example'] },
  { name: 'u', categories: ['utilities'] },
]

describe('canvasEntries', () => {
  it('reads the title, description and overview example of a component page', () => {
    const { entries, errors } = canvasEntries(
      [page('01.x.md', { title: 'X', description: 'Does x.', component: 'x' })],
      items,
    )
    expect(errors).toEqual([])
    expect(entries).toEqual([{ slug: 'x', title: 'X', description: 'Does x.', example: 'x-demo' }])
  })

  it('takes the first preview when the page has no <slug>-demo', () => {
    const body = '::component-preview{name="x-other"}\n::\n'
    const { entries } = canvasEntries([page('01.x.md', { title: 'X', description: 'D', component: 'x' }, body)], items)
    expect(entries[0]?.example).toBe('x-other')
  })

  it('leaves utilities out, by frontmatter or by the item', () => {
    const { entries } = canvasEntries(
      [
        page('01.x.md', { title: 'X', description: 'D', component: 'x', category: 'utilities' }),
        page('02.u.md', { title: 'U', description: 'D', component: 'u' }),
      ],
      items,
    )
    expect(entries).toEqual([])
  })

  it('reports missing fields, run-together sentences and unknown examples', () => {
    const { errors } = canvasEntries(
      [
        page('01.x.md', { component: 'x' }, ''),
        page(
          '02.y.md',
          { title: 'Y', description: 'One.Two', component: 'x' },
          '::component-preview{name="nope"}\n::\n',
        ),
      ],
      items,
    )
    expect(errors).toEqual([
      '01.x.md: no title',
      '01.x.md: no description',
      '01.x.md: no ::component-preview block',
      '02.y.md: sentences in the description run together',
      '02.y.md: example "nope" is not in registry.json',
    ])
  })

  it('orders entries like the docs', () => {
    const { entries } = canvasEntries(
      [
        page('02.b.md', { title: 'B', description: 'D', component: 'x' }),
        page('01.a.md', { title: 'A', description: 'D', component: 'x' }),
      ],
      items,
    )
    expect(entries.map((entry) => entry.slug)).toEqual(['a', 'b'])
  })
})

describe('the generated manifest', () => {
  it('matches the content pages', async () => {
    const { entries, errors } = await readCanvasEntries(fileURLToPath(docsRoot))
    expect(errors).toEqual([])
    expect(components).toEqual(entries)
  })

  it('names every component page that is not a utility, and nothing else', () => {
    const slugs = components.map((entry) => entry.slug)
    const utility = (file: string) => {
      const markdown = readFileSync(new URL(file, contentDir), 'utf8')
      if (/^category: utilities$/m.test(markdown)) return true
      const component = /^component: (.+)$/m.exec(markdown)?.[1]?.trim()
      return registryItems.find((item) => item.name === component)?.categories?.includes('utilities') ?? false
    }
    const wrong = pages.filter((file) => slugs.includes(pageSlug(file)) === utility(file))
    expect(wrong).toEqual([])
    expect(slugs.length).toBeGreaterThan(0)
  })

  it('has both measured sizes for every component', () => {
    const missing = components.flatMap((entry) => {
      const entrySizes = measured[entry.slug]
      return entrySizes?.desktop && entrySizes.phone ? [] : [entry.slug]
    })
    expect(missing).toEqual([])
  })

  it('has no measured size without a component', () => {
    const slugs = new Set(components.map((entry) => entry.slug))
    expect(Object.keys(sizes).filter((slug) => !slugs.has(slug))).toEqual([])
  })

  it('measured every component in a sensible range', () => {
    for (const [slug, entry] of Object.entries(sizes)) {
      for (const [key, size] of Object.entries(entry)) {
        expect(size.width, `${slug} ${key}`).toBeGreaterThanOrEqual(16)
        expect(size.width, `${slug} ${key}`).toBeLessThanOrEqual(1200)
        expect(size.height, `${slug} ${key}`).toBeGreaterThanOrEqual(4)
        expect(size.height, `${slug} ${key}`).toBeLessThanOrEqual(2000)
      }
    }
  })
})

describe('canvasComponents', () => {
  it('joins the manifest with its sizes and docs path', () => {
    const [button] = canvasComponents([{ slug: 'button', title: 'Button', description: 'D', example: 'button-demo' }], {
      button: { desktop: { width: 100, height: 40 }, phone: { width: 90, height: 40 } },
    })
    expect(button).toEqual({
      slug: 'button',
      title: 'Button',
      description: 'D',
      example: 'button-demo',
      path: '/docs/components/button',
      desktop: { width: 100, height: 40 },
      phone: { width: 90, height: 40 },
    })
  })

  it('falls back to the desktop size, then to a default, when a size is missing', () => {
    const [a, b] = canvasComponents(
      [
        { slug: 'a', title: 'A', description: 'D', example: 'a-demo' },
        { slug: 'b', title: 'B', description: 'D', example: 'b-demo' },
      ],
      { a: { desktop: { width: 100, height: 40 }, phone: { width: 100, height: 40 } } },
    )
    expect(a?.phone).toEqual({ width: 100, height: 40 })
    expect(b?.desktop).toEqual({ width: 320, height: 160 })
  })
})

describe('geometry', () => {
  it('pads the demo and keeps room for a caption wider than the demo', () => {
    expect(footprint({ width: 200, height: 100 }, 'Button')).toEqual({
      width: 200 + CARD_PADDING,
      height: 100 + CARD_PADDING + CARD_CAPTION,
    })
    expect(footprint({ width: 20, height: 20 }, 'Date Range Picker').width).toBe(Math.ceil(17 * 7.5) + 28)
  })

  it('smoothsteps between two edges', () => {
    expect(smooth(0, 1, -1)).toBe(0)
    expect(smooth(0, 1, 0.5)).toBe(0.5)
    expect(smooth(0, 1, 2)).toBe(1)
  })

  it('fits the widest card in the width and clamps the zoom', () => {
    expect(baseZoom(1440, 900, 800)).toBe(1)
    expect(baseZoom(780, 560, 600)).toBeCloseTo(560 / 700)
    expect(baseZoom(390, 844, 700)).toBeCloseTo(358 / 700)
    expect(baseZoom(200, 844, 800)).toBe(0.45)
    expect(baseZoom(4000, 4000, 800)).toBe(1)
  })

  it('keeps a card at full size in the middle and fades it out past the edge', () => {
    expect(falloff(0, 0, 720, 450)).toEqual({ scale: 1, opacity: 1, pull: 1 })
    const edge = falloff(720 * 1.3, 0, 720, 450)
    expect(edge.scale).toBeCloseTo(0.42)
    expect(edge.opacity).toBe(0)
    expect(edge.pull).toBeLessThan(1)
  })

  it('measures a tall phone against a screen at least 3:4, so the sides do not collapse', () => {
    const phone = falloff(170, 0, 195, 422)
    expect(phone.scale).toBe(1)
    expect(phone.opacity).toBe(1)
  })
})
