<script lang="ts">
const handled = new WeakSet<Event>();
const targets = new WeakMap<Element, { attached: number; open: number }>();
</script>

<script setup lang="ts">
import { MenuAnchor, MenuContent, MenuPortal, MenuRoot } from "@delta-ui/core/menu";
import { OverlayScrim, injectOverlayPortalTarget, useModalScrim } from "@delta-ui/core/overlay";
import { useDirection, useId } from "@delta-ui/core/utils";
import {
  type HTMLAttributes,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  shallowRef,
  toRef,
  useAttrs,
  useTemplateRef,
  watch,
} from "vue";

import { type MenuSize, menuSizeVariants, provideMenuSize } from "@/lib/menu";
import { modalScrim, overlaySurface } from "@/lib/overlay";
import { cn } from "@/lib/utils";
import { type MenuOrigin, type MenuPosition, parsePosition, placeMenu } from "./position";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    contextMenu?: boolean;
    target?: boolean | string | Element;
    noParentEvent?: boolean;
    anchor?: MenuPosition;
    self?: MenuPosition;
    offset?: [number, number];
    cover?: boolean;
    fit?: boolean;
    touchPosition?: boolean;
    autoClose?: boolean;
    persistent?: boolean;
    modal?: boolean;
    maxHeight?: string;
    maxWidth?: string;
    size?: MenuSize;
    class?: HTMLAttributes["class"];
  }>(),
  { target: true, modal: true },
);

const open = defineModel<boolean>({ default: false });

const attrs = useAttrs();
const dir = useDirection();
const contentId = useId(undefined, "menu");
const portalTarget = injectOverlayPortalTarget(null);

const size = toRef(() => props.size ?? "md");
provideMenuSize(size);

const probe = useTemplateRef<HTMLElement>("probe");
const anchorEl = shallowRef<HTMLElement | null>(null);
const point = shallowRef<{ x: number; y: number } | null>(null);
const opened = reactive<{ self: MenuOrigin }>({ self: { vertical: "top", horizontal: "left" } });

const contentElement = () => document.getElementById(contentId);

const pointerPosition = (event?: Event) =>
  event instanceof MouseEvent && (event.detail > 0 || event.type === "contextmenu") ? event : null;

const show = (event?: Event) => {
  const pointer = props.touchPosition || props.contextMenu ? pointerPosition(event) : null;
  const box = anchorEl.value?.getBoundingClientRect();
  point.value = pointer && box ? { x: pointer.clientX - box.left, y: pointer.clientY - box.top } : null;
  open.value = true;
};

const hide = () => {
  open.value = false;
};

const toggle = (event?: Event) => (open.value ? hide() : show(event));

const measure = (element: HTMLElement, box: DOMRect) => {
  element.style.maxHeight = props.maxHeight ?? "";
  element.style.maxWidth = props.maxWidth ?? "";
  element.style.minWidth = props.fit || props.cover ? `${box.width}px` : "";
  element.style.minHeight = props.cover ? `${box.height}px` : "";
  return { width: element.offsetWidth, height: element.offsetHeight };
};

const cap = (space: number | null, limit: string | undefined) =>
  space === null ? (limit ?? "") : limit ? `min(${space}px, ${limit})` : `${space}px`;

const gap = (a: string, b: string) =>
  a !== b && !["center", "middle"].includes(a) && !["center", "middle"].includes(b) ? 4 : 0;

const defaultOffset = (anchor: MenuOrigin, self: MenuOrigin): [number, number] => [
  gap(anchor.horizontal, self.horizontal),
  gap(anchor.vertical, self.vertical),
];

