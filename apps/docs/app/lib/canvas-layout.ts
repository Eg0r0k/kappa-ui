export type PackInput = { id: string; width: number; height: number }
export type Placed = PackInput & { x: number; y: number }
export type Packing = { width: number; height: number; items: Placed[] }
export type PackOptions = { aspect: number; minWidth: number; minHeight: number; centre?: PackInput }

const SEED = 20261013
const STEP = 20
const FILL = 0.7
const GROWTH = 1.15
const CENTRE_GAP = 64

const mulberry32 = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const halton = (index: number, base: number) => {
  let result = 0
  let fraction = 1 / base
  for (let i = index; i > 0; i = Math.floor(i / base)) {
    result += fraction * (i % base)
    fraction /= base
  }
  return result
}

/** Signed distance on a ring of length `size`, in [-size/2, size/2). */
export const ringDelta = (d: number, size: number) => {
  const m = (((d + size / 2) % size) + size) % size
  return m - size / 2
}

export const wrap = (value: number, size: number) => ((value % size) + size) % size

/**
 * Packs cards onto a torus: opposite edges meet, so tiling it gives an endless canvas with no seams.
 * Big cards go first, each aimed at its own point of a Halton sequence, and take the nearest free
 * spot; smaller cards settle into the gaps nearest their own points, so sizes mix everywhere.
 */
export const pack = (input: readonly PackInput[], options: PackOptions): Packing => {
  const random = mulberry32(SEED)
  const gaps = new Map(input.map((item) => [item.id, 20 + random() * 76]))
  const sorted = [...input].sort((a, b) => b.width * b.height - a.width * a.height)

  const all = options.centre ? [...sorted, options.centre] : sorted
  const area = all.reduce((sum, item) => sum + (item.width + 48) * (item.height + 48), 0)
  let width = Math.sqrt((area / FILL) * options.aspect)
  let height = area / FILL / width
  width = Math.max(width, options.minWidth)
  height = Math.max(height, options.minHeight)

  const reach = Math.max(width, height) / 2
  const offsets: [number, number][] = []
  for (let y = -reach; y <= reach; y += STEP) {
    for (let x = -reach; x <= reach; x += STEP) {
      if (x * x + y * y <= reach * reach) offsets.push([x, y])
    }
  }
  offsets.sort((a, b) => a[0] ** 2 + a[1] ** 2 - (b[0] ** 2 + b[1] ** 2))

  const placed: Placed[] = []
  if (options.centre) {
    gaps.set(options.centre.id, CENTRE_GAP)
    placed.push({ ...options.centre, x: width / 2, y: height / 2 })
  }
  const fits = (item: PackInput, x: number, y: number) => {
    const gap = gaps.get(item.id)!
    for (const other of placed) {
      const need = (gap + gaps.get(other.id)!) / 2
      if (
        Math.abs(ringDelta(x - other.x, width)) < (item.width + other.width) / 2 + need &&
        Math.abs(ringDelta(y - other.y, height)) < (item.height + other.height) / 2 + need
      ) {
        return false
      }
    }
    return true
  }

  const shiftX = random()
  const shiftY = random()
  for (const [index, item] of sorted.entries()) {
    const tx = wrap((halton(index + 1, 2) + shiftX) * width, width)
    const ty = wrap((halton(index + 1, 3) + shiftY) * height, height)
    const jitter = () => (random() - 0.5) * STEP
    let spot: [number, number] | undefined
    for (const [ox, oy] of offsets) {
      const x = wrap(tx + ox + jitter(), width)
      const y = wrap(ty + oy + jitter(), height)
      if (fits(item, x, y)) {
        spot = [x, y]
        break
      }
    }
    if (!spot) return pack(input, { ...options, minWidth: width * GROWTH, minHeight: height * GROWTH })
    placed.push({ ...item, x: spot[0], y: spot[1] })
  }

  return { width, height, items: placed }
}
