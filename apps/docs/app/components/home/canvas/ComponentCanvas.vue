<script setup lang="ts">
import { useElementSize, usePreferredReducedMotion } from '@vueuse/core'
import { type Component, computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

import DemoCard from '~/components/home/canvas/DemoCard.vue'
import MiniMap from '~/components/home/canvas/MiniMap.vue'
import TitlePlaque from '~/components/home/canvas/TitlePlaque.vue'
import { useCanvasKeyboard } from '~/composables/useCanvasKeyboard'
import {
  type CanvasComponent,
  type CanvasSize,
  MAX_USER_ZOOM,
  MIN_USER_ZOOM,
  PHONE_BREAKPOINT,
  PLAQUE,
  baseZoom as baseZoomFor,
  falloff,
  footprint,
  smooth,
} from '~/lib/canvas'
import { type Packing, pack, ringDelta } from '~/lib/canvas-layout'
import { thumbnailOf } from '~/lib/thumbnails'

export type CanvasMode = 'inline' | 'fullscreen'

const props = defineProps<{
  components: readonly CanvasComponent[]
  load: (component: CanvasComponent) => Component
  count: string
  /** Inline, the page keeps the wheel; fullscreen, the canvas takes it too. Touch pans the canvas either way. */
  mode: CanvasMode
}>()
const openId = defineModel<string | null>('open', { default: null })
const emit = defineEmits<{ interact: []; keyboard: [open: boolean]; explore: [slug: string] }>()

const CULL_MARGIN = 80

const container = useTemplateRef<HTMLElement>('container')
const { width: vw, height: vh } = useElementSize(container)
const reducedMotion = usePreferredReducedMotion()
// The screen's height for zoom, falloff and the tile. It ignores the on-screen keyboard, so typing
// into a field doesn't rescale and repaint the whole canvas while the keyboard slides in.
const keyboard = useCanvasKeyboard(container, vh, () => schedule())
const screenH = keyboard.height
watch(keyboard.open, (value) => emit('keyboard', value))

const bySlug = computed(() => new Map(props.components.map((component) => [component.slug, component])))
const narrow = computed(() => vw.value > 0 && vw.value < PHONE_BREAKPOINT)
const dims = (component: CanvasComponent) => (narrow.value ? component.phone : component.desktop)
const boxOf = (component: CanvasComponent) => footprint(dims(component), component.title)

const userZoom = shallowRef(1)
// Zooming is a rubber band: past a limit only a fraction of the pull takes, and a gesture that ends out
// of range springs back. One that ends near 1 settles on exactly 1, so the original size is reachable.
let rawZoom = 1
let zoomAnimation: { from: number; to: number; start: number; duration: number } | null = null
let zoomRest = 0
const ZOOM_GIVE = 0.35
const ZOOM_SNAP = 0.08
const rubber = (value: number) => {
  if (value > MAX_USER_ZOOM) return MAX_USER_ZOOM * Math.exp(Math.log(value / MAX_USER_ZOOM) * ZOOM_GIVE)
  if (value < MIN_USER_ZOOM) return MIN_USER_ZOOM * Math.exp(Math.log(value / MIN_USER_ZOOM) * ZOOM_GIVE)
  return value
}
const pullZoom = (value: number) => {
  rawZoom = Math.min(MAX_USER_ZOOM * 3, Math.max(MIN_USER_ZOOM / 3, value))
  zoomAnimation = null
  userZoom.value = rubber(rawZoom)
}
const settleZoom = () => {
  clearTimeout(zoomRest)
  zoomRest = 0
  rawZoom = Math.abs(rawZoom - 1) < ZOOM_SNAP ? 1 : Math.min(MAX_USER_ZOOM, Math.max(MIN_USER_ZOOM, rawZoom))
  if (reducedMotion.value === 'reduce' || userZoom.value === rawZoom) {
    userZoom.value = rawZoom
    return
  }
  zoomAnimation = { from: userZoom.value, to: rawZoom, start: performance.now(), duration: 360 }
  schedule()
}
const widest = computed(() => Math.max(...props.components.map((component) => boxOf(component).width)))
const baseZoom = computed(() => baseZoomFor(vw.value, screenH.value, widest.value))
const zoom = computed(() => baseZoom.value * userZoom.value)

const packing = shallowRef<Packing | null>(null)
let sizeOf: (id: string) => CanvasSize = () => PLAQUE
const layout = () => {
  const items = props.components.map((component) => ({ id: component.slug, ...boxOf(component) }))
  const sizes = new Map<string, CanvasSize>(items.map((item) => [item.id, item]))
  sizes.set(PLAQUE.id, PLAQUE)
  sizeOf = (id) => sizes.get(id)!
  const tallest = Math.max(...items.map((item) => item.height))
  // Wider than what the screen shows at the farthest zoom plus a card, or a card could show twice.
  const span = (size: number) => size / (baseZoom.value * MIN_USER_ZOOM)
  const side = Math.max(span(vw.value) + widest.value, span(screenH.value) + tallest)
  packing.value = pack(items, { aspect: 1, minWidth: side, minHeight: side, centre: PLAQUE })
}

// Camera: the tile point under the screen's centre. Plain numbers, never reactive: it changes every frame.
const camera = { x: 0, y: 0 }
let velocity = { x: 0, y: 0 }
let animation: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  start: number
  duration: number
} | null = null

