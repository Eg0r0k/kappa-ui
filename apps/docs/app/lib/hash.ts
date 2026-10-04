export const hashTarget = (hash: string, root: ParentNode = document) => {
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  if (!id) return null
  return (
    root.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`) ??
    root.querySelector<HTMLElement>(`[data-example="${CSS.escape(id)}"]`)
  )
}
