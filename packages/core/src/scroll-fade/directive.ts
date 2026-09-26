import type { Directive } from "vue";

const EDGES = ["x-start", "x-end", "y-start", "y-end"] as const;

type ScrollFadeElement = HTMLElement & { _scrollFade?: () => void };

const hasScrollTimelines = () => typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()");

const getEdges = (position: number, size: number, container: number) => {
  const scrollable = size > container + 1;
  return {
    start: scrollable && position > 1,
    end: scrollable && position < size - container - 1,
  };
};

const sync = (el: HTMLElement) => {
  const x = getEdges(Math.abs(el.scrollLeft), el.scrollWidth, el.clientWidth);
  const y = getEdges(el.scrollTop, el.scrollHeight, el.clientHeight);
  el.toggleAttribute("data-overflow-x-start", x.start);
  el.toggleAttribute("data-overflow-x-end", x.end);
  el.toggleAttribute("data-overflow-y-start", y.start);
  el.toggleAttribute("data-overflow-y-end", y.end);
};

const setupScrollFade = (el: ScrollFadeElement) => {
  if (el._scrollFade || hasScrollTimelines()) return;

  const update = () => sync(el);
  const resize = new ResizeObserver(update);
  const observeChildren = () => {
    resize.disconnect();
    resize.observe(el);
    for (const child of el.children) resize.observe(child);
  };
  const mutation = new MutationObserver(() => {
    observeChildren();
    update();
  });

  el.setAttribute("data-scroll-fade", "");
  el.addEventListener("scroll", update, { passive: true });
  mutation.observe(el, { childList: true });
  observeChildren();
  update();

  el._scrollFade = () => {
    el.removeEventListener("scroll", update);
    resize.disconnect();
    mutation.disconnect();
    el.removeAttribute("data-scroll-fade");
    for (const edge of EDGES) el.removeAttribute(`data-overflow-${edge}`);
    delete el._scrollFade;
  };
};

export const vScrollFade: Directive<ScrollFadeElement> = {
  mounted: (el) => setupScrollFade(el),
  beforeUnmount: (el) => el._scrollFade?.(),
};
