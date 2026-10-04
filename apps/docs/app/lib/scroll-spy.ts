export type HeadingPosition = { id: string; top: number; margin: number }

export const activeHeading = (headings: readonly HeadingPosition[]) =>
  headings.filter((heading) => heading.top <= heading.margin + 1).at(-1)?.id