type Frame = { x: number; y: number; scale: number; opacity: number; layer: number }
const frames = new Map<string, Frame>()
const elements = new Map<string, HTMLElement>()
const visible = shallowRef<string[]>([])
// Layers are promoted only while something moves: at rest the browser rasterizes each card at its real
// scale, so text stays sharp at any zoom.
const moving = shallowRef(false)

// Focus mode eases both ways, and while it fades out the last open card keeps pushing its
// neighbours, so they glide back instead of jumping.
let focus = 0
let focusId: string | null = null

// Keyboard: the canvas rises just enough to keep the focused field above it, and settles back.
let lift = 0
const LIFT_MARGIN = 24
const LIFT_MARGIN_TOP = 72
const liftTarget = () => {
  const field = keyboard.field()
  const el = container.value
  if (!field || !el) return 0
  const { top, bottom } = keyboard.band()
  const box = el.getBoundingClientRect()
  const rect = field.getBoundingClientRect()
  const fieldTop = rect.top - box.top + lift
  const fieldBottom = rect.bottom - box.top + lift
  const least = fieldBottom - (bottom - LIFT_MARGIN)
  const most = fieldTop - (top + LIFT_MARGIN_TOP)
  return least <= most ? Math.min(most, Math.max(0, least)) : most
}

/** One pass: where every card sits, how big and how faded it is, and which ones are on screen. */
const measure = () => {
  const tile = packing.value
  if (!tile) return
  const z = zoom.value
  const hx = vw.value / 2
  const hy = screenH.value / 2

  const placed = tile.items.map((item) => {
    const dx = ringDelta(item.x - camera.x, tile.width) * z
    const dy = ringDelta(item.y - camera.y, tile.height) * z
    const open = item.id === focusId
    const fall = falloff(dx, dy, hx, hy)
    return {
      item,
      x: hx + dx * fall.pull,
      y: hy + dy * fall.pull - lift,
      scale: open ? 1 : fall.scale,
      opacity: open ? 1 : fall.opacity,
      open,
    }
  })

  const anchor = focus > 0 ? placed.find((entry) => entry.open) : undefined
  if (anchor) {
    const reach = (Math.max(anchor.item.width, anchor.item.height) * z) / 2 + 200
    for (const entry of placed) {
      if (entry.open) continue
      const vx = entry.x - anchor.x
      const vy = entry.y - anchor.y
      const distance = Math.hypot(vx, vy) || 1
      const near = 1 - smooth(0, reach * 2, distance)
      const push = focus * near * 0.35 * reach
      entry.x += (vx / distance) * push
      entry.y += (vy / distance) * push
      entry.scale *= 1 - 0.05 * focus
      entry.opacity *= 1 - 0.65 * focus
    }
  }

  const next: string[] = []
  for (const entry of placed) {
    const halfW = (entry.item.width * entry.scale * z) / 2
    const halfH = (entry.item.height * entry.scale * z) / 2
    const onScreen =
      entry.x + halfW > -CULL_MARGIN &&
      entry.x - halfW < vw.value + CULL_MARGIN &&
      entry.y + halfH > -CULL_MARGIN &&
      entry.y - halfH < vh.value + CULL_MARGIN
    if (entry.opacity > 0.01 && onScreen) {
      next.push(entry.item.id)
      frames.set(entry.item.id, {
        x: entry.x,
        y: entry.y,
        scale: entry.scale,
        opacity: entry.opacity,
        layer: entry.open ? 1000 : Math.round(entry.scale * 100),
      })
    }
  }
  if (next.length !== visible.value.length || next.some((id, i) => id !== visible.value[i])) visible.value = next
}

