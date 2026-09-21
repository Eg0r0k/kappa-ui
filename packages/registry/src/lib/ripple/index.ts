import type { Directive, DirectiveBinding } from "vue";

/**
 * Ripple as a Vue directive: `v-ripple`, `v-ripple="false"`, or
 * `v-ripple="{ color, opacity }"`.
 *
 * The motion constants below are Material's, so it reads like an MD ripple,
 * but nothing here uses the Web Animations API or a custom element. Each wave
 * is a span whose per-press geometry is written as inline custom properties;
 * a plain CSS animation does the rest.
 */

// Material's numbers, kept verbatim so the motion matches.
const PRESS_GROW_MS = 450;
const FADE_OUT_MS = 375;
// A tap shorter than this still shows the ripple for this long. Without it a
// quick click produces a flash the eye cannot resolve.
const MINIMUM_PRESS_MS = 225;
// The wave starts at a fifth of the element and grows from there, rather than
// from nothing — that is a large part of why MD's ripple reads as a spreading
// surface rather than an expanding circle.
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;

const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, [role="button"]';

type RippleOptions = {
  disabled?: boolean;
  color?: string;
  opacity?: number;
};

type Wave = {
  element: HTMLElement;
  startTime: number;
  released: boolean;
  hideTimer?: ReturnType<typeof setTimeout>;
  removeTimer?: ReturnType<typeof setTimeout>;
};

type RippleState = {
  container: HTMLElement | null;
  waves: Set<Wave>;
  current: Wave | null;
  options: RippleOptions;
  handlers: Record<string, EventListener>;
};

type RippleElement = HTMLElement & { _ripple?: RippleState };

const parseBinding = (binding: DirectiveBinding): RippleOptions => {
  if (typeof binding.value === "boolean") return { disabled: !binding.value };
  if (binding.value && typeof binding.value === "object") return binding.value;
  return {};
};

/**
 * Material's geometry. The wave is small at first and drifts toward the centre
 * of the element while it expands, so the press point only seeds the motion
 * instead of anchoring it.
 */
const computeGeometry = (rect: DOMRect, x: number, y: number) => {
  const maxDim = Math.max(rect.height, rect.width);
  const softEdgeSize = Math.max(SOFT_EDGE_CONTAINER_RATIO * maxDim, SOFT_EDGE_MINIMUM_SIZE);
  const initialSize = Math.max(Math.floor(maxDim * INITIAL_ORIGIN_SCALE), 1);
  const maxRadius = Math.hypot(rect.width, rect.height) + PADDING;

  return {
    initialSize,
    scale: (maxRadius + softEdgeSize) / initialSize,
    from: { x: x - initialSize / 2, y: y - initialSize / 2 },
    to: {
      x: (rect.width - initialSize) / 2,
      y: (rect.height - initialSize) / 2,
    },
  };
};

const ensureContainer = (el: RippleElement): HTMLElement => {
  const state = el._ripple!;
  if (state.container) return state.container;

  // The container is absolutely positioned, so the host must establish a
  // containing block. Only forced when the host has not set one itself.
  if (getComputedStyle(el).position === "static") {
    el.style.position = "relative";
  }

  const container = document.createElement("span");
  container.className = "delta-ripple";
  container.setAttribute("data-slot", "ripple");
  container.setAttribute("aria-hidden", "true");
  el.appendChild(container);
  state.container = container;
  return container;
};

const removeWave = (state: RippleState, wave: Wave) => {
  clearTimeout(wave.hideTimer);
  clearTimeout(wave.removeTimer);
  wave.element.remove();
  state.waves.delete(wave);
  if (state.current === wave) state.current = null;
};

/**
 * Hold the wave for MINIMUM_PRESS_MS counted from when it started, then fade.
 * Releasing early does not cut the ripple short.
 */
const releaseWave = (state: RippleState, wave: Wave) => {
  if (wave.released) return;
  wave.released = true;

  const elapsed = performance.now() - wave.startTime;
  const holdFor = Math.max(MINIMUM_PRESS_MS - elapsed, 0);

  wave.hideTimer = setTimeout(() => {
    wave.element.dataset.hiding = "";
  }, holdFor);

  wave.removeTimer = setTimeout(() => {
    removeWave(state, wave);
  }, holdFor + FADE_OUT_MS);
};

