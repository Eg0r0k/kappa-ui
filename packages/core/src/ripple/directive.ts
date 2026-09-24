import type { Directive, DirectiveBinding } from "vue";

const PRESS_GROW_MS = 450;
const FADE_OUT_MS = 375;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";
const MINIMUM_PRESS_MS = 225;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;

const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, [role="button"]';

export type RippleOptions = {
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

export type RippleElement = HTMLElement & { _ripple?: RippleState };

const parseBinding = (binding: DirectiveBinding): RippleOptions => {
  if (typeof binding.value === "boolean") return { disabled: !binding.value };
  if (binding.value && typeof binding.value === "object") return binding.value;
  return {};
};

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

const readTime = (style: CSSStyleDeclaration, name: string, fallback: number) => {
  const value = style.getPropertyValue(name).trim();
  const time = Number.parseFloat(value);
  if (Number.isNaN(time)) return fallback;
  if (value.endsWith("ms")) return time;
  return value.endsWith("s") ? time * 1000 : fallback;
};

const readEasing = (style: CSSStyleDeclaration) => style.getPropertyValue("--delta-ripple-easing").trim() || EASING;

const matches = (query: string) => typeof matchMedia === "function" && matchMedia(query).matches;

const ensureContainer = (el: RippleElement): HTMLElement => {
  const state = el._ripple!;
  if (state.container) return state.container;

  if (getComputedStyle(el).position === "static") {
    el.style.position = "relative";
  }

  const container = document.createElement("span");
  container.setAttribute("data-slot", "ripple");
  container.setAttribute("aria-hidden", "true");
  Object.assign(container.style, {
    position: "absolute",
    inset: "0",
    overflow: "hidden",
    borderRadius: "inherit",
    pointerEvents: "none",
  });
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

const releaseWave = (el: RippleElement, state: RippleState, wave: Wave) => {
  if (wave.released) return;
  wave.released = true;

  const elapsed = performance.now() - wave.startTime;
  const holdFor = Math.max(MINIMUM_PRESS_MS - elapsed, 0);
  const fadeFor = readTime(getComputedStyle(el), "--delta-ripple-fade-duration", FADE_OUT_MS);

  wave.hideTimer = setTimeout(() => {
    wave.element.dataset.hiding = "";
    wave.element.animate([{ opacity: 0 }], { duration: fadeFor, easing: "linear", fill: "forwards" });
  }, holdFor);

  wave.removeTimer = setTimeout(() => {
    removeWave(state, wave);
  }, holdFor + fadeFor);
};

const spawnWave = (el: RippleElement, state: RippleState, x: number, y: number): Wave => {
  const geometry = computeGeometry(el.getBoundingClientRect(), x, y);
  const style = getComputedStyle(el);
  const from = `translate(${geometry.from.x}px, ${geometry.from.y}px) scale(1)`;
  const to = `translate(${geometry.to.x}px, ${geometry.to.y}px) scale(${geometry.scale})`;

  const element = document.createElement("span");
  Object.assign(element.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: `${geometry.initialSize}px`,
    height: `${geometry.initialSize}px`,
    borderRadius: "50%",
    opacity: "var(--delta-ripple-opacity, 0.12)",
    background:
      "radial-gradient(closest-side, var(--delta-ripple-color, currentColor) max(calc(100% - 70px), 65%), transparent 100%)",
    transform: from,
  });
  if (state.options.color) element.style.setProperty("--delta-ripple-color", state.options.color);
  if (state.options.opacity !== undefined) {
    element.style.setProperty("--delta-ripple-opacity", `${state.options.opacity}`);
  }

  ensureContainer(el).appendChild(element);

  if (matches("(prefers-reduced-motion: reduce)")) {
    element.style.transform = to;
  } else {
    element.animate([{ transform: from }, { transform: to }], {
      duration: readTime(style, "--delta-ripple-grow-duration", PRESS_GROW_MS),
      easing: readEasing(style),
      fill: "forwards",
    });
  }

  const wave: Wave = { element, startTime: performance.now(), released: false };
  state.waves.add(wave);
  return wave;
};

const belongsToNestedControl = (el: HTMLElement, target: EventTarget | null) => {
  const interactive = (target as HTMLElement | null)?.closest(INTERACTIVE_SELECTOR);
  return Boolean(interactive) && interactive !== el;
};

const setupRipple = (el: RippleElement, binding: DirectiveBinding) => {
  if (el._ripple) return;

  const releaseCurrent = () => {
    const state = el._ripple;
    if (state?.current) releaseWave(el, state, state.current);
  };

  const releasePrimary = (event: PointerEvent) => {
    if (event.isPrimary) releaseCurrent();
  };

  // detail is 0 only when no pointer produced the click: keyboard, label, .click()
  const onClick = (event: MouseEvent) => {
    if (event.detail !== 0) return;

    const state = el._ripple;
    if (!state || state.options.disabled) return;
    if (matches("(forced-colors: active)")) return;
    if (belongsToNestedControl(el, event.target)) return;

    releaseCurrent();

    const rect = el.getBoundingClientRect();
    const wave = spawnWave(el, state, rect.width / 2, rect.height / 2);
    state.current = wave;
    releaseWave(el, state, wave);
  };

  const onPointerdown = (event: PointerEvent) => {
    if (event.button === 1) return;
    if (!event.isPrimary) return;

    const state = el._ripple;
    if (!state || state.options.disabled) return;
    if (matches("(forced-colors: active)")) return;

    // a wave whose release was lost must not outlive the next press
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

export { PRESS_GROW_MS as RIPPLE_GROW_MS };
