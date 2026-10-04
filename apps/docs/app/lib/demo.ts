import type { Tone } from '~/lib/preview-protocol'

export const DEMO_WIDTH = { min: 420, max: 820, initial: 560, step: 16 }

export const clampWidth = (value: unknown) => {
  const width = Number(value)
  if (value === undefined || value === null || !Number.isFinite(width)) return DEMO_WIDTH.initial
  return Math.min(DEMO_WIDTH.max, Math.max(DEMO_WIDTH.min, Math.round(width)))
}

export const selectedExample = <T extends { name: string; slug: string }>(
  examples: readonly T[],
  hash: string,
  pageSlug: string,
) => {
  const slug = decodeURIComponent(hash.replace(/^#/, ''))
  return (
    examples.find((example) => example.slug === slug) ??
    examples.find((example) => example.name === `${pageSlug}-demo`) ??
    examples[0]
  )
}

export const neighbourExample = <T>(examples: readonly T[], current: T | undefined, delta: 1 | -1) => {
  const index = current === undefined ? -1 : examples.indexOf(current)
  if (index === -1) return undefined
  return examples[index + delta]
}

export const toneStyle = (tone: Tone) => {
  if (tone === 'primary') return ''
  const [fill, text] = tone === 'neutral' ? ['--foreground', '--background'] : [`--${tone}`, `--${tone}-foreground`]
  return `--primary: var(${fill}); --primary-foreground: var(${text})`
}

export const hasColorProp = (
  files: readonly { path: string }[],
  api: Record<string, { props: readonly { name: string }[] }>,
) =>
  files.some((file) => {
    const match = /(?:^|\/)src\/ui\/.+\/([^/]+)\.vue$/.exec(file.path)
    return match ? (api[match[1]!]?.props.some((prop) => prop.name === 'color') ?? false) : false
  })
