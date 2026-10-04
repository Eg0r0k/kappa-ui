export type PageExample = { name: string; slug: string; title: string }
export type PageOutline = { headings: { id: string; text: string }[]; examples: PageExample[] }

type OutlineSource = {
  body?: { toc?: { links?: { id: string; text: string; depth: number }[] } }
  examples: PageExample[]
  component?: string
}

export const outlineOf = (page: OutlineSource | null | undefined): PageOutline | undefined => {
  if (!page) return undefined
  const headings = (page.body?.toc?.links ?? [])
    .filter((link) => link.depth === 2)
    .map(({ id, text }) => ({ id, text }))
  if (page.component) headings.push({ id: 'changelog', text: 'Changelog' })
  return { headings, examples: page.examples }
}
