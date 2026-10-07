import { type VueWrapper, mount } from "@vue/test-utils";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { type VNodeChild, defineComponent, h, nextTick } from "vue";

import {
  HoverCardContent,
  type HoverCardOpenChangeDetails,
  type HoverCardReason,
  HoverCardRoot,
  HoverCardTrigger,
} from "../../src/hover-card";

type Change = [open: boolean, reason: HoverCardReason];

type Options = { props?: Record<string, unknown>; changes?: Change[]; trigger?: () => VNodeChild };

const mounted: VueWrapper[] = [];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount();
  vi.advanceTimersByTime(20);
  vi.useRealTimers();
});

const flush = async () => {
  await nextTick();
  await nextTick();
};

const finger = (type: string, target: Element, init: PointerEventInit = {}) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: type !== "pointerleave",
      cancelable: true,
      pointerType: "touch",
      isPrimary: true,
      pointerId: 7,
      buttons: type === "pointerup" || type === "pointercancel" ? 0 : 1,
      ...init,
    }),
  );

const tap = (target: Element, init: PointerEventInit = {}) => {
  finger("pointerdown", target, init);
  finger("pointerup", target, init);
};

const click = (target: Element) => {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event.defaultPrevented;
};

const contextMenuPrevented = (target: Element) => {
  const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event.defaultPrevented;
};

const button = () => h("button", { "data-test": "trigger" }, "@kappa");
const link = () => h("a", { href: "#profile", "data-test": "trigger" }, "@kappa");

const render = ({ props = {}, changes, trigger = button }: Options = {}) => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h("div", [
          h("div", { "data-test": "scroller" }, [
            h(
              HoverCardRoot,
              {
                ...props,
                "onUpdate:open": (open: boolean, details: HoverCardOpenChangeDetails) =>
                  changes?.push([open, details.reason]),
              },
              () => [
                h(HoverCardTrigger, { asChild: true }, trigger),
                h(HoverCardContent, { "data-test": "content" }, () => [
                  h("a", { href: "#", "data-test": "inside" }, "Profile"),
                ]),
              ],
            ),
          ]),
          h("button", { "data-test": "outside" }, "Elsewhere"),
        ]),
    }),
    { attachTo: document.body },
  );
  mounted.push(wrapper);
};

const element = (name: string) => document.querySelector<HTMLElement>(`[data-test=${name}]`)!;
const content = () => document.querySelector<HTMLElement>("[data-test=content]");

const openByTap = async (changes: Change[]) => {
  tap(element("trigger"));
  await flush();
  expect(content()).not.toBeNull();
  expect(changes).toEqual([[true, "trigger-press"]]);
};

it("auto: a tap opens a button trigger at once and a second tap closes it", async () => {
  const changes: Change[] = [];
  render({ changes });
  await openByTap(changes);
  tap(element("trigger"));
  await flush();
  expect(content()).toBeNull();
  expect(changes.at(-1)).toEqual([false, "trigger-press"]);
});

it("auto: a tap on a link is left to the link, a long press opens and the card stays after the release", async () => {
  const changes: Change[] = [];
  render({ changes, trigger: link });
  tap(element("trigger"));
  await flush();
  expect(content()).toBeNull();
  expect(click(element("trigger"))).toBe(false);

  finger("pointerdown", element("trigger"));
  vi.advanceTimersByTime(499);
  await flush();
  expect(content()).toBeNull();
  vi.advanceTimersByTime(1);
  await flush();
  expect(content()).not.toBeNull();
  expect(changes).toEqual([[true, "trigger-press"]]);
  expect(contextMenuPrevented(element("trigger"))).toBe(true);
  finger("pointerup", element("trigger"));
  expect(click(element("trigger"))).toBe(true);
  vi.advanceTimersByTime(5000);
  await flush();
  expect(content()).not.toBeNull();
  expect(changes).toHaveLength(1);
});

it("long-press: a button needs the long press too", async () => {
  const changes: Change[] = [];
  render({ changes, props: { touch: "long-press" } });
  tap(element("trigger"));
  await flush();
  expect(content()).toBeNull();
  finger("pointerdown", element("trigger"));
  vi.advanceTimersByTime(500);
  await flush();
  expect(content()).not.toBeNull();
  expect(changes).toEqual([[true, "trigger-press"]]);
});

it("off: touch does nothing", async () => {
  const changes: Change[] = [];
  render({ changes, props: { touch: "off" } });
  tap(element("trigger"));
  finger("pointerdown", element("trigger"));
  vi.advanceTimersByTime(1000);
  await flush();
  expect(content()).toBeNull();
  expect(changes).toEqual([]);
});

it("keeps a touch-opened card while the page scrolls or the finger wanders", async () => {
  const changes: Change[] = [];
  render({ changes });
  await openByTap(changes);
  element("scroller").dispatchEvent(new Event("scroll"));
  finger("pointerleave", element("trigger"), { clientX: 10, clientY: 10 });
  finger("pointermove", document.body, { clientX: 5000, clientY: 5000 });
  vi.advanceTimersByTime(2000);
  await flush();
  expect(content()).not.toBeNull();
  expect(changes).toHaveLength(1);
});

it("closes on a tap outside as outside-press, not on a swipe or a cancelled touch", async () => {
  const changes: Change[] = [];
  render({ changes });
  await openByTap(changes);

  finger("pointerdown", element("outside"), { clientX: 100, clientY: 100 });
  finger("pointermove", element("outside"), { clientX: 140, clientY: 100 });
  finger("pointerup", element("outside"), { clientX: 140, clientY: 100 });
  await flush();
  expect(content()).not.toBeNull();

  finger("pointerdown", element("outside"), { clientX: 100, clientY: 100 });
  finger("pointercancel", element("outside"), { clientX: 100, clientY: 100 });
  await flush();
  expect(content()).not.toBeNull();

  finger("pointerdown", element("outside"), { clientX: 100, clientY: 100 });
  finger("pointerup", element("outside"), { clientX: 104, clientY: 100 });
  await flush();
  expect(content()).toBeNull();
  expect(changes.at(-1)).toEqual([false, "outside-press"]);
});

it("keeps the card on a tap inside it", async () => {
  const changes: Change[] = [];
  render({ changes });
  await openByTap(changes);
  tap(element("inside"));
  await flush();
  expect(content()).not.toBeNull();
  expect(changes).toHaveLength(1);
});

it("is not closed by a click that arrives after a swipe, and the next tap still works", async () => {
  const changes: Change[] = [];
  render({ changes });
  await openByTap(changes);
  finger("pointerdown", element("outside"), { clientX: 100, clientY: 100 });
  finger("pointermove", element("outside"), { clientX: 100, clientY: 160 });
  finger("pointercancel", element("outside"), { clientX: 100, clientY: 160 });
  element("scroller").dispatchEvent(new Event("scroll"));
  vi.advanceTimersByTime(500);
  document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await flush();
  expect(content()).not.toBeNull();
  tap(element("trigger"));
  await flush();
  expect(content()).toBeNull();
  expect(changes.at(-1)).toEqual([false, "trigger-press"]);
});
