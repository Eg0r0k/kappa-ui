export type RadiusRole = 'control' | 'surface' | 'item'

export interface RadiusKnobs {
  base: number
  control: number | null
  surface: number | null
  item: number | null
}

export const roleSteps: Record<RadiusRole, readonly { step: string; factor: number }[]> = {
  control: [
    { step: '3xs', factor: 0.2 },
    { step: '2xs', factor: 0.6 },
    { step: 'xs', factor: 0.8 },
    { step: 'sm', factor: 1 },
    { step: 'md', factor: 1 },
    { step: 'lg', factor: 1 },
    { step: 'xl', factor: 1.4 },
  ],
  surface: [
    { step: 'xs', factor: 0.8 },
    { step: 'sm', factor: 1 },
    { step: 'md', factor: 1.4 },
    { step: 'lg', factor: 1.8 },
    { step: 'xl', factor: 2.2 },
  ],
  item: [
    { step: 'xs', factor: 0.8 },
    { step: 'sm', factor: 1 },
    { step: 'md', factor: 1 },
    { step: 'lg', factor: 1 },
    { step: 'xl', factor: 1.4 },
  ],
}

const round = (value: number) => Math.round(value * 100) / 100

export const roleRadius = (knobs: RadiusKnobs, role: RadiusRole, step: string) => {
  const factor = roleSteps[role].find((entry) => entry.step === step)?.factor ?? 1
  return round((knobs[role] ?? knobs.base) * factor)
}

export const insetRadius = (outer: number, inset: number) => round(Math.max(outer - inset, outer / 2))

export const outsetRadius = (inner: number, inset: number) => round(inner + Math.min(inset, inner * 3))

export const formatPx = (value: number) => `${round(value)}px`
