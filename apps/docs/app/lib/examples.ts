const PREVIEW = /^::(?:component-preview|example-grid)\{([^}]*)\}/gm
const NAME = /\bname="([^"]+)"/
const NAMES = /\bnames="([^"]+)"/

export const pageExamples = (markdown: string) =>
  [...markdown.matchAll(PREVIEW)].flatMap((match) => {
    const attributes = match[1] ?? ''
    const names = NAMES.exec(attributes)?.[1]
    if (names)
      return names
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
    const name = NAME.exec(attributes)?.[1]
    return name ? [name] : []
  })

export const exampleSlug = (name: string, pageSlug: string) =>
  name.startsWith(`${pageSlug}-`) ? name.slice(pageSlug.length + 1) : name

export const overviewExample = (examples: readonly string[], pageSlug: string) =>
  examples.find((name) => name === `${pageSlug}-demo`) ?? examples[0]

export const pageSlugOf = (path: string) => path.replace(/\/+$/, '').split('/').at(-1) ?? ''

export const exampleLabel = (title: string, pageTitle: string) => {
  const prefix = `${pageTitle.toLowerCase()} `
  if (!title.toLowerCase().startsWith(prefix)) return title
  const rest = title.slice(prefix.length).replace(/^[-–—]\s*/, '')
  if (!rest) return title
  return rest.charAt(0).toUpperCase() + rest.slice(1)
}