const styleOf = (id: string) => {
  const frame = frames.get(id)
  const size = sizeOf(id)
  if (!frame) return { width: `${size.width}px`, height: `${size.height}px`, opacity: 0 }
  return {
    width: `${size.width}px`,
    height: `${size.height}px`,
    transform: `translate3d(${Math.round(frame.x - size.width / 2)}px, ${Math.round(frame.y - size.height / 2)}px, 0) scale(${frame.scale * zoom.value})`,
    opacity: frame.opacity,
    zIndex: frame.layer,
  }
}

const minimap = useTemplateRef<InstanceType<typeof MiniMap>>('minimap')
const mapSize = computed(() => (vw.value < PHONE_BREAKPOINT ? 96 : 160))

/** The map's click or drag: centre the camera on that point of the tile, nearest copy. */
const jumpTo = (x: number, y: number) => {
  const tile = packing.value
  if (!tile) return
  openId.value = null
  animation = null
  velocity = { x: 0, y: 0 }
  camera.x += ringDelta(x - camera.x, tile.width)
  camera.y += ringDelta(y - camera.y, tile.height)
  emit('interact')
  schedule()
}

const paint = () => {
  minimap.value?.update(camera.x, camera.y, vw.value / zoom.value, vh.value / zoom.value)
  for (const [id, el] of elements) {
    const style = styleOf(id)
    el.style.transform = style.transform ?? ''
    el.style.opacity = String(style.opacity)
    el.style.zIndex = String(style.zIndex ?? 0)
  }
}

let raf = 0
let last = 0
const tick = (now: number) => {
  raf = 0
  const dt = last ? Math.min(48, now - last) : 16
  last = now
  let movingNow = false

  if (animation) {
    const t = Math.min(1, (now - animation.start) / animation.duration)
    const e = 1 - (1 - t) ** 3
    camera.x = animation.from.x + (animation.to.x - animation.from.x) * e
    camera.y = animation.from.y + (animation.to.y - animation.from.y) * e
    if (t < 1) movingNow = true
    else animation = null
  } else if (!dragging.value && (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.y) > 0.01)) {
    camera.x -= (velocity.x * dt) / zoom.value
    camera.y -= (velocity.y * dt) / zoom.value
    const decay = Math.exp(-dt / 325)
    velocity = { x: velocity.x * decay, y: velocity.y * decay }
    movingNow = true
  }
  if (zoomAnimation) {
    const t = Math.min(1, (now - zoomAnimation.start) / zoomAnimation.duration)
    const e = 1 - (1 - t) ** 3
    const from = Math.log(zoomAnimation.from)
    userZoom.value = Math.exp(from + (Math.log(zoomAnimation.to) - from) * e)
    if (t < 1) movingNow = true
    else zoomAnimation = null
  }
  if (dragging.value || pinch) movingNow = true

  const target = openId.value ? 1 : 0
  if (openId.value) focusId = openId.value
  if (focus !== target) {
    focus =
      reducedMotion.value === 'reduce' || Math.abs(target - focus) < 0.002
        ? target
        : focus + (target - focus) * (1 - Math.exp(-dt / 110))
    movingNow = true
  }
  if (focus === 0 && !openId.value) focusId = null

  const liftTo = liftTarget()
  if (Math.abs(liftTo - lift) > 0.5 && reducedMotion.value !== 'reduce') {
    lift += (liftTo - lift) * (1 - Math.exp(-dt / 90))
    movingNow = true
  } else {
    lift = liftTo
  }

  measure()
  paint()
  moving.value = movingNow
  if (movingNow) schedule()
  else last = 0
}

const schedule = () => {
  if (!raf) raf = requestAnimationFrame(tick)
}

const setElement = (id: string) => (el: unknown) => {
  if (el instanceof HTMLElement) elements.set(id, el)
  else elements.delete(id)
}

/** Glide the camera so a card's nearest copy lands in the middle. */
const flyTo = (id: string) => {
  const tile = packing.value
  const item = tile?.items.find((entry) => entry.id === id)
  if (!tile || !item) return
  velocity = { x: 0, y: 0 }
  const to = {
    x: camera.x + ringDelta(item.x - camera.x, tile.width),
    y: camera.y + ringDelta(item.y - camera.y, tile.height),
  }
  if (reducedMotion.value === 'reduce') {
    Object.assign(camera, to)
    animation = null
  } else {
    animation = { from: { ...camera }, to, start: performance.now(), duration: 520 }
  }
  schedule()
}

const open = (id: string) => {
  openId.value = id
  flyTo(id)
}

