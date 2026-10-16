import { onMounted } from "vue";

let observer: MutationObserver | null = null;
let locked = false;
let previousGutter: string | null = null;

const isPageLocked = (html: HTMLElement, body: HTMLElement) => {
  const scroller = getComputedStyle(html).overflowY === "visible" ? body : html;
  return /hidden|clip/.test(getComputedStyle(scroller).overflowY);
};

const reserve = (html: HTMLElement) => {
  if (getComputedStyle(html).scrollbarGutter.startsWith("stable")) return;
  if (html.scrollHeight <= html.clientHeight) return;
  previousGutter = html.style.scrollbarGutter;
  html.style.scrollbarGutter = "stable";
};

const release = (html: HTMLElement) => {
  if (previousGutter === null) return;
  html.style.scrollbarGutter = previousGutter;
  previousGutter = null;
};

const update = () => {
  const html = document.documentElement;
  const next = isPageLocked(html, document.body);
  if (next === locked) return;
  locked = next;
  if (next) reserve(html);
  else release(html);
};

export const useScrollLockGutter = () => {
  onMounted(() => {
    if (observer !== null) return;
    // A lock already in place when we start belongs to the page itself.
    locked = isPageLocked(document.documentElement, document.body);
    observer = new MutationObserver(update);
    for (const element of [document.documentElement, document.body]) {
      observer.observe(element, { attributeFilter: ["style", "class"] });
    }
  });
};