/** Creates a wave centred on (x, y), in element coordinates. */
const spawnWave = (el: RippleElement, state: RippleState, x: number, y: number): Wave => {
  const rect = el.getBoundingClientRect();
  const geometry = computeGeometry(rect, x, y);

  const element = document.createElement("span");
  element.className = "delta-ripple__wave";
  element.style.setProperty("--ripple-size", `${geometry.initialSize}px`);
  element.style.setProperty("--ripple-scale", `${geometry.scale}`);
  element.style.setProperty("--ripple-from", `translate(${geometry.from.x}px, ${geometry.from.y}px)`);
  element.style.setProperty("--ripple-to", `translate(${geometry.to.x}px, ${geometry.to.y}px)`);
  if (state.options.color) element.style.setProperty("--ripple-color", state.options.color);
  if (state.options.opacity !== undefined) {
    element.style.setProperty("--ripple-opacity", `${state.options.opacity}`);
  }

  ensureContainer(el).appendChild(element);

  const wave: Wave = { element, startTime: performance.now(), released: false };
  state.waves.add(wave);
  return wave;
};

/** A press that belongs to a nested control is that control's, not ours. */
const belongsToNestedControl = (el: HTMLElement, target: EventTarget | null) => {
  const interactive = (target as HTMLElement | null)?.closest(INTERACTIVE_SELECTOR);
  return Boolean(interactive) && interactive !== el;
};

const setupRipple = (el: RippleElement, binding: DirectiveBinding) => {
  if (el._ripple) return;

  const releaseCurrent = () => {
    const state = el._ripple;
    if (state?.current) releaseWave(state, state.current);
  };

  const releasePrimary = (event: PointerEvent) => {
    if (event.isPrimary) releaseCurrent();
  };

  /**
   * Keyboard activation. MouseEvent.detail is the click count for anything a
   * pointer produced, and exactly 0 otherwise — Enter or Space on a button,
   * activation through a associated <label>, or a programmatic .click().
   * Material reaches the same cases by tracking a state machine and inferring
   * "no pointer press preceded this click"; this is the same test asked
   * directly, so it needs no state.
   *
   * The wave is centred, because there is no press point, and released at
   * once since no pointerup will follow. MINIMUM_PRESS_MS is what keeps it on
   * screen long enough to be seen.
   */
  const onClick = (event: MouseEvent) => {
    if (event.detail !== 0) return;

    const state = el._ripple;
    if (!state || state.options.disabled) return;
    if (belongsToNestedControl(el, event.target)) return;

    releaseCurrent();

    const rect = el.getBoundingClientRect();
    const wave = spawnWave(el, state, rect.width / 2, rect.height / 2);
    state.current = wave;
    releaseWave(state, wave);
  };

  const onPointerdown = (event: PointerEvent) => {
    // Middle click is not an activation.
    if (event.button === 1) return;
    // Only the primary pointer seeds a wave; a second finger is ignored, and
    // its non-primary pointerup is ignored too, so the first wave still ends
    // with the first finger.
    if (!event.isPrimary) return;

    const state = el._ripple;
    if (!state || state.options.disabled) return;

    // A wave whose release was lost — pointerup outside the window, a
    // cancelled gesture — must not outlive the next press.
    releaseCurrent();

    if (belongsToNestedControl(el, event.target)) return;

    const rect = el.getBoundingClientRect();
    state.current = spawnWave(el, state, event.clientX - rect.left, event.clientY - rect.top);
  };

  const handlers = {
    pointerdown: onPointerdown,
    pointerup: releasePrimary,
    pointercancel: releasePrimary,
    pointerleave: releasePrimary,
    click: onClick,
  };

  el._ripple = {
    container: null,
    waves: new Set(),
    current: null,
    options: parseBinding(binding),
    handlers: handlers as unknown as Record<string, EventListener>,
  };

  for (const [event, handler] of Object.entries(el._ripple.handlers)) {
    el.addEventListener(event, handler);
  }
};

const cleanupRipple = (el: RippleElement) => {
  const state = el._ripple;
  if (!state) return;

  for (const wave of state.waves) {
    clearTimeout(wave.hideTimer);
    clearTimeout(wave.removeTimer);
  }

  for (const [event, handler] of Object.entries(state.handlers)) {
    el.removeEventListener(event, handler);
  }

  state.container?.remove();
  delete el._ripple;
};

export const vRipple: Directive<RippleElement, boolean | RippleOptions> = {
  mounted: (el, binding) => setupRipple(el, binding),
  updated: (el, binding) => {
    if (el._ripple) el._ripple.options = parseBinding(binding);
  },
  beforeUnmount: (el) => cleanupRipple(el),
};

export default vRipple;

// Grow duration is exported so a caller can keep its own timing in step
// rather than duplicating the number.
export { PRESS_GROW_MS as RIPPLE_GROW_MS };
