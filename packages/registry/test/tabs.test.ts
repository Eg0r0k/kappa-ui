import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h } from "vue";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

const settle = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
});

const renderTabs = (
  root: Record<string, unknown> = {},
  list: Record<string, unknown> = {},
  panelOneContent: unknown = h("p", { "data-test": "panel-one" }, "Panel one"),
) => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Tabs, { defaultValue: "one", ...root }, () => [
          h(TabsList, list, () => [
            h(TabsTrigger, { value: "one" }, () => "One"),
            h(TabsTrigger, { value: "two" }, () => "Second tab"),
            h(TabsTrigger, { value: "three", disabled: true }, () => "Three"),
          ]),
          h(TabsContent, { value: "one" }, () => panelOneContent),
          h(TabsContent, { value: "two" }, () => h("p", { "data-test": "panel-two" }, "Panel two")),
        ]),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  return wrapper;
};

const list = () => document.querySelector<HTMLElement>("[data-slot=tabs-list]")!;
const triggers = () => [...document.querySelectorAll<HTMLElement>("[data-slot=tabs-trigger]")];
const indicator = () => document.querySelector<HTMLElement>("[data-slot=tabs-indicator]")!;
const panel = (name: string) => document.querySelector<HTMLElement>(`[data-test=panel-${name}]`);
const near = (a: number, b: number) => Math.abs(a - b) < 0.5;

it("switches panels by click and by arrow keys, skipping disabled triggers and wrapping", async () => {
  renderTabs();
  expect(panel("one")).not.toBeNull();
  expect(panel("two")).toBeNull();

  await userEvent.click(triggers()[1]!);
  expect(panel("two")).not.toBeNull();
  expect(panel("one")).toBeNull();

  await userEvent.keyboard("{ArrowRight}");
  expect(triggers()[0]!.getAttribute("data-state")).toBe("active");
  expect(document.activeElement).toBe(triggers()[0]);
});

it("keeps inactive panels mounted but hidden when unmount-on-hide is off", () => {
  renderTabs({ unmountOnHide: false });
  const inactive = panel("two")!;
  expect(inactive).not.toBeNull();
  expect(inactive.closest("[data-slot=tabs-content]")!.hasAttribute("hidden")).toBe(true);
});

it("slides the indicator under the active trigger", async () => {
  renderTabs();
  await settle();
  const first = triggers()[0]!.getBoundingClientRect();
  let bar = indicator().getBoundingClientRect();
  expect(near(bar.left, first.left) && near(bar.width, first.width)).toBe(true);

  await userEvent.click(triggers()[1]!);
  await settle();
  const second = triggers()[1]!.getBoundingClientRect();
  bar = indicator().getBoundingClientRect();
  expect(near(bar.left, second.left) && near(bar.width, second.width)).toBe(true);
});

it("moves the indicator along the vertical axis when vertical", async () => {
  renderTabs({ orientation: "vertical" });
  await settle();
  expect(list().getAttribute("aria-orientation")).toBe("vertical");

  await userEvent.click(triggers()[1]!);
  await settle();
  const second = triggers()[1]!.getBoundingClientRect();
  const bar = indicator().getBoundingClientRect();
  expect(near(bar.top, second.top) && near(bar.height, second.height)).toBe(true);
});

it("sizes triggers from the list and defaults to a medium pill", () => {
  renderTabs();
  expect(list().dataset.variant).toBe("pill");
  expect(list().dataset.size).toBe("md");
  unmount?.();

  for (const [size, height] of [
    ["xs", 28],
    ["md", 36],
    ["xl", 48],
  ] as const) {
    renderTabs({}, { size });
    expect(triggers()[0]!.offsetHeight, size).toBe(height);
    unmount?.();
    unmount = undefined;
  }
});

it("keeps vertical triggers at their size beside a tall panel", () => {
  renderTabs({ orientation: "vertical" }, {}, h("div", { style: "height: 300px" }));
  expect(triggers()[0]!.offsetHeight).toBe(36);
  expect(list().getBoundingClientRect().height).toBeLessThan(300);
});

it("keeps the triggers' stacking context inside the list", () => {
  renderTabs();
  expect(getComputedStyle(list()).isolation).toBe("isolate");
});

