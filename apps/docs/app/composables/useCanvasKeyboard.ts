import { useEventListener } from '@vueuse/core'
import { type Ref, shallowRef, watch } from 'vue'

const TEXT_FIELD = [
  'input:not([type=checkbox],[type=radio],[type=range],[type=button],[type=submit],[type=reset],[type=color],[type=file],[readonly],[inputmode=none])',
  'textarea:not([readonly])',
  '[contenteditable]:not([contenteditable=false])',
].join(', ')

/** How long the keyboard may take to slide away before a shorter screen counts as a real resize. */
const RELEASE_MS = 800
/** Less than this is a browser bar moving, not a keyboard. */
const KEYBOARD_MIN = 120

const activeField = () => {
  const el = document.activeElement
  return el instanceof HTMLElement && el.matches(TEXT_FIELD) ? el : null
}

/**
 * The on-screen keyboard, seen from the canvas. While a text field has focus, a screen that gets
 * shorter is the keyboard, not a new screen: `height` keeps the full height, so zoom and the tile
 * hold while the keyboard slides in and out. `band()` is the part of the canvas still visible,
 * whether the keyboard shrank the canvas (Android, a resized frame) or only covers it (iOS).
 */
export const useCanvasKeyboard = (container: Ref<HTMLElement | null>, rawHeight: Ref<number>, onChange: () => void) => {
  const height = shallowRef(rawHeight.value)
  const open = shallowRef(false)
  let frozen = false
  let release = 0

  const changed = () => {
    const viewport = window.visualViewport
    const covered = viewport ? window.innerHeight - viewport.height : 0
    open.value = frozen && (height.value - rawHeight.value > KEYBOARD_MIN || covered > KEYBOARD_MIN)
    onChange()
  }

  const unfreeze = () => {
    frozen = false
    clearTimeout(release)
    release = 0
    height.value = rawHeight.value
    changed()
  }

  watch(rawHeight, (value) => {
    if (!frozen || value >= height.value) {
      height.value = value
      if (frozen && release) unfreeze()
    }
    changed()
  })

  useEventListener(document, 'focusin', () => {
    if (!activeField()) return
    clearTimeout(release)
    release = 0
    frozen = true
    changed()
  })
  useEventListener(document, 'focusout', () => {
    setTimeout(() => {
      if (activeField() || !frozen) return
      clearTimeout(release)
      release = window.setTimeout(unfreeze, RELEASE_MS)
      changed()
    }, 0)
  })
  if (typeof window !== 'undefined' && window.visualViewport) {
    useEventListener(window.visualViewport, 'resize', changed)
    useEventListener(window.visualViewport, 'scroll', changed)
  }

  /** The visible stretch of the canvas, in its own pixels from the top. */
  const band = () => {
    const h = rawHeight.value
    const el = container.value
    const viewport = window.visualViewport
    if (!frozen || !el || !viewport) return { top: 0, bottom: h }
    const rect = el.getBoundingClientRect()
    const clamp = (value: number) => Math.min(h, Math.max(0, value))
    return {
      top: clamp(viewport.offsetTop - rect.top),
      bottom: clamp(viewport.offsetTop + viewport.height - rect.top),
    }
  }

  /** The focused text field when it is inside the canvas; the site search's field is not. */
  const field = () => {
    const el = activeField()
    return el && container.value?.contains(el) ? el : null
  }

  return { height, open, band, field }
}