const reference = {
  get contextElement() {
    return anchorEl.value ?? undefined;
  },
  getBoundingClientRect: () => {
    const target = anchorEl.value;
    const element = contentElement();
    if (!target || !element) return new DOMRect();

    const box = target.getBoundingClientRect();
    const rect = point.value
      ? {
          top: box.top + point.value.y,
          bottom: box.top + point.value.y,
          left: box.left + point.value.x,
          right: box.left + point.value.x,
        }
      : box;
    const rtl = dir.value === "rtl";
    const anchor = parsePosition(props.anchor ?? (props.cover ? "center middle" : "bottom start"), rtl);
    const self = props.cover ? anchor : parsePosition(props.self ?? "top start", rtl);
    const size = measure(element, box);
    const placement = placeMenu({
      rect,
      ...size,
      anchor,
      self,
      offset: props.cover ? [0, 0] : (props.offset ?? (point.value ? [0, 0] : defaultOffset(anchor, self))),
      viewport: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
    });

    element.style.maxHeight = cap(placement.maxHeight, props.maxHeight);
    element.style.maxWidth = cap(placement.maxWidth, props.maxWidth);
    opened.self = placement.self;

    const width = Math.min(size.width, placement.maxWidth ?? size.width);
    return new DOMRect(placement.left + width / 2, placement.top, 0, 0);
  },
};

const originX = { left: "left", middle: "center", right: "right" } as const;
const originY = { top: "top", center: "center", bottom: "bottom" } as const;
const slideY = { top: "-0.25rem", center: "0", bottom: "0.25rem" } as const;

const contentStyle = () => ({
  transformOrigin: `${originY[opened.self.vertical]} ${originX[opened.self.horizontal]}`,
  "--overlay-y": slideY[opened.self.vertical],
  "--overlay-x": "0",
});

const scrim = useModalScrim({
  open,
  modal: () => props.modal,
});
const { ModalScrimHold } = scrim;

const nativelyClickable = (element: Element) =>
  element.matches("button, a[href], input, select, textarea, summary, [role=button], [role=link]");

let pressTimer: ReturnType<typeof setTimeout> | undefined;
let pressStart: { x: number; y: number } | null = null;

const clearPress = () => {
  clearTimeout(pressTimer);
  pressStart = null;
};

const onClick = (event: MouseEvent) => {
  if (handled.has(event)) return;
  handled.add(event);
  toggle(event);
};

const onKeyup = (event: KeyboardEvent) => {
  if (event.key === "Enter" && anchorEl.value && !nativelyClickable(anchorEl.value)) toggle(event);
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "ArrowDown" && !open.value) {
    event.preventDefault();
    show(event);
  }
};

const onContextmenu = (event: MouseEvent) => {
  event.preventDefault();
  if (handled.has(event)) return;
  handled.add(event);
  clearPress();
  if (!open.value) return show(event);
  hide();
  nextTick(() => show(event));
};

const onPointerdown = (event: PointerEvent) => {
  if (event.pointerType === "mouse") return;
  clearPress();
  pressStart = { x: event.clientX, y: event.clientY };
  pressTimer = setTimeout(() => {
    pressStart = null;
    show(new MouseEvent("contextmenu", { clientX: event.clientX, clientY: event.clientY }));
  }, 700);
};

const onPointermove = (event: PointerEvent) => {
  if (pressStart && Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) > 10) clearPress();
};

let detach: (() => void) | undefined;