// Pointer: a drag pans with inertia, two fingers pinch, a press that doesn't move opens the card under it.
const dragging = shallowRef(false)
let press: {
  id: number
  type: string
  x: number
  y: number
  startX: number
  startY: number
  moved: boolean
  card?: string
} | null = null
let samples: { t: number; x: number; y: number }[] = []
const pointers = new Map<number, { x: number; y: number }>()
let pinch: { distance: number; raw: number } | null = null

const onPointerDown = (event: PointerEvent) => {
  if (event.button !== 0) return
  const target = event.target as Element
  // Inside the open card the component gets the pointer, not the canvas.
  if (target.closest('[data-open-body]')) return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (pointers.size === 2 && props.mode === 'fullscreen') {
    const [a, b] = [...pointers.values()]
    pinch = { distance: Math.hypot(a!.x - b!.x, a!.y - b!.y), raw: rawZoom }
    press = null
    dragging.value = false
    return
  }
  press = {
    id: event.pointerId,
    type: event.pointerType,
    x: event.clientX,
    y: event.clientY,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
    card: target.closest<HTMLElement>('[data-item]')?.dataset.item,
  }
  samples = [{ t: event.timeStamp, x: event.clientX, y: event.clientY }]
  animation = null
  velocity = { x: 0, y: 0 }
}

const onPointerMove = (event: PointerEvent) => {
  if (pointers.has(event.pointerId)) pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (pinch && pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    const distance = Math.hypot(a!.x - b!.x, a!.y - b!.y)
    pullZoom((pinch.raw * distance) / pinch.distance)
    return
  }
  if (!press || event.pointerId !== press.id) return
  if (!press.moved && Math.hypot(event.clientX - press.startX, event.clientY - press.startY) > 5) {
    press.moved = true
    dragging.value = true
    openId.value = null
    container.value?.setPointerCapture(event.pointerId)
    emit('interact')
  }
  if (!press.moved) return
  camera.x -= (event.clientX - press.x) / zoom.value
  camera.y -= (event.clientY - press.y) / zoom.value
  press.x = event.clientX
  press.y = event.clientY
  samples.push({ t: event.timeStamp, x: event.clientX, y: event.clientY })
  samples = samples.filter((sample) => event.timeStamp - sample.t < 90)
  schedule()
}

const onPointerUp = (event: PointerEvent) => {
  pointers.delete(event.pointerId)
  if (pinch && pointers.size < 2) {
    pinch = null
    settleZoom()
  }
  if (!press || event.pointerId !== press.id) return
  const ended = press
  press = null
  dragging.value = false
  if (!ended.moved) {
    if (!ended.card) openId.value = null
    else if (props.mode === 'inline' && ended.type === 'touch') emit('explore', ended.card)
    else open(ended.card)
    return
  }
  const first = samples[0]
  const lastSample = samples.at(-1)
  if (first && lastSample && lastSample.t > first.t && reducedMotion.value !== 'reduce') {
    const span = lastSample.t - first.t
    velocity = { x: (lastSample.x - first.x) / span, y: (lastSample.y - first.y) / span }
  }
  schedule()
}

// Inline, the wheel scrolls the page past the canvas; only ⌘/Ctrl+wheel zooms. Fullscreen it pans.
const onWheel = (event: WheelEvent) => {
  const zooming = event.ctrlKey || event.metaKey
  if (props.mode === 'inline' && !zooming) return
  event.preventDefault()
  emit('interact')
  if (zooming) {
    // A mouse notch is 100; capped so one notch doesn't jump to a limit, while a trackpad's small deltas pass.
    const step = Math.sign(event.deltaY) * Math.min(25, Math.abs(event.deltaY))
    pullZoom(rawZoom * Math.exp(-step * 0.01))
    clearTimeout(zoomRest)
    zoomRest = window.setTimeout(settleZoom, 160)
  } else {
    camera.x += event.deltaX / zoom.value
    camera.y += event.deltaY / zoom.value
  }
  velocity = { x: 0, y: 0 }
  animation = null
  schedule()
}

const onKeydown = (event: KeyboardEvent) => {
  if ((event.target as Element).closest('[data-open-body]')) return
  const step = 160
  const pan: Record<string, [number, number]> = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  }
  const move = pan[event.key]
  const item = (event.target as HTMLElement).dataset.item
  if (move) {
    event.preventDefault()
    emit('interact')
    const from = { ...camera }
    const to = { x: camera.x + move[0] / zoom.value, y: camera.y + move[1] / zoom.value }
    animation = reducedMotion.value === 'reduce' ? null : { from, to, start: performance.now(), duration: 220 }
    if (!animation) Object.assign(camera, to)
    schedule()
  } else if ((event.key === 'Enter' || event.key === ' ') && item) {
    event.preventDefault()
    open(item)
  }
}

