import { onScopeDispose } from "vue";

let scrolling = false;
let roots = 0;

const onScroll = () => {
  scrolling = true;
  queueMicrotask(() => {
    scrolling = false;
  });
};

export const isScrolling = () => scrolling;

// One capture listener for every root; the first root registers it in setup so it runs before the listener Reka's content adds on mount.
export const trackScrolling = () => {
  if (typeof window === "undefined") return;
  if (roots++ === 0) window.addEventListener("scroll", onScroll, { capture: true });
  onScopeDispose(() => {
    if (--roots === 0) window.removeEventListener("scroll", onScroll, { capture: true });
  });
};
