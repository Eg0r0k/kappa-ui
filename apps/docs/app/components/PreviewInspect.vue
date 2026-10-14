<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'

type Rect = { left: number; top: number; width: number; height: number }
type Strip = Rect & { label: string }
type Font = { size: string; family: string; weight: string; tracking: string; color: string }
type Hover = {
  box: Rect
  content: Rect
  padStrips: Strip[]
  gapStrips: Strip[]
  anchor: string
  meta: string
  detail: string
  padding: string
  margin: string
  gap: string | null
  font: Font | null
}
type Tick = { pos: number; value: number; inside: boolean; labeled: boolean }

const STEP = 8
const LABEL_EVERY = 32
const RULER_HEIGHT = 18
const RULER_WIDTH = 22
const TIP_OFFSET = 8

const INTERACTIVE = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  'summary',
  ...[
    'button',
    'link',
    'tab',
    'option',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'checkbox',
    'radio',
    'switch',
    'combobox',
    'slider',
    'searchbox',
    'textbox',
    'spinbutton',
    'treeitem',
  ].map((role) => `[role="${role}"]`),
].join(',')
const MEDIA = new Set(['svg', 'img', 'video', 'canvas', 'picture', 'iframe'])

const layer = useTemplateRef<HTMLElement>('layer')
const tip = useTemplateRef<HTMLElement>('tip')
const frame = ref({ width: 0, height: 0 })
const content = ref<Rect | null>(null)
const origin = ref<Rect | null>(null)
const hover = ref<Hover | null>(null)
const tipSize = ref({ width: 0, height: 0 })
let pointer: { x: number; y: number } | null = null
let picked: HTMLElement | null = null
let leaf: HTMLElement | null = null
let frameId = 0

const number = (value: string) => Number.parseFloat(value) || 0
const rectOf = (element: Element): Rect => {
  const rect = element.getBoundingClientRect()
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
}
const px = (value: number) => `${value}px`
const rectStyle = (rect: Rect) => ({
  left: px(rect.left),
  top: px(rect.top),
  width: px(rect.width),
  height: px(rect.height),
})
const sides = (top: number, right: number, bottom: number, left: number) => {
  const round = Math.round
  if (top === right && right === bottom && bottom === left) return `${round(top)}px`
  if (top === bottom && left === right) return `${round(top)}px ${round(right)}px`
  return `${round(top)}px ${round(right)}px ${round(bottom)}px ${round(left)}px`
}
const hasText = (element: Element) =>
  [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0)
