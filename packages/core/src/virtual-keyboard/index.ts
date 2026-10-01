import { useEventListener } from "@vueuse/core";
import { type MaybeRefOrGetter, type Ref, ref, toValue, watch } from "vue";

const measure = () => {
  const viewport = window.visualViewport;
  if (!viewport) return 0;
  return Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));
};

export const useVirtualKeyboardInset = (active: MaybeRefOrGetter<boolean>): Ref<number> => {
  const inset = ref(0);
  const update = () => {
    inset.value = toValue(active) ? measure() : 0;
  };
  const viewport = typeof window === "undefined" ? null : window.visualViewport;
  useEventListener(viewport, "resize", update, { passive: true });
  useEventListener(viewport, "scroll", update, { passive: true });
  watch(() => toValue(active), update, { immediate: true });
  return inset;
};

export const scrollFocusedIntoView = (root: Element) => {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && root.contains(focused)) focused.scrollIntoView({ block: "nearest" });
};
