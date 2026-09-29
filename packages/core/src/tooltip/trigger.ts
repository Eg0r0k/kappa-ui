import { injectTooltipProviderContext, injectTooltipRootContext } from "reka-ui";
import { computed, shallowRef, watch } from "vue";

import { type TooltipReason, injectTooltipController } from "./context";
import { inspectTrigger } from "./dev";
import { isTouchLike, useLongPress } from "./long-press";

export const toggleToken = (el: Element, attribute: string, token: string, present: boolean) => {
  const tokens = (el.getAttribute(attribute) ?? "").split(/\s+/).filter((item) => item && item !== token);
  if (present) tokens.push(token);
  if (tokens.length > 0) el.setAttribute(attribute, tokens.join(" "));
  else el.removeAttribute(attribute);
};

export const useTriggerBehaviour = () => {
  const controller = injectTooltipController();
  const root = injectTooltipRootContext();
  const provider = injectTooltipProviderContext();

  const current = shallowRef<HTMLElement>();
  let cursor: { x: number; y: number } | undefined;
  let moved = false;
  let latched = false;
  let pressed = false;
  let blockFocus = false;

  const close = (reason: TooltipReason, event?: Event) => {
    controller.hide(reason, event);
    root.onClose();
  };

  const longPress = useLongPress({
    policy: () => (controller.settings.disabled ? "off" : controller.settings.touch),
    delay: () => controller.settings.touchDelay,
    hideDelay: () => controller.settings.touchHideDelay,
    open: (event) => {
      controller.request("trigger-press", event, true);
      root.onOpen();
    },
    close: (event) => {
      if (controller.touch.value) close("touch-release", event);
    },
  });

  const follow = {
    getBoundingClientRect: () => {
      const rect = root.trigger.value?.getBoundingClientRect() ?? new DOMRect();
      const axis = controller.followCursor.value;
      if (!cursor || controller.touch.value) return rect;
      return new DOMRect(
        axis === "y" ? rect.x : cursor.x,
        axis === "x" ? rect.y : cursor.y,
        axis === "y" ? rect.width : 0,
        axis === "x" ? rect.height : 0,
      );
    },
  };

  const reference = computed(() => (controller.followCursor.value === "none" ? current.value : follow));

  const track = (event: Event) => {
    const el = event.currentTarget as HTMLElement;
    if (root.trigger.value === el) return;
    current.value = el;
    root.onTriggerChange(el);
  };

  const onPointermove = (event: PointerEvent) => {
    track(event);
    if (isTouchLike(event)) return;
    cursor = { x: event.clientX, y: event.clientY };
    if (latched || controller.open.value || controller.settings.disabled) return;
    if (provider.isPointerInTransitRef.value) return;
    if ((event.target as Element).closest("[data-grace-area-trigger]") !== event.currentTarget) return;
    if (moved && event.movementX ** 2 + event.movementY ** 2 < controller.settings.restThreshold) return;
    moved = true;
    controller.request("trigger-hover", event);
    root.onTriggerEnter();
  };

  const onPointerleave = (event: PointerEvent) => {
    if (isTouchLike(event)) return;
    moved = false;
    latched = false;
    if (controller.settings.hoverable) {
      root.onTriggerLeave();
      return;
    }
    cursor = undefined;
    close("trigger-hover", event);
  };

  const onPointerdown = (event: PointerEvent) => {
    track(event);
    pressed = true;
    const released = new AbortController();
    const release = () => {
      released.abort();
      setTimeout(() => {
        pressed = false;
      }, 1);
    };
    const doc = (event.currentTarget as HTMLElement).ownerDocument;
    doc.addEventListener("pointerup", release, { signal: released.signal });
    doc.addEventListener("pointercancel", release, { signal: released.signal });
    longPress.onPointerDown(event);
    if (isTouchLike(event)) return;
    latched = true;
    if (controller.settings.closeOnClick) close("trigger-press", event);
  };

  const onClick = (event: MouseEvent) => {
    if (controller.settings.closeOnClick) close("trigger-press", event);
  };

  const onFocusin = (event: FocusEvent) => {
    track(event);
    if (blockFocus) {
      blockFocus = false;
      return;
    }
    if (pressed || controller.settings.disabled || !(event.target as Element).matches(":focus-visible")) return;
    controller.request("trigger-focus", event);
    root.onOpen();
  };

  const onFocusout = (event: FocusEvent) => {
    const trigger = event.currentTarget as HTMLElement;
    if (trigger.contains(event.relatedTarget as Node | null)) return;
    blockFocus = trigger.contains(trigger.ownerDocument.activeElement);
    close("trigger-focus", event);
  };

  watch(
    () => root.trigger.value,
    (el) => {
      if (el) inspectTrigger(el, controller.role.value);
    },
    { immediate: true },
  );

  watch(
    () => controller.forced.value,
    () => root.onOpen(),
  );

  watch(
    () => controller.open.value,
    (open) => {
      if (!open && controller.closedBy.value === "escape-key") latched = true;
    },
  );

  watch(
    [() => controller.open.value, () => root.trigger.value],
    ([open, el], _, onCleanup) => {
      if (!open || !el) return;
      if (controller.role.value === "label") toggleToken(el, "aria-describedby", root.contentId, false);
      const observer = new MutationObserver(() => {
        if (!el.isConnected || el.matches(":disabled")) close("disabled");
      });
      observer.observe(el, { attributes: true, attributeFilter: ["disabled"] });
      if (el.parentNode) observer.observe(el.parentNode, { childList: true });
      onCleanup(() => observer.disconnect());
    },
    { flush: "post" },
  );

  return {
    reference,
    handlers: {
      onPointermove,
      onPointerleave,
      onPointerdown,
      onClick,
      onClickCapture: longPress.onClickCapture,
      onFocusin,
      onFocusout,
    },
  };
};