const visibleComponents = computed(() =>
  visible.value.flatMap((id) => {
    const component = bySlug.value.get(id)
    return component ? [component] : []
  }),
)
const plaqueVisible = computed(() => visible.value.includes(PLAQUE.id))

// Mounting a big demo can cost a frame or two. Cards enter at the edge, small and faded, so they
// show their sketch first and get their demo one at a time, nearest to the centre first.
const live = shallowRef<ReadonlySet<string>>(new Set())
let pumping = false
const idle = (callback: () => void) =>
  'requestIdleCallback' in window ? requestIdleCallback(callback, { timeout: 120 }) : setTimeout(callback, 16)
const pump = () => {
  if (pumping) return
  if (!visible.value.some((id) => !live.value.has(id))) return
  pumping = true
  idle(() => {
    pumping = false
    const next = visible.value
      .filter((id) => !live.value.has(id))
      .sort((a, b) => (frames.get(b)?.scale ?? 0) - (frames.get(a)?.scale ?? 0))[0]
    if (next) live.value = new Set([...live.value, next])
    pump()
  })
}
watch(visible, (ids) => {
  const shown = new Set(ids)
  if ([...live.value].some((id) => !shown.has(id))) live.value = new Set([...live.value].filter((id) => shown.has(id)))
  pump()
})

onMounted(() => {
  container.value?.addEventListener('wheel', onWheel, { passive: false })
})
onBeforeUnmount(() => {
  container.value?.removeEventListener('wheel', onWheel)
  cancelAnimationFrame(raf)
  clearTimeout(zoomRest)
})

const relayout = () => {
  const tile = packing.value
  const rx = tile ? camera.x / tile.width : 0.5
  const ry = tile ? camera.y / tile.height : 0.5
  layout()
  camera.x = rx * packing.value!.width
  camera.y = ry * packing.value!.height
  schedule()
}

// First layout once the container has a size; a resize only reflows when the tile gets too small.
watch([vw, screenH], ([w, h], [pw, ph]) => {
  if (!w || !h) return
  if (!packing.value || w > (pw ?? 0) * 1.25 || h > (ph ?? 0) * 1.25) relayout()
  else schedule()
})
watch([zoom, openId, vh, () => props.mode], schedule)
// Crossing the phone breakpoint changes card sizes, so the tile is packed again.
watch(narrow, () => {
  if (packing.value) relayout()
})

defineExpose({ open, focus: () => container.value?.focus() })
</script>

<template>
  <div
    ref="container"
    data-slot="canvas"
    :data-mode="mode"
    class="relative isolate size-full touch-none overflow-hidden outline-none select-none focus-visible:focus-ring-inset"
    :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
    tabindex="0"
    role="application"
    aria-roledescription="infinite canvas"
    aria-label="Kappa UI components. Arrow keys move the canvas, Enter opens a card, Escape closes it."
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown="onKeydown"
  >
    <div
      v-if="plaqueVisible"
      :ref="setElement(PLAQUE.id)"
      class="pointer-events-none absolute top-0 left-0 origin-center"
      :class="moving && 'will-change-transform'"
      :style="styleOf(PLAQUE.id)"
    >
      <TitlePlaque :count="count" />
    </div>
    <div
      v-for="component in visibleComponents"
      :key="component.slug"
      :ref="setElement(component.slug)"
      :data-item="component.slug"
      class="absolute top-0 left-0 origin-center"
      :class="moving && 'will-change-transform'"
      :style="styleOf(component.slug)"
      :role="openId === component.slug ? undefined : 'button'"
      :tabindex="openId === component.slug ? undefined : 0"
      :aria-label="openId === component.slug ? undefined : `Open ${component.title}`"
    >
      <DemoCard
        :title="component.title"
        :component="load(component)"
        :width="dims(component).width"
        :height="dims(component).height"
        :open="openId === component.slug"
        :live="live.has(component.slug)"
        :thumbnail="thumbnailOf(component.path)"
      />
    </div>

    <MiniMap
      v-if="packing"
      v-show="!keyboard.open.value"
      ref="minimap"
      :tile="packing"
      :open-id="openId"
      :size="mapSize"
      class="absolute end-4 bottom-4 z-[1001] md:end-6 md:bottom-6"
      @jump="jumpTo"
    />
  </div>
</template>
