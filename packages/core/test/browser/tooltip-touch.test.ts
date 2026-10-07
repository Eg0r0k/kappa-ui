import { type VueWrapper, mount } from "@vue/test-utils";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { type VNodeChild, defineComponent, h, nextTick } from "vue";

import {
  TooltipContent,
  type TooltipOpenChangeDetails,
  TooltipProvider,
  type TooltipReason,
  TooltipRoot,
  TooltipTrigger,
} from "../../src/tooltip";

type Change = [open: boolean, reason: TooltipReason];

type Options = { changes?: Change[]; props?: Record<string, unknown>; provider?: Record<string, unknown> };

const mounted: VueWrapper[] = [];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount();
  vi.advanceTimersByTime(20);
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const flush = async () => {
  await nextTick();
  await nextTick();
};

const finger = (type: string, target: Element, init: PointerEventInit = {}) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerType: "touch",
      isPrimary: true,
      pointerId: 7,
      buttons: type === "pointerup" || type === "pointercancel" ? 0 : 1,
      ...init,
    }),
  );

const contextMenuPrevented = (target: Element) => {
  const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event.defaultPrevented;
};

const render = (trigger: () => VNodeChild, { changes, props = {}, provider = {} }: Options = {}) => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(TooltipProvider, provider, () =>
          h(
            TooltipRoot,
            {
              ...props,
              "onUpdate:open": (open: boolean, details: TooltipOpenChangeDetails) =>
                changes?.push([open, details.reason]),
            },
            () => [
              h(TooltipTrigger, { asChild: true }, trigger),
              h(TooltipContent, { "data-test": "content" }, () => "Tip"),
            ],
          ),
        ),
    }),
    { attachTo: document.body },
  );
  mounted.push(wrapper);
};

const button =
  (attrs: Record<string, unknown> = {}) =>
  () =>
    h("button", { "data-test": "trigger", ...attrs }, "Save");

const element = (name: string) => document.querySelector<HTMLElement>(`[data-test=${name}]`)!;
const content = () => document.querySelector<HTMLElement>("[data-test=content]");
const userSelect = () => document.body.style.userSelect;

it("opens on a long press, swallows the click after it and hides after the release delay", async () => {
  const changes: Change[] = [];
  const clicks = vi.fn();
  render(button({ onClick: clicks }), { changes });
  finger("pointerdown", element("trigger"));
  expect(userSelect()).toBe("none");
  vi.advanceTimersByTime(499);
  await flush();
  expect(content()).toBeNull();
  vi.advanceTimersByTime(1);
  await flush();
  expect(userSelect()).toBe("");
  expect(content()?.dataset.touch).toBe("");
  expect(content()?.dataset.state).toBe("instant-open");
  expect(changes).toEqual([[true, "trigger-press"]]);
  expect(contextMenuPrevented(element("trigger"))).toBe(true);
  finger("pointerup", element("trigger"));
  element("trigger").click();
  expect(clicks).not.toHaveBeenCalled();
  expect(contextMenuPrevented(element("trigger"))).toBe(false);
  vi.advanceTimersByTime(1499);
  await flush();
  expect(content()).not.toBeNull();
  vi.advanceTimersByTime(1);
  await flush();
  expect(content()).toBeNull();
  expect(changes.at(-1)).toEqual([false, "touch-release"]);
});

it("lets a short tap through as one click and puts the selection back", async () => {
  const clicks = vi.fn();
  render(button({ onClick: clicks }));
  finger("pointerdown", element("trigger"));
  vi.advanceTimersByTime(100);
  finger("pointerup", element("trigger"));
  element("trigger").click();
  expect(clicks).toHaveBeenCalledTimes(1);
  expect(userSelect()).toBe("none");
  vi.advanceTimersByTime(10);
  expect(userSelect()).toBe("");
  finger("pointermove", element("trigger"), { buttons: 0 });
  vi.advanceTimersByTime(1000);
  await flush();
  expect(content()).toBeNull();
});

it("gives up when the finger moves more than 10px", async () => {
  render(button());
  finger("pointerdown", element("trigger"), { clientX: 10, clientY: 10 });
  finger("pointermove", element("trigger"), { clientX: 10, clientY: 25 });
  vi.advanceTimersByTime(10);
  expect(userSelect()).toBe("");
  vi.advanceTimersByTime(1000);
  await flush();
  expect(content()).toBeNull();
});

it("ignores a second finger", async () => {
  render(button());
  finger("pointerdown", element("trigger"));
  finger("pointerdown", element("trigger"), { pointerId: 8, isPrimary: false });
  finger("pointerup", element("trigger"), { pointerId: 8, isPrimary: false });
  vi.advanceTimersByTime(500);
  await flush();
  expect(content()).not.toBeNull();
});

