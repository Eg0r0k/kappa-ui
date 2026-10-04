const PREVIEW = /^::component-preview\{([^}]*)\}/gm
const NAME = /\bname="([^"]+)"/

export const pageExamples = (markdown: string) =>
  [...markdown.matchAll(PREVIEW)].flatMap((match) => {
    const name = NAME.exec(match[1] ?? '')?.[1]
    return name ? [name] : []
  })

export const exampleSlug = (name: string, pageSlug: string) =>
  name.startsWith(`${pageSlug}-`) ? name.slice(pageSlug.length + 1) : name

export const overviewExample = (examples: readonly string[], pageSlug: string) =>
  examples.find((name) => name === `${pageSlug}-demo`) ?? examples[0]

export const pageSlugOf = (path: string) => path.replace(/\/+$/, '').split('/').at(-1) ?? ''
