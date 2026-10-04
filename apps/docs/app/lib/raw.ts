export const rawPath = (pagePath: string) => `/raw${pagePath}.md`

export const pagePathOfRaw = (path: string) => {
  if (!path.startsWith('/raw/') || !path.endsWith('.md')) return undefined
  return path.slice('/raw'.length, -'.md'.length)
}
