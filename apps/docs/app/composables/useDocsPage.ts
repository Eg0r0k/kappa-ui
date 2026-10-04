import { exampleSlug, pageExamples, pageSlugOf } from '~/lib/examples'
import { findItem } from '~/lib/registry'

export type PageExample = { name: string; slug: string; title: string }
export type PageOutline = { headings: { id: string; text: string }[]; examples: PageExample[] }

export const useDocsPage = (path: () => string) =>
  useAsyncData(
    () => `docs:${path()}`,
    () => queryCollection('docs').path(path()).first(),
    {
      transform: (page) => {
        if (!page) return null
        const { rawbody, ...rest } = page
        const slug = pageSlugOf(rest.path)
        const examples = pageExamples(rawbody ?? '').map((name) => ({
          name,
          slug: exampleSlug(name, slug),
          title: findItem(name)?.title ?? name,
        }))
        return { ...rest, examples }
      },
    },
  )

type OutlineSource = {
  body?: { toc?: { links?: { id: string; text: string; depth: number }[] } }
  examples: PageExample[]
}

export const outlineOf = (page: OutlineSource | null | undefined): PageOutline | undefined => {
  if (!page) return undefined
  const headings = (page.body?.toc?.links ?? [])
    .filter((link) => link.depth === 2)
    .map(({ id, text }) => ({ id, text }))
  return { headings, examples: page.examples }
}
