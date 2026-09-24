import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h } from "vue";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

const settle = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
});

const renderTabs = (root: Record<string, unknown> = {}, list: Record<string, unknown> = {}) => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Tabs, { defaultValue: "one", ...root }, () => [
          h(TabsList, list, () => [
            h(TabsTrigger, { value: "one" }, () => "One"),
            h(TabsTrigger, { value: "two" }, () => "Second tab"),
            h(TabsTrigger, { value: "three", disabled: true }, () => "Three"),
          ]),
          h(TabsContent, { value: "one" }, () => h("p", { "data-test": "panel-one" }, "Panel one")),
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

it("sizes triggers from the list and defaults to a medium pill", async () => {
  renderTabs();
  expect(list().dataset.variant).toBe("pill");
  expect(list().dataset.size).toBe("md");
  unmount?.();

  for (const [size, height] of [["xs", 28], ["md", 36], ["xl", 48]] as const) {
    renderTabs({}, { size });
    expect(triggers()[0]!.offsetHeight, size).toBe(height);
    unmount?.();
    unmount = undefined;
  }
});

it("draws a line along the list's edge for the line variant", async () => {
  renderTabs({}, { variant: "line" });
  await settle();
  const bar = indicator().getBoundingClientRect();
  expect(list().dataset.variant).toBe("line");
  expect(bar.height).toBe(2);
  expect(near(bar.bottom, list().getBoundingClientRect().bottom)).toBe(true);
});
