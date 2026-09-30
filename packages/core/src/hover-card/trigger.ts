import { injectHoverCardRootContext } from "reka-ui";
import { onScopeDispose, shallowRef, watch } from "vue";

import { isTouchLike, nativeLongPress, useLongPress } from "../internal/long-press";
import { trackTap } from "../internal/tap";
import { injectHoverCardController } from "./context";

export const useTriggerBehaviour = () => {
  const controller = injectHoverCardController();
  const root = injectHoverCardRootContext();

  const current = shallowRef<HTMLElement>();
  let moved = false;
  let pressed = false;
  let blockFocus = false;
  let stopTap: (() => void) | undefined;

  const longPress = useLongPress({
    policy: () => "long-press",
    delay: () => controller.settings.touchDelay,
    open: (event) => controller.show("trigger-press", event),
  });

  const track = (event: Event) => {
    current.value = event.currentTarget as HTMLElement;
  };

  const onPointermove = (event: PointerEvent) => {
    track(event);
    if (isTouchLike(event) || controller.open.value || controller.settings.disabled) return;
    if (root.isPointerInTransitRef.value) return;
    if ((event.target as Element).closest("[data-grace-area-trigger]") !== event.currentTarget) return;
    if (moved && event.movementX ** 2 + event.movementY ** 2 < controller.settings.restThreshold) return;
    moved = true;
    controller.request("trigger-hover", event);
    root.onClose();
    root.onOpen();
  };

  const onPointerleave = (event: PointerEvent) => {
    if (isTouchLike(event)) return;
    moved = false;
    controller.cancel();
  };

  const onPointerdown = (event: PointerEvent) => {
    track(event);
    controller.cancel();
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
    if (!isTouchLike(event) || !event.isPrimary || controller.settings.disabled) return;
    const policy = controller.settings.touch;
    if (policy === "off") return;
    if (policy === "long-press" || (event.target as Element).closest(nativeLongPress)) {
      longPress.onPointerDown(event);
      return;
    }
    stopTap?.();
    stopTap = trackTap(event, (up) => {
      stopTap = undefined;
      if (controller.open.value) controller.hide("trigger-press", up);
      else controller.show("trigger-press", up);
    });
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
    controller.cancel();
    if (controller.open.value) controller.expectClose("trigger-focus", event);
  };

  watch(
    [() => controller.open.value, () => current.value],
    ([open, el], _, onCleanup) => {
      if (!open || !el) return;
      const observer = new MutationObserver(() => {
        if (!el.isConnected || el.matches(":disabled")) controller.hide("disabled");
      });
      observer.observe(el, { attributes: true, attributeFilter: ["disabled"] });
      if (el.parentNode) observer.observe(el.parentNode, { childList: true });
      onCleanup(() => observer.disconnect());
    },
    { flush: "post" },
  );

  onScopeDispose(() => stopTap?.());

  return {
    handlers: {
      onPointermove,
      onPointerleave,
      onPointerdown,
      onClickCapture: longPress.onClickCapture,
      onFocusin,
      onFocusout,
    },
  };
};
