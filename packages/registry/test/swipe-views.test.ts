import { mount } from "@vue/test-utils";
import { TabsContent } from "reka-ui";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, ref } from "vue";

import { SwipeView, SwipeViews, SwipeViewsSwipeArea } from "@/ui/swipe-views";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const slot = (name: string) => document.querySelector<HTMLElement>(`[data-slot=${name}]`)!;
const views = () => [...document.querySelectorAll<HTMLElement>("[data-slot=swipe-view]")];

const setup = async (viewProps: Record<string, unknown> = {}, extra: () => VNode[] = () => []) => {
  const tab = ref<string | number>("a");
  mount(
    defineComponent({
      setup: () => () =>
        h(
          SwipeViews,
          {
            modelValue: tab.value,
            "onUpdate:modelValue": (value: string | number) => (tab.value = value),
            style: "width: 300px; height: 200px",
          },
          () => [
            ...["a", "b", "c"].map((value) => h(SwipeView, { key: value, value, ...viewProps }, () => value)),
            ...extra(),
          ],
        ),
    }),
    { attachTo: document.body },
  );
  await nextFrame();
  await nextFrame();
  return tab;
};

const left = (element: HTMLElement) =>
  element.getBoundingClientRect().left - slot("swipe-views").getBoundingClientRect().left;

it("marks the parts and lays the pages out in a row", async () => {
  await setup();
  expect(slot("swipe-views").dataset.orientation).toBe("horizontal");
  expect(views().map(left)).toEqual([0, 300, 600]);
  expect(getComputedStyle(slot("swipe-views")).transitionProperty).toContain("--swipe-snap-offset");
});

it("lets a page take the frame's offset mid-transition and keeps it from the page's content", async () => {
  const tab = await setup();
  tab.value = "c";
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 150));
  const live = getComputedStyle(slot("swipe-views")).getPropertyValue("--swipe-snap-offset");
  expect(parseFloat(live)).toBeLessThan(0);
  expect(parseFloat(live)).toBeGreaterThan(-600);
  expect(getComputedStyle(views()[1]!).getPropertyValue("--swipe-snap-offset")).toBe(live);
  const child = document.createElement("span");
  views()[1]!.append(child);
  expect(getComputedStyle(child).getPropertyValue("--swipe-snap-offset")).toBe("0px");
});

it("lets a class replace the page's width and translate", async () => {
  await setup({
    class:
      "absolute inset-y-0 start-0 w-[calc(100%-3rem)] translate-x-[calc(var(--swipe-snap-offset)+var(--swipe-view-start))]",
  });
  expect(views()[0]!.className).not.toContain("translate-x-(--swipe-snap-offset)");
  expect(views()[0]!.className).not.toContain("w-full");
  expect(left(views()[1]!)).toBe(252);
});

it("turns a strip's pointer events off where there is no page to go to", async () => {
  await setup({}, () => [h(SwipeViewsSwipeArea, { side: "start" }), h(SwipeViewsSwipeArea, { side: "end" })]);
  const [start, end] = document.querySelectorAll<HTMLElement>("[data-slot=swipe-views-swipe-area]");
  expect(getComputedStyle(start!).pointerEvents).toBe("none");
  expect(getComputedStyle(end!).pointerEvents).toBe("auto");
  expect(end!.getBoundingClientRect().width).toBe(20);
});

it("pairs with Tabs on one model through TabsContent as-child", async () => {
  const tab = ref<string | number>("a");
  const update = (value: string | number) => (tab.value = value);
  mount(
    defineComponent({
      setup: () => () =>
        h(Tabs, { modelValue: tab.value, "onUpdate:modelValue": update }, () => [
          h(TabsList, () => ["a", "b"].map((value) => h(TabsTrigger, { value }, () => value))),
          h(SwipeViews, { modelValue: tab.value, "onUpdate:modelValue": update, style: "width: 300px" }, () =>
            ["a", "b"].map((value) =>
              h(TabsContent, { key: value, value, forceMount: true, asChild: true }, () =>
                h(SwipeView, { value }, () => value),
              ),
            ),
          ),
        ]),
    }),
    { attachTo: document.body },
  );
  await nextFrame();
  await nextFrame();
  const panels = [...document.querySelectorAll<HTMLElement>("[role=tabpanel]")];
  expect(panels).toHaveLength(2);
  expect(panels[0]!.dataset.slot).toBe("swipe-view");
  expect(panels[1]!.hidden).toBe(false);
  expect(panels[1]!.inert).toBe(true);
  await userEvent.click(document.querySelectorAll<HTMLElement>("[role=tab]")[1]!);
  await nextTick();
  expect(slot("swipe-views").style.getPropertyValue("--swipe-snap-offset")).toBe("-300px");
});
