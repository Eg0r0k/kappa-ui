import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { parse } from 'yaml'

import { overviewExample, pageExamples } from '../../app/lib/examples.ts'

export type CanvasEntry = { slug: string; title: string; description: string; example: string }
export type CanvasSize = { width: number; height: number }
export type CanvasSizes = Record<string, { desktop: CanvasSize; phone: CanvasSize }>

type ManifestItem = { name: string; categories?: string[] }
type Page = { file: string; markdown: string }

export const UTILITIES = 'utilities'

export const pageSlug = (file: string) => file.replace(/^\d+\./, '').replace(/\.md$/, '')

const frontmatter = (markdown: string) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)
  const data: unknown = match ? parse(match[1]!) : undefined
  return typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const canvasEntries = (pages: readonly Page[], items: readonly ManifestItem[]) => {
  const entries: CanvasEntry[] = []
  const errors: string[] = []
  const examples = new Set(items.filter((item) => item.categories?.includes('example')).map((item) => item.name))
  for (const page of [...pages].sort((a, b) => a.file.localeCompare(b.file))) {
    const head = frontmatter(page.markdown)
    const slug = pageSlug(page.file)
    const item = items.find((candidate) => candidate.name === text(head.component))
    const category = text(head.category) || item?.categories?.find((name) => name !== 'example')
    if (category === UTILITIES) continue
    const title = text(head.title)
    const description = text(head.description)
    const example = overviewExample(pageExamples(page.markdown), slug)
    if (!title) errors.push(`${page.file}: no title`)
    if (!description) errors.push(`${page.file}: no description`)
    if (/[a-z]\.[A-Z]/.test(description)) errors.push(`${page.file}: sentences in the description run together`)
    if (!example) errors.push(`${page.file}: no ::component-preview block`)
    else if (!examples.has(example)) errors.push(`${page.file}: example "${example}" is not in registry.json`)
    if (title && description && example) entries.push({ slug, title, description, example })
  }
  return { entries, errors }
}

export const readCanvasEntries = async (docsRoot: string) => {
  const dir = join(docsRoot, 'content/docs/2.components')
  const files = (await readdir(dir)).filter((file) => file.endsWith('.md'))
  const pages = await Promise.all(
    files.map(async (file) => ({ file, markdown: await readFile(join(dir, file), 'utf8') })),
  )
  const manifest = JSON.parse(await readFile(join(docsRoot, '../../packages/registry/registry.json'), 'utf8')) as {
    items: ManifestItem[]
  }
  return canvasEntries(pages, manifest.items)
}
