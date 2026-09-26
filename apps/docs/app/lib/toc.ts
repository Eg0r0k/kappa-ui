export type TocLink = { id: string; text: string; depth: number; children?: TocLink[] }

export const flattenToc = (links: readonly TocLink[]): TocLink[] =>
  links.flatMap((link) => [link, ...flattenToc(link.children ?? [])])

export const pickActiveHeading = (ordered: readonly string[], visible: ReadonlySet<string>, previous: string | null) =>
  ordered.find((id) => visible.has(id)) ?? previous