it("cleans up when the browser cancels the press", async () => {
  render(button());
  finger("pointerdown", element("trigger"));
  finger("pointercancel", element("trigger"));
  vi.advanceTimersByTime(10);
  expect(userSelect()).toBe("");
  expect(contextMenuPrevented(element("trigger"))).toBe(false);
  vi.advanceTimersByTime(1000);
  await flush();
  expect(content()).toBeNull();
});

it("does nothing on touch with touch off", async () => {
  render(button(), { provider: { touch: "off" } });
  finger("pointerdown", element("trigger"));
  expect(userSelect()).toBe("");
  expect(contextMenuPrevented(element("trigger"))).toBe(false);
  vi.advanceTimersByTime(1000);
  await flush();
  expect(content()).toBeNull();
});

it("keeps the selection lock balanced across quick presses", () => {
  document.body.style.userSelect = "text";
  render(button({ "data-test": "a" }));
  render(button({ "data-test": "b" }));
  finger("pointerdown", element("a"));
  finger("pointerup", element("a"));
  finger("pointerdown", element("b"), { pointerId: 9 });
  vi.advanceTimersByTime(5);
  finger("pointerup", element("b"), { pointerId: 9 });
  vi.advanceTimersByTime(20);
  expect(userSelect()).toBe("text");
});

it.each([
  ["a link", () => h("a", { href: "#", "data-test": "trigger" }, "Docs")],
  ["an input", () => h("input", { "data-test": "trigger" })],
  ["an image", () => h("img", { alt: "", "data-test": "trigger" })],
  ["a draggable element", () => h("div", { draggable: "true", "data-test": "trigger" }, "Drag")],
  ["a context menu trigger", () => h("div", { "data-slot": "context-menu-trigger", "data-test": "trigger" }, "Menu")],
  ["an opted-out element", () => h("div", { "data-kappa-longpress": "", "data-test": "trigger" }, "Hold")],
])("leaves the native long press of %s alone under auto", async (_, trigger) => {
  render(trigger);
  finger("pointerdown", element("trigger"));
  expect(userSelect()).toBe("");
  expect(contextMenuPrevented(element("trigger"))).toBe(false);
  vi.advanceTimersByTime(1000);
  await flush();
  expect(content()).toBeNull();
});

it("finds a link around the pressed element", async () => {
  render(() => h("a", { href: "#" }, [h("span", { "data-test": "inner" }, "Docs")]));
  finger("pointerdown", element("inner"));
  vi.advanceTimersByTime(1000);
  await flush();
  expect(content()).toBeNull();
});

it("long-presses a link under the long-press policy", async () => {
  render(() => h("a", { href: "#", "data-test": "trigger" }, "Docs"), { provider: { touch: "long-press" } });
  finger("pointerdown", element("trigger"));
  vi.advanceTimersByTime(500);
  await flush();
  expect(content()).not.toBeNull();
});

it("treats a pen in contact as touch", async () => {
  render(button());
  finger("pointerdown", element("trigger"), { pointerType: "pen" });
  vi.advanceTimersByTime(500);
  await flush();
  expect(content()?.dataset.touch).toBe("");
});

it("closes on a tap outside", async () => {
  const changes: Change[] = [];
  render(button(), { changes });
  finger("pointerdown", element("trigger"));
  vi.advanceTimersByTime(500);
  await flush();
  finger("pointerup", element("trigger"));
  vi.advanceTimersByTime(1);
  finger("pointerdown", document.body);
  document.body.click();
  await flush();
  expect(content()).toBeNull();
  expect(changes.at(-1)).toEqual([false, "outside-press"]);
});

it("does not long-press a disabled tooltip", () => {
  const clicks = vi.fn();
  render(button({ onClick: clicks }), { props: { disabled: true } });
  finger("pointerdown", element("trigger"));
  vi.advanceTimersByTime(600);
  finger("pointerup", element("trigger"));
  element("trigger").click();
  expect(clicks).toHaveBeenCalledTimes(1);
  expect(userSelect()).toBe("");
});

it("restores the selection when unmounted mid-press", () => {
  render(button());
  finger("pointerdown", element("trigger"));
  mounted.pop()!.unmount();
  expect(userSelect()).toBe("");
});

it("falls back to auto for an unknown policy", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  render(button(), { provider: { touch: "sometimes" } });
  finger("pointerdown", element("trigger"));
  vi.advanceTimersByTime(500);
  await flush();
  expect(content()).not.toBeNull();
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('touch="sometimes"'));
});