it("draws a line along the list's edge for the line variant", async () => {
  renderTabs({}, { variant: "line" });
  await settle();
  const bar = indicator().getBoundingClientRect();
  expect(list().dataset.variant).toBe("line");
  expect(bar.height).toBe(2);
  expect(near(bar.bottom, list().getBoundingClientRect().bottom)).toBe(true);
});

it("draws the line indicator in the list's color, primary by default", async () => {
  renderTabs({}, { variant: "line", style: "--primary: rgb(0, 0, 255); --success: rgb(0, 128, 0)" });
  await settle();
  expect(list().dataset.color).toBe("primary");
  expect(getComputedStyle(indicator()).backgroundColor).toBe("rgb(0, 0, 255)");
  unmount?.();

  renderTabs({}, { variant: "line", color: "success", style: "--success: rgb(0, 128, 0)" });
  await settle();
  expect(list().dataset.color).toBe("success");
  expect(getComputedStyle(indicator()).backgroundColor).toBe("rgb(0, 128, 0)");
  unmount?.();

  const style = document.createElement("style");
  style.textContent = '[data-slot][data-color="brand"] { --tone: rgb(255, 0, 200); }';
  document.head.append(style);
  try {
    renderTabs({}, { variant: "line", color: "brand" });
    await settle();
    expect(getComputedStyle(indicator()).backgroundColor).toBe("rgb(255, 0, 200)");
  } finally {
    style.remove();
  }
});

it("keeps the pill thumb concentric with its track", async () => {
  for (const size of ["xs", "md", "xl"] as const) {
    renderTabs({}, { size });
    await settle();
    const trackRadius = Number.parseFloat(getComputedStyle(list()).borderTopLeftRadius);
    const thumbRadius = Number.parseFloat(getComputedStyle(indicator()).borderTopLeftRadius);
    const triggerRadius = Number.parseFloat(getComputedStyle(triggers()[0]!).borderTopLeftRadius);
    expect(Math.abs(thumbRadius - (trackRadius - 4)), size).toBeLessThan(0.1);
    expect(Math.abs(triggerRadius - thumbRadius), size).toBeLessThan(0.1);
    unmount?.();
    unmount = undefined;
  }
});

it("squares the pill when --radius is zero", async () => {
  document.documentElement.style.setProperty("--radius", "0px");
  try {
    renderTabs();
    await settle();
    expect(getComputedStyle(list()).borderTopLeftRadius).toBe("0px");
    expect(getComputedStyle(indicator()).borderTopLeftRadius).toBe("0px");
    expect(getComputedStyle(triggers()[0]!).borderTopLeftRadius).toBe("0px");
  } finally {
    document.documentElement.style.removeProperty("--radius");
  }
});

it("lifts the pill indicator with a shadow and no border, and the line indicator with neither", async () => {
  renderTabs();
  await settle();
  expect(getComputedStyle(indicator()).borderTopWidth).toBe("0px");
  expect(getComputedStyle(indicator()).boxShadow).not.toBe("none");
  unmount?.();

  renderTabs({}, { variant: "line" });
  await settle();
  expect(getComputedStyle(indicator()).borderTopWidth).toBe("0px");
  expect(getComputedStyle(indicator()).boxShadow).toBe("none");
});

it("slides the indicator under the active trigger in right-to-left", async () => {
  renderTabs({ dir: "rtl" });
  await settle();
  const first = triggers()[0]!.getBoundingClientRect();
  let bar = indicator().getBoundingClientRect();
  expect(near(bar.left, first.left) && near(bar.width, first.width)).toBe(true);

  await userEvent.click(triggers()[1]!);
  await settle();
  const second = triggers()[1]!.getBoundingClientRect();
  bar = indicator().getBoundingClientRect();
  expect(near(bar.left, second.left) && near(bar.width, second.width)).toBe(true);
});

describe("Tabs control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("%s triggers read the height, padding, icon and gap tokens", (size) => {
    renderTabs({}, { size });
    const trigger = triggers()[0]!;

    expect(trigger.offsetHeight).toBe(sentinel.height[size]);
    expect(px(getComputedStyle(trigger).paddingInlineStart)).toBe(sentinel.padding[size]);
    expect(px(getComputedStyle(trigger).getPropertyValue("--tabs-icon"))).toBe(sentinel.icon[size]);
    expect(px(getComputedStyle(trigger).columnGap)).toBe(sentinel.gap[size]);
  });
});