const attach = (element: HTMLElement) => {
  const listeners: [string, EventListener][] = props.contextMenu
    ? [
        ["contextmenu", onContextmenu as EventListener],
        ["pointerdown", onPointerdown as EventListener],
        ["pointermove", onPointermove as EventListener],
        ["pointerup", clearPress],
        ["pointercancel", clearPress],
      ]
    : [
        ["click", onClick as EventListener],
        ["keyup", onKeyup as EventListener],
        ["keydown", onKeydown as EventListener],
      ];
  for (const [type, listener] of listeners) element.addEventListener(type, listener);

  const touchCallout = element.style.getPropertyValue("-webkit-touch-callout");
  if (props.contextMenu) element.style.setProperty("-webkit-touch-callout", "none");

  const target = targets.get(element) ?? { attached: 0, open: 0 };
  targets.set(element, target);
  target.attached++;
  const setState = (delta: number) => {
    target.open += delta;
    element.setAttribute("data-state", target.open > 0 ? "open" : "closed");
  };
  const stopState = watch(open, (value, previous) => setState(value ? 1 : previous ? -1 : 0), { immediate: true });

  const ownsPopup = !props.contextMenu && nativelyClickable(element) && !element.hasAttribute("aria-haspopup");
  if (ownsPopup) element.setAttribute("aria-haspopup", "menu");
  const stopExpanded = ownsPopup
    ? watch(
        open,
        (value) => {
          element.setAttribute("aria-expanded", String(value));
          if (value) element.setAttribute("aria-controls", contentId);
          else element.removeAttribute("aria-controls");
        },
        { immediate: true },
      )
    : undefined;

  return () => {
    for (const [type, listener] of listeners) element.removeEventListener(type, listener);
    element.style.setProperty("-webkit-touch-callout", touchCallout);
    clearPress();
    stopExpanded?.();
    stopState();
    if (open.value) setState(-1);
    if (--target.attached === 0) element.removeAttribute("data-state");
    if (ownsPopup) ["aria-haspopup", "aria-expanded", "aria-controls"].forEach((name) => element.removeAttribute(name));
  };
};

const resolveTarget = () => {
  if (props.target === false) return null;
  if (props.target === true) return probe.value?.parentElement ?? null;
  if (typeof props.target === "string") return document.querySelector<HTMLElement>(props.target);
  return props.target instanceof HTMLElement ? props.target : null;
};

onMounted(() => {
  watch(
    () => props.target,
    () => {
      anchorEl.value = resolveTarget();
    },
    { immediate: true },
  );
  watch(
    [anchorEl, () => props.contextMenu, () => props.noParentEvent],
    ([element, , noParentEvent]) => {
      detach?.();
      detach = element && !noParentEvent ? attach(element) : undefined;
    },
    { immediate: true },
  );
});

onBeforeUnmount(() => detach?.());

const keepOpen = (event: Event) => {
  if (props.persistent) event.preventDefault();
};

let interactedOutside = false;

const onInteractOutside = (event: CustomEvent<{ originalEvent: Event }>) => {
  const original = event.detail.originalEvent;
  const target = original.target;
  if (props.persistent || (target instanceof Node && anchorEl.value?.contains(target))) {
    event.preventDefault();
    return;
  }
  const rightClick =
    original instanceof MouseEvent && (original.button === 2 || (original.button === 0 && original.ctrlKey));
  if (!props.modal || rightClick) interactedOutside = true;
};

// focus returned to this anchor after an outside press would close the menu that press just opened
const onCloseAutoFocus = (event: Event) => {
  if (interactedOutside) event.preventDefault();
  interactedOutside = false;
};

const onContentClick = () => {
  if (props.autoClose) hide();
};

defineExpose({ show, hide, toggle });
</script>

<template>
  <span ref="probe" hidden />
  <MenuRoot v-model:open="open" :modal="props.modal" :dir="dir">
    <MenuAnchor as="template" :reference="reference" />
    <MenuPortal :to="portalTarget ?? undefined">
      <OverlayScrim :scrim="scrim" data-slot="menu-scrim" :class="modalScrim" />
      <MenuContent
        v-bind="attrs"
        :id="contentId"
        data-slot="menu"
        :data-size="size"
        side="bottom"
        align="center"
        :side-offset="0"
        :avoid-collisions="false"
        :style="contentStyle()"
        :class="
          cn(
            overlaySurface,
            'flex min-w-32 flex-col gap-0.5 overflow-x-hidden overflow-y-auto',
            menuSizeVariants({ size }),
            props.class,
          )
        "
        @escape-key-down="keepOpen"
        @pointer-down-outside="keepOpen"
        @focus-outside="keepOpen"
        @interact-outside="onInteractOutside"
        @close-auto-focus="onCloseAutoFocus"
        @click="onContentClick"
      >
        <ModalScrimHold />
        <slot />
      </MenuContent>
    </MenuPortal>
  </MenuRoot>
</template>
