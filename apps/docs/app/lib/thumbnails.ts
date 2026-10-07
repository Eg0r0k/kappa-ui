const sources = import.meta.glob<string>('../assets/thumbnails/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const slugOf = (path: string) =>
  path
    .split('/')
    .at(-1)
    ?.replace(/\.svg$/, '') ?? ''

export const thumbnails: Record<string, string> = Object.fromEntries(
  Object.entries(sources).map(([file, svg]) => [slugOf(file), svg]),
)

export const thumbnailOf = (pagePath: string): string | undefined => thumbnails[slugOf(pagePath)]
