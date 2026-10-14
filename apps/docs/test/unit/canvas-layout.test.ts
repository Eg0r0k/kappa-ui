import { describe, expect, it } from 'vitest'

import { type PackInput, type Packing, pack, ringDelta, wrap } from '~/lib/canvas-layout'

const items = (count: number): PackInput[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    width: 120 + ((i * 97) % 400),
    height: 80 + ((i * 61) % 300),
  }))

const overlaps = (tile: Packing) => {
  const pairs: string[] = []
  for (const [i, a] of tile.items.entries()) {
    for (const b of tile.items.slice(i + 1)) {
      const dx = Math.abs(ringDelta(a.x - b.x, tile.width))
      const dy = Math.abs(ringDelta(a.y - b.y, tile.height))
      if (dx < (a.width + b.width) / 2 && dy < (a.height + b.height) / 2) pairs.push(`${a.id} × ${b.id}`)
    }
  }
  return pairs
}

describe('ringDelta', () => {
  it('measures the shortest signed distance around the ring', () => {
    expect(ringDelta(10, 100)).toBe(10)
    expect(ringDelta(90, 100)).toBe(-10)
    expect(ringDelta(-90, 100)).toBe(10)
    expect(ringDelta(50, 100)).toBe(-50)
  })

  it('wraps a value into the ring', () => {
    expect(wrap(110, 100)).toBe(10)
    expect(wrap(-10, 100)).toBe(90)
  })
})

describe('pack', () => {
  const centre = { id: 'plaque', width: 460, height: 160 }
  const tile = pack(items(80), { aspect: 1, minWidth: 3000, minHeight: 3000, centre })

  it('places every item and the centre piece without overlaps, across the seams too', () => {
    expect(tile.items).toHaveLength(81)
    expect(overlaps(tile)).toEqual([])
  })

  it('pins the centre piece to the middle of the tile', () => {
    const plaque = tile.items.find((item) => item.id === 'plaque')!
    expect(plaque.x).toBe(tile.width / 2)
    expect(plaque.y).toBe(tile.height / 2)
  })

  it('keeps every centre inside the tile', () => {
    for (const item of tile.items) {
      expect(item.x).toBeGreaterThanOrEqual(0)
      expect(item.x).toBeLessThan(tile.width)
      expect(item.y).toBeGreaterThanOrEqual(0)
      expect(item.y).toBeLessThan(tile.height)
    }
  })

  it('is deterministic', () => {
    expect(pack(items(80), { aspect: 1, minWidth: 3000, minHeight: 3000, centre })).toEqual(tile)
  })

  it('respects the minimum side and keeps a square aspect', () => {
    expect(tile.width).toBeGreaterThanOrEqual(3000)
    expect(tile.width).toBe(tile.height)
  })

  it('mixes sizes instead of putting the biggest in the middle', () => {
    const sorted = tile.items
      .filter((item) => item.id !== 'plaque')
      .sort((a, b) => b.width * b.height - a.width * a.height)
    const distance = (item: { x: number; y: number }) =>
      Math.hypot(ringDelta(item.x - tile.width / 2, tile.width), ringDelta(item.y - tile.height / 2, tile.height))
    const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length
    const big = mean(sorted.slice(0, 10).map(distance))
    const small = mean(sorted.slice(-10).map(distance))
    expect(Math.abs(big - small)).toBeLessThan(tile.width / 4)
  })

  it('grows the tile when the items do not fit', () => {
    const crowded = pack(items(40), { aspect: 1, minWidth: 100, minHeight: 100 })
    expect(crowded.width).toBeGreaterThan(100)
    expect(overlaps(crowded)).toEqual([])
  })
})
