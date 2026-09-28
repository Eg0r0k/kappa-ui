export type Rgb = readonly [number, number, number]

export interface ContrastCheck {
  label: string
  fg: string
  bg: string
  min: number
}

export type ContrastGrade = 'pass' | 'large' | 'fail'

const channel = (value: number) => {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export const luminance = ([r, g, b]: Rgb) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

export const contrastRatio = (a: Rgb, b: Rgb) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (high + 0.05) / (low + 0.05)
}

export const gradeOf = (ratio: number, min: number): ContrastGrade => {
  if (ratio >= min) return 'pass'
  return min > 3 && ratio >= 3 ? 'large' : 'fail'
}

export const formatRatio = (ratio: number) => `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`

export const statusChecks = (status: string, foreground = `${status}-foreground`, text = `${status}-text`) => [
  { label: 'Label on fill', fg: foreground, bg: status, min: 4.5 },
  { label: 'Text on the page', fg: text, bg: 'background', min: 4.5 },
]

export const themeChecks: ContrastCheck[] = [
  { label: 'Text', fg: 'foreground', bg: 'background', min: 4.5 },
  { label: 'Muted text', fg: 'muted-foreground', bg: 'background', min: 4.5 },
  { label: 'Muted text on muted', fg: 'muted-foreground', bg: 'muted', min: 4.5 },
  { label: 'Card text', fg: 'card-foreground', bg: 'card', min: 4.5 },
  { label: 'Primary label', fg: 'primary-foreground', bg: 'primary', min: 4.5 },
  { label: 'Primary text', fg: 'primary', bg: 'background', min: 4.5 },
  { label: 'Control borders', fg: 'input', bg: 'background', min: 3 },
  { label: 'Destructive label', fg: 'destructive-foreground', bg: 'destructive', min: 4.5 },
  { label: 'Destructive text', fg: 'destructive', bg: 'background', min: 4.5 },
  { label: 'Success label', fg: 'success-foreground', bg: 'success', min: 4.5 },
  { label: 'Success text', fg: 'success-text', bg: 'background', min: 4.5 },
  { label: 'Warning label', fg: 'warning-foreground', bg: 'warning', min: 4.5 },
  { label: 'Warning text', fg: 'warning-text', bg: 'background', min: 4.5 },
  { label: 'Info label', fg: 'info-foreground', bg: 'info', min: 4.5 },
  { label: 'Info text', fg: 'info-text', bg: 'background', min: 4.5 },
]

export const createContrastMeter = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d', { willReadFrequently: true })!

  const paint = (colors: string[]): Rgb => {
    context.clearRect(0, 0, 1, 1)
    for (const color of ['#fff', ...colors]) {
      context.fillStyle = color
      context.fillRect(0, 0, 1, 1)
    }
    const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data
    return [r, g, b]
  }

  return (scope: Element, checks: readonly ContrastCheck[]) => {
    const probe = document.createElement('span')
    probe.hidden = true
    scope.append(probe)
    const cache = new Map<string, string>()
    const read = (name: string) => {
      if (!cache.has(name)) {
        probe.style.color = `var(--${name})`
        cache.set(name, getComputedStyle(probe).color)
      }
      return cache.get(name)!
    }
    const page = read('background')
    const results = checks.map((check) => {
      const under = [page, read(check.bg)]
      const ratio = contrastRatio(paint([...under, read(check.fg)]), paint(under))
      return { ...check, ratio, grade: gradeOf(ratio, check.min) }
    })
    probe.remove()
    return results
  }
}

export type ContrastResult = ReturnType<ReturnType<typeof createContrastMeter>>[number]
