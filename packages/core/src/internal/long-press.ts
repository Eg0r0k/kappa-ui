import { onScopeDispose } from "vue";

export type TouchPolicy = "off" | "long-press" | "auto";

export const isTouchLike = (event: PointerEvent) =>
  event.pointerType === "touch" || (event.pointerType === "pen" && event.buttons !== 0);

export const nativeLongPress = [
  "a[href]",
  "img",
  '[draggable="true"]',
  "input",
  "textarea",
  "select",
  '[contenteditable]:not([contenteditable="false"])',
  '[data-slot="context-menu-trigger"]',
  "[data-kappa-longpress]",
].join(", ");

const selection = ["user-select", "-webkit-user-select"];
let locks = 0;
let saved: string[] = [];

const lockSelection = (body: HTMLElement) => {
  locks += 1;
  if (locks > 1) return;
  saved = selection.map((name) => body.style.getPropertyValue(name));
  for (const name of selection) body.style.setProperty(name, "none");
};

const unlockSelection = (body: HTMLElement) => {
  if (locks === 0) return;
  locks -= 1;
  if (locks > 0) return;
  selection.forEach((name, index) => body.style.setProperty(name, saved[index] ?? ""));
};

type Press = {
  id: number;
  x: number;
  y: number;
  el: HTMLElement;
  callout: string;
  locked: boolean;
  fired: boolean;
  timer: ReturnType<typeof setTimeout>;
  listeners: AbortController;
};

export type LongPressOptions = {
  policy: () => TouchPolicy;
  delay: () => number;
  hideDelay?: () => number;
  open: (event: PointerEvent) => void;
  close?: (event: Event) => void;
};

export const useLongPress = (options: LongPressOptions) => {
  let press: Press | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let swallowClick = false;

  const unlock = (current: Press, after: number) => {
    if (!current.locked) return;
    current.locked = false;
    const body = current.el.ownerDocument.body;
    if (after > 0) setTimeout(() => unlockSelection(body), after);
    else unlockSelection(body);
  };

  const end = (after: number) => {
    const current = press;
    if (!current) return;
    press = undefined;
    clearTimeout(current.timer);
    current.listeners.abort();
    current.el.style.setProperty("-webkit-touch-callout", current.callout);
    unlock(current, after);
  };

  const fire = (event: PointerEvent) => {
    if (!press) return;
    press.fired = true;
    unlock(press, 0);
    swallowClick = true;
    options.open(event);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!press || event.pointerId !== press.id || press.fired) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) end(10);
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!press || event.pointerId !== press.id) return;
    const fired = press.fired;
    end(10);
    const { close, hideDelay } = options;
    if (fired && close && hideDelay) hideTimer = setTimeout(() => close(event), hideDelay());
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!isTouchLike(event) || !event.isPrimary) return;
    end(0);
    clearTimeout(hideTimer);
    swallowClick = false;
    const policy = options.policy();
    if (policy === "off" || (policy === "auto" && (event.target as Element).closest(nativeLongPress))) return;
    const el = event.currentTarget as HTMLElement;
    const doc = el.ownerDocument;
    const listeners = new AbortController();
    const { signal } = listeners;
    doc.addEventListener("pointermove", onPointerMove, { signal });
    doc.addEventListener("pointerup", onPointerUp, { signal });
    doc.addEventListener("pointercancel", onPointerUp, { signal });
    el.addEventListener("contextmenu", (menu) => menu.preventDefault(), { signal });
    press = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      el,
      callout: el.style.getPropertyValue("-webkit-touch-callout"),
      locked: true,
      fired: false,
      timer: setTimeout(() => fire(event), options.delay()),
      listeners,
    };
    el.style.setProperty("-webkit-touch-callout", "none");
    lockSelection(doc.body);
  };

  const onClickCapture = (event: MouseEvent) => {
    if (!swallowClick) return;
    swallowClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  onScopeDispose(() => {
    end(0);
    clearTimeout(hideTimer);
  });

  return { onPointerDown, onClickCapture };
};