let swatch: CanvasRenderingContext2D | null | undefined
// the canvas normalises any colour the page can express to #rrggbb, or rgba() when it has alpha
const hex = (color: string) => {
  swatch ??= document.createElement('canvas').getContext(' 2d'.trim())
  if (!swatch) return color
  swatch.fillStyle = color
  return swatch.fillStyle
}
const fontOf = (element: Element): Font => {
  const style = getComputedStyle(element)
  const line = style.lineHeight === 'normal' ? 'normal' : px(Math.round(number(style.lineHeight)))
  const tracking = style.letterSpacing === 'normal' || style.letterSpacing === '0px' ? '0' : style.letterSpacing
  let weight = style.fontWeight
  const variation = style.fontVariationSettings
  if (variation && variation !== 'normal') {
    const wght = /wght["'\s]+([\d.]+)/.exec(variation)?.[1]
    const opsz = /opsz["'\s]+([\d.]+)/.exec(variation)?.[1]
    const parts = [wght ? `wght ${wght}` : null, opsz ? `opsz ${opsz}` : null].filter(Boolean)
    if (parts.length) weight = parts.join(' · ')
  }
  return {
    size: `${Math.round(number(style.fontSize))}px / ${line}`,
    family: style.fontFamily.split(',')[0]!.replace(/["']/g, '').trim(),
    weight,
    tracking,
    color: hex(style.color),
  }
}

const contentRoot = () => document.querySelector<HTMLElement>('[data-slot=preview-content]')
const originOf = (root: HTMLElement) => {
  let node = root.firstElementChild
  while (node && getComputedStyle(node).display === 'contents') node = node.firstElementChild
  return node
}

const interactive = (element: Element) => element.matches(INTERACTIVE)
const visual = (element: Element) => {
  if (MEDIA.has(element.tagName.toLowerCase())) return true
  if (element.getAttribute('aria-hidden') === 'true') return false
  if (element.hasAttribute('data-slot')) return true
  const style = getComputedStyle(element)
  const padding =
    number(style.paddingTop) + number(style.paddingRight) + number(style.paddingBottom) + number(style.paddingLeft)
  const border =
    number(style.borderTopWidth) +
    number(style.borderRightWidth) +
    number(style.borderBottomWidth) +
    number(style.borderLeftWidth)
  const painted = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent'
  return padding > 0 || border > 0 || painted || style.backgroundImage !== 'none'
}
const promote = (target: Element, root: HTMLElement): HTMLElement => {
  let element = target
  let svg = (target as SVGElement).ownerSVGElement
  while (svg?.ownerSVGElement) svg = svg.ownerSVGElement
  if (svg) element = svg
  if (interactive(element) || visual(element)) return element as HTMLElement
  for (
    let parent = element.parentElement;
    parent && parent !== root && parent !== document.body;
    parent = parent.parentElement
  ) {
    if (interactive(parent)) return parent
    if (visual(parent)) break
  }
  return element as HTMLElement
}

const measure = (element: HTMLElement, from: HTMLElement) => {
  const style = getComputedStyle(element)
  const box = rectOf(element)
  const [pt, pr, pb, pl] = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(number)
  const [mt, mr, mb, ml] = [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft].map(number)
  const label = (value: number) => String(Math.round(value))
  const padStrips: Strip[] = []
  if (pt! > 0) padStrips.push({ left: box.left, top: box.top, width: box.width, height: pt!, label: label(pt!) })
  if (pb! > 0) {
    padStrips.push({
      left: box.left,
      top: box.top + box.height - pb!,
      width: box.width,
      height: pb!,
      label: label(pb!),
    })
  }
  const inner = Math.max(0, box.height - pt! - pb!)
  if (pl! > 0) padStrips.push({ left: box.left, top: box.top + pt!, width: pl!, height: inner, label: label(pl!) })
  if (pr! > 0) {
    padStrips.push({
      left: box.left + box.width - pr!,
      top: box.top + pt!,
      width: pr!,
      height: inner,
      label: label(pr!),
    })
  }

  let container: HTMLElement = element
  let containerStyle = style
  for (let node: HTMLElement | null = from; node && node !== element; node = node.parentElement) {
    const candidate = getComputedStyle(node)
    const laid = candidate.display.includes('flex') || candidate.display.includes('grid')
    if (laid && node.children.length > 1) {
      container = node
      containerStyle = candidate
      break
    }
  }
  const layout = containerStyle.display.includes('flex') || containerStyle.display.includes('grid')
  const gapStrips: Strip[] = []
  if (layout) {
    const rects = [...container.children].map((child) => child.getBoundingClientRect())
    for (let index = 0; index < rects.length - 1; index++) {
      const a = rects[index]!
      const b = rects[index + 1]!
      const dx = b.left - a.right
      const dy = b.top - a.bottom
      if (dx > 1) {
        gapStrips.push({
          left: a.right,
          top: Math.min(a.top, b.top),
          width: dx,
          height: Math.max(a.height, b.height),
          label: label(dx),
        })
      } else if (dy > 1) {
        gapStrips.push({
          left: Math.min(a.left, b.left),
          top: a.bottom,
          width: Math.max(a.width, b.width),
          height: dy,
          label: label(dy),
        })
      }
    }
  }

  const tag = element.tagName.toLowerCase()
  const slot = element.dataset.slot
  const direction = style.display.includes('flex') ? ` ${style.flexDirection.startsWith('column') ? 'col' : 'row'}` : ''
  const { variant, size, color } = element.dataset
  const gap = Math.max(number(containerStyle.columnGap), number(containerStyle.rowGap))
  const text = hasText(from) ? from : hasText(element) ? element : null
  hover.value = {
    box,
    content: { left: box.left + pl!, top: box.top + pt!, width: Math.max(0, box.width - pl! - pr!), height: inner },
    padStrips,
    gapStrips,
    anchor: slot ?? element.tagName,
    meta: `${slot ? `${tag} · ` : ''}${style.display}${direction} · ${Math.round(box.width)} × ${Math.round(box.height)}`,
    detail: [variant, size, color].filter(Boolean).join(' · '),
    padding: sides(pt!, pr!, pb!, pl!),
    margin: sides(mt!, mr!, mb!, ml!),
    gap: layout && gap > 0 ? px(Math.round(gap)) : null,
    font: text ? fontOf(text) : null,
  }
}

const clear = () => {
  picked = null
  leaf = null
  hover.value = null
}

const pick = (x: number, y: number) => {
  const root = contentRoot()
  if (!root) return
  const target = document.elementsFromPoint(x, y).find((element) => {
    if (element.closest('[data-slot=inspect-layer]')) return false
    if (!(root.contains(element) && element !== root)) {
      const panel = element.closest('[role="menu"],[role="listbox"]')
      if (!panel) return false
      const labelledBy = panel.getAttribute('aria-labelledby')
      const owned = !!labelledBy && root.contains(document.getElementById(labelledBy))
      const controlled = !!panel.id && root.querySelector(`[aria-controls="${CSS.escape(panel.id)}"]`) !== null
      if (!owned && !controlled) return false
    }
    const rect = element.getBoundingClientRect()
    return rect.width >= 1 && rect.height >= 1
  })
  if (!target) {
    clear()
    return
  }
  leaf = target as HTMLElement
  picked = promote(target, root)
  measure(picked, leaf)
}

const measureFrame = () => {
  frameId = 0
  frame.value = { width: window.innerWidth, height: window.innerHeight }
  const root = contentRoot()
  content.value = root ? rectOf(root) : null
  const first = root ? originOf(root) : null
  origin.value = first ? rectOf(first) : content.value
  if (picked?.isConnected) measure(picked, leaf?.isConnected ? leaf : picked)
  else if (pointer) pick(pointer.x, pointer.y)
  else if (picked) clear()
}

const schedule = () => {
  if (!frameId) frameId = requestAnimationFrame(measureFrame)
}

const onMove = (event: MouseEvent) => {
  pointer = { x: event.clientX, y: event.clientY }
  cancelAnimationFrame(frameId)
  frameId = requestAnimationFrame(() => {
    frameId = 0
    pick(event.clientX, event.clientY)
  })
}

const onLeave = () => {
  pointer = null
  clear()
}

const ticks = (start: number, length: number, extent: number): Tick[] => {
  if (!origin.value || extent <= 0) return []
  const list: Tick[] = []
  const first = Math.ceil(-start / STEP)
  const last = Math.floor((extent - start) / STEP)
  for (let index = first; index <= last; index++) {
    const value = index * STEP
    const inside = value >= 0 && value <= length + 0.5
    list.push({ pos: start + value, value, inside, labeled: inside && value % LABEL_EVERY === 0 })
  }
  return list
}
const xTicks = computed(() =>
  ticks(origin.value?.left ?? 0, origin.value?.width ?? 0, frame.value.width).filter((tick) => tick.pos >= RULER_WIDTH),
)
const yTicks = computed(() =>
  ticks(origin.value?.top ?? 0, origin.value?.height ?? 0, frame.value.height).filter(
    (tick) => tick.pos >= RULER_HEIGHT,
  ),
)
const tickOpacity = (tick: Tick) => (tick.inside ? (tick.labeled ? 0.9 : 0.45) : 0.16)
const rulerSpan = (start: number, length: number, corner: number) => ({
  start: Math.max(start, corner),
  length: Math.max(0, length - Math.max(0, corner - start)),
})
const xSpan = computed(() => (hover.value ? rulerSpan(hover.value.box.left, hover.value.box.width, RULER_WIDTH) : null))
const ySpan = computed(() =>
  hover.value ? rulerSpan(hover.value.box.top, hover.value.box.height, RULER_HEIGHT) : null,
)
const guides = computed(() => {
  if (!hover.value) return { x: [], y: [] }
  const { box } = hover.value
  return { x: [box.left, box.left + box.width], y: [box.top, box.top + box.height] }
})
const tipStyle = computed(() => {
  if (!hover.value) return {}
  const { box } = hover.value
  const { width, height } = tipSize.value
  const above = box.top - TIP_OFFSET - height >= TIP_OFFSET
  const top = above ? box.top - TIP_OFFSET - height : box.top + box.height + TIP_OFFSET
  const left = Math.min(
    Math.max(TIP_OFFSET, box.left + box.width / 2 - width / 2),
    frame.value.width - width - TIP_OFFSET,
  )
  return { top: px(top), left: px(left) }
})

const mutations = new MutationObserver((records) => {
  if (records.some((record) => !layer.value?.contains(record.target))) schedule()
})
const resizes = new ResizeObserver(schedule)
const tipResizes = new ResizeObserver(() => {
  const element = tip.value
  if (element) tipSize.value = { width: element.offsetWidth, height: element.offsetHeight }
})
watch(tip, (element, previous) => {
  if (previous) tipResizes.unobserve(previous)
  if (element) {
    tipResizes.observe(element)
    tipSize.value = { width: element.offsetWidth, height: element.offsetHeight }
  }
})

onMounted(() => {
  measureFrame()
  mutations.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true })
  resizes.observe(document.documentElement)
  const root = contentRoot()
  if (root) resizes.observe(root)
  window.addEventListener('scroll', schedule, { capture: true, passive: true })
  window.addEventListener('resize', schedule)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  mutations.disconnect()
  resizes.disconnect()
  tipResizes.disconnect()
  window.removeEventListener('scroll', schedule, { capture: true })
  window.removeEventListener('resize', schedule)
})
</script>

<template>
  <div
    ref="layer"
    data-slot="inspect-layer"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-2147483647 font-mono"
  >
    <template v-if="origin">
      <svg class="absolute top-0 left-0 overflow-visible" :width="frame.width" :height="RULER_HEIGHT">
        <rect
          v-if="xSpan"
          :x="xSpan.start"
          y="0"
          :width="xSpan.length"
          :height="RULER_HEIGHT"
          class="fill-primary/15"
        />
        <template v-for="tick in xTicks" :key="tick.value">
          <line :x1="tick.pos" y1="-6" :x2="tick.pos" y2="6" class="stroke-primary" :opacity="tickOpacity(tick)" />
          <text v-if="tick.labeled" :x="tick.pos" y="16" font-size="9" text-anchor="middle" class="fill-primary">
            {{ tick.value }}
          </text>
        </template>
      </svg>
      <svg class="absolute top-0 left-0 overflow-visible" :width="RULER_WIDTH" :height="frame.height">
        <rect v-if="ySpan" x="0" :y="ySpan.start" :width="RULER_WIDTH" :height="ySpan.length" class="fill-primary/15" />
        <template v-for="tick in yTicks" :key="tick.value">
          <line x1="0" :y1="tick.pos" x2="6" :y2="tick.pos" class="stroke-primary" :opacity="tickOpacity(tick)" />
          <text
            v-if="tick.labeled"
            x="16"
            :y="tick.pos"
            font-size="9"
            text-anchor="middle"
            dominant-baseline="middle"
            :transform="`rotate(-90 16 ${tick.pos})`"
            class="fill-primary"
          >
            {{ tick.value }}
          </text>
        </template>
      </svg>
      <div class="pointer-events-auto absolute inset-0 cursor-crosshair" @mousemove="onMove" @mouseleave="onLeave" />
    </template>
    <template v-if="hover">
      <div class="absolute bg-primary/20" :style="rectStyle(hover.content)" />
      <div
        v-for="(strip, index) in hover.padStrips"
        :key="`p${index}`"
        class="absolute flex items-center justify-center bg-success/30"
        :style="rectStyle(strip)"
      >
        <span class="text-[9px] leading-none font-semibold text-foreground">{{ strip.label }}</span>
      </div>
      <div
        v-for="(strip, index) in hover.gapStrips"
        :key="`g${index}`"
        class="absolute flex items-center justify-center bg-success/30 outline-1 -outline-offset-1 outline-success-text/90 outline-dashed"
        :style="rectStyle(strip)"
      >
        <span class="text-[9px] leading-none font-semibold text-foreground">{{ strip.label }}</span>
      </div>
      <div
        v-for="(x, index) in guides.x"
        :key="`x${index}`"
        class="absolute inset-y-0 w-px bg-primary/55"
        :style="{ left: px(x) }"
      />
      <div
        v-for="(y, index) in guides.y"
        :key="`y${index}`"
        class="absolute inset-x-0 h-px bg-primary/55"
        :style="{ top: px(y) }"
      />
      <div
        ref="tip"
        class="absolute max-w-60 rounded-md bg-foreground px-3 py-2.5 text-[11px] leading-4 text-background shadow-shadow-md"
        :style="tipStyle"
      >
        <div class="font-semibold">{{ hover.anchor }}</div>
        <div>{{ hover.meta }}</div>
        <div v-if="hover.detail">{{ hover.detail }}</div>
        <div>padding {{ hover.padding }} · margin {{ hover.margin }}</div>
        <div v-if="hover.gap">gap {{ hover.gap }}</div>
        <template v-if="hover.font">
          <div>font {{ hover.font.size }}</div>
          <div>{{ hover.font.family }} · {{ hover.font.weight }}</div>
          <div>tracking {{ hover.font.tracking }} · {{ hover.font.color }}</div>
        </template>
      </div>
    </template>
    <span
      class="absolute end-2 bottom-2 rounded-sm bg-foreground/80 px-1.5 py-0.5 text-[11px] text-background tabular-nums"
    >
      {{ frame.width }} × {{ frame.height }}
    </span>
  </div>
</template>
