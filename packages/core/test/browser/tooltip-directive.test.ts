import { type VueWrapper, mount } from "@vue/test-utils";
import { TooltipPortal } from "reka-ui";
import { afterEach, expect, it, vi } from "vitest";
import { type VNodeChild, defineComponent, h, nextTick, ref, withCtx, withDirectives } from "vue";

import { TooltipContent, type TooltipDirectiveValue, TooltipProvider, createTooltipDirective } from "../../src/tooltip";

const Content = defineComponent({
  inheritAttrs: false,
  setup:
    (_, { attrs, slots }) =>
    () =>
      h(TooltipPortal, () => h(TooltipContent, { ...attrs, "data-test": "content" }, slots)),
});

const vTooltip = createTooltipDirective(Content);

type Options = { arg?: string; modifiers?: Record<string, boolean>; attrs?: Record<string, unknown>; text?: string };

const button = (value: () => TooltipDirectiveValue, { arg, modifiers = {}, attrs = {}, text = "Save" }: Options = {}) =>
  withDirectives(h("button", { "data-test": "trigger", ...attrs }, text), [[vTooltip, value(), arg, modifiers]]);

const mounted: VueWrapper[] = [];

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount();
  vi.useRealTimers();
});

const render = (children: () => VNodeChild) => {
  const wrapper = mount(defineComponent({ setup: () => children }), { attachTo: document.body });
  mounted.push(wrapper);
  return wrapper;
};

const provided = (children: () => VNodeChild, provider: Record<string, unknown> = { delay: 0 }) =>
  render(() => h(TooltipProvider, provider, children));

const element = (name: string) => document.querySelector<HTMLElement>(`[data-test=${name}]`)!;
const content = () => document.querySelector<HTMLElement>("[data-test=content]");
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const move = (target: Element) =>
  target.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerType: "mouse", isPrimary: true }));
const leave = (target: Element) => target.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));

it("opens a string on the side the arg names", async () => {
  provided(() => button(() => "Save file", { arg: "bottom" }));
  await nextTick();
  move(element("trigger"));
  await expect.poll(() => content()?.textContent).toContain("Save file");
  expect(content()!.dataset.side).toBe("bottom");
});

it("takes an object, whose options beat the provider and the arg", async () => {
  provided(() => button(() => ({ content: "Save file", side: "right", delay: 0 }), { arg: "bottom" }), {
    delay: 5000,
  });
  await nextTick();
  move(element("trigger"));
  await expect.poll(() => content()?.dataset.side).toBe("right");
});

it("renders nothing for an empty value and follows the value as it changes", async () => {
  const value = ref<TooltipDirectiveValue>("");
  provided(() => button(() => value.value));
  await nextTick();
  move(element("trigger"));
  await wait(50);
  expect(content()).toBeNull();
  value.value = "Save";
  await nextTick();
  await nextTick();
  move(element("trigger"));
  await expect.poll(() => content()?.textContent).toContain("Save");
  value.value = "Saved";
  await expect.poll(() => content()?.textContent).toContain("Saved");
  value.value = false;
  await expect.poll(() => content()).toBeNull();
});

it("leaves its tooltip alone when the component re-renders with the same options", async () => {
  let renders = 0;
  const Counted = defineComponent({
    setup:
      (_, { slots }) =>
      () => {
        renders += 1;
        return h("span", slots.default?.());
      },
  });
  const vCounted = createTooltipDirective(Counted);
  const count = ref(0);
  const text = ref("Save");
  render(() => [
    h("output", count.value),
    withDirectives(h("button", "Save"), [[vCounted, { content: text.value, side: "right" }]]),
  ]);
  await nextTick();
  const initial = renders;
  count.value += 1;
  await nextTick();
  expect(renders).toBe(initial);
  text.value = "Saved";
  await nextTick();
  expect(renders).toBe(initial + 1);
});

it("adds its description to the element's own while open", async () => {
  render(() => [
    h("p", { id: "note" }, "Note"),
    h(TooltipProvider, { delay: 0 }, () => button(() => "Save", { attrs: { "aria-describedby": "note" } })),
  ]);
  await nextTick();
  move(element("trigger"));
  await expect.poll(() => element("trigger").getAttribute("aria-describedby")?.split(" ").length).toBe(2);
  const [own, id] = element("trigger").getAttribute("aria-describedby")!.split(" ");
  expect(own).toBe("note");
  expect(document.getElementById(id!)?.textContent).toBe("Save");
  leave(element("trigger"));
  await expect.poll(() => element("trigger").getAttribute("aria-describedby")).toBe("note");
});

it("names an icon button with .label and keeps a name the button already has", async () => {
  const value = ref("Settings");
  provided(() => [
    button(() => value.value, { modifiers: { label: true }, text: "", attrs: { "data-test": "icon" } }),
    button(() => "Help", {
      modifiers: { label: true },
      text: "",
      attrs: { "data-test": "named", "aria-label": "Own" },
    }),
  ]);
  await expect.poll(() => element("icon").getAttribute("aria-label")).toBe("Settings");
  expect(element("named").getAttribute("aria-label")).toBe("Own");
  value.value = "Preferences";
  await expect.poll(() => element("icon").getAttribute("aria-label")).toBe("Preferences");
  move(element("icon"));
  await expect.poll(() => content()).not.toBeNull();
  expect(element("icon").hasAttribute("aria-describedby")).toBe(false);
  value.value = "";
  await expect.poll(() => element("icon").hasAttribute("aria-label")).toBe(false);
});

it("reaches a TooltipProvider in the same template", async () => {
  vi.useFakeTimers();
  render(() => h(TooltipProvider, { delay: 50 }, { default: withCtx(() => [button(() => "Save")]) }));
  await nextTick();
  move(element("trigger"));
  vi.advanceTimersByTime(49);
  await nextTick();
  await nextTick();
  expect(content()).toBeNull();
  vi.advanceTimersByTime(1);
  await nextTick();
  await nextTick();
  expect(content()).not.toBeNull();
});

it("reaches a TooltipProvider above a child component, and works on a component's root", async () => {
  const Child = defineComponent({ setup: () => () => button(() => "Save") });
  const Wrapped = defineComponent({ setup: () => () => h("button", { "data-test": "wrapped" }, "Help") });
  provided(() => [h(Child), withDirectives(h(Wrapped), [[vTooltip, "Help"]])], { delay: 50 });
  await nextTick();
  move(element("trigger"));
  await expect.poll(() => content(), { timeout: 400 }).not.toBeNull();
  leave(element("trigger"));
  await expect.poll(() => content()).toBeNull();
  move(element("wrapped"));
  await expect.poll(() => content()?.textContent, { timeout: 400 }).toContain("Help");
});

it("goes with its element", async () => {
  const shown = ref(true);
  provided(() => (shown.value ? button(() => "Save") : h("span")));
  await nextTick();
  move(element("trigger"));
  await expect.poll(() => content()).not.toBeNull();
  shown.value = false;
  await expect.poll(() => content()).toBeNull();
});

it("opens on a long press", async () => {
  provided(() => button(() => "Save"), { delay: 0, touchDelay: 0 });
  await nextTick();
  element("trigger").dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch", isPrimary: true, pointerId: 3, buttons: 1 }),
  );
  await expect.poll(() => content()?.dataset.touch).toBe("");
  element("trigger").dispatchEvent(
    new PointerEvent("pointerup", { bubbles: true, pointerType: "touch", pointerId: 3 }),
  );
});
