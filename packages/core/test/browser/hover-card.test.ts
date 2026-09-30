import { type VueWrapper, mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNodeChild, defineComponent, h, nextTick, ref } from "vue";

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

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount();
  vi.useRealTimers();
  document.body.innerHTML = "";
});

const flush = async () => {
  await nextTick();
  await nextTick();
};

const mouse = (type: string, target: Element, init: PointerEventInit = {}) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: type !== "pointerleave",
      cancelable: true,
      pointerType: "mouse",
      isPrimary: true,
      pointerId: 1,
      ...init,
    }),
  );

const button = () => h("button", { "data-test": "trigger" }, "@kappa");

const card = ({ props = {}, changes, trigger = button }: Options = {}) =>
  h(
    HoverCardRoot,
    {
      openDelay: 0,
      closeDelay: 0,
      ...props,
      "onUpdate:open": (open: boolean, details: HoverCardOpenChangeDetails) => changes?.push([open, details.reason]),
    },
    () => [
      h(HoverCardTrigger, { asChild: true }, trigger),
      h(HoverCardContent, { "data-test": "content" }, () => [h("a", { href: "#", "data-test": "inside" }, "Profile")]),
    ],
  );

const render = (options: Options = {}) => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h("div", [
          h("div", { "data-test": "scroller" }, [card(options)]),
          h("div", { "data-test": "other" }, [h("button", { "data-test": "outside" }, "Elsewhere")]),
        ]),
    }),
    { attachTo: document.body },
  );
  mounted.push(wrapper);
  return wrapper;
};

const element = (name: string) => document.querySelector<HTMLElement>(`[data-test=${name}]`)!;
const content = () => document.querySelector<HTMLElement>("[data-test=content]");
const opened = () => expect.poll(() => content()).not.toBeNull();
const closed = () => expect.poll(() => content()).toBeNull();

it("opens once the pointer has rested for openDelay and reports trigger-hover", async () => {
  vi.useFakeTimers();
  const changes: Change[] = [];
  render({ props: { openDelay: 700 }, changes });
  mouse("pointermove", element("trigger"));
  vi.advanceTimersByTime(600);
  await flush();
  expect(content()).toBeNull();
  vi.advanceTimersByTime(100);
  await flush();
  expect(content()).not.toBeNull();
  expect(changes).toEqual([[true, "trigger-hover"]]);
});

it("does not open when the pointer leaves before the delay", async () => {
  vi.useFakeTimers();
  const changes: Change[] = [];
  render({ props: { openDelay: 700 }, changes });
  mouse("pointermove", element("trigger"));
  vi.advanceTimersByTime(300);
  mouse("pointerleave", element("trigger"));
  vi.advanceTimersByTime(2000);
  await flush();
  expect(content()).toBeNull();
  expect(changes).toEqual([]);
});

it("closes on Escape with escape-key", async () => {
  const changes: Change[] = [];
  render({ changes });
  mouse("pointermove", element("trigger"));
  await opened();
  await userEvent.keyboard("{Escape}");
  await closed();
  expect(changes.at(-1)).toEqual([false, "escape-key"]);
});

it("closes on a mouse press outside as outside-press, and on the trigger as trigger-press", async () => {
  const changes: Change[] = [];
  render({ changes });
  mouse("pointermove", element("trigger"));
  await opened();
  mouse("pointerdown", element("outside"));
  await closed();
  expect(changes.at(-1)).toEqual([false, "outside-press"]);

  mouse("pointermove", element("trigger"), { movementX: 5 });
  await opened();
  mouse("pointerdown", element("trigger"));
  await closed();
  expect(changes.at(-1)).toEqual([false, "trigger-press"]);
});

it("closes when an element holding the trigger scrolls, not another one", async () => {
  const changes: Change[] = [];
  render({ changes });
  mouse("pointermove", element("trigger"));
  await opened();
  element("other").dispatchEvent(new Event("scroll"));
  await flush();
  expect(content()).not.toBeNull();
  element("scroller").dispatchEvent(new Event("scroll"));
  await closed();
  expect(changes.at(-1)).toEqual([false, "scroll"]);
});

it("opens on keyboard focus and closes when focus moves on, as trigger-focus", async () => {
  const changes: Change[] = [];
  render({ changes });
  await userEvent.tab();
  expect(document.activeElement).toBe(element("trigger"));
  await opened();
  expect(changes.at(-1)).toEqual([true, "trigger-focus"]);
  await userEvent.tab();
  await closed();
  expect(changes.at(-1)).toEqual([false, "trigger-focus"]);
});

it("closes with disabled and ignores the pointer while disabled", async () => {
  const changes: Change[] = [];
  const disabled = ref(false);
  const wrapper = mount(
    defineComponent({
      setup: () => () => card({ props: { disabled: disabled.value }, changes }),
    }),
    { attachTo: document.body },
  );
  mounted.push(wrapper);
  mouse("pointermove", element("trigger"));
  await opened();
  disabled.value = true;
  await closed();
  expect(changes.at(-1)).toEqual([false, "disabled"]);
  mouse("pointermove", element("trigger"), { movementX: 5 });
  await flush();
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(content()).toBeNull();
});

it("renders when open is set from outside and emits nothing", async () => {
  const changes: Change[] = [];
  render({ props: { open: true }, changes });
  await opened();
  expect(element("trigger").dataset.state).toBe("open");
  expect(changes).toEqual([]);
});
