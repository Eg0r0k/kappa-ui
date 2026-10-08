import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { type Ref, defineComponent, h, nextTick, ref } from "vue";

import {
  SwipeView,
  SwipeViewsRoot,
  type SwipeViewsSide,
  SwipeViewsSwipeArea,
  type SwipeViewsValue,
} from "../../src/swipe-views";
import { drag, pointer, wait } from "./pointer";

const css = document.createElement("style");
css.textContent = `
@property --swipe-snap-offset { syntax: "<length>"; inherits: false; initial-value: 0px; }
@property --swipe-snap-position { syntax: "<number>"; inherits: false; initial-value: 0; }
.root { position: fixed; left: 0; top: 0; display: flex; width: 300px; height: 200px; overflow: clip;
  transition: --swipe-snap-offset var(--swipe-snap-duration, 300ms) linear,
    --swipe-snap-position var(--swipe-snap-duration, 300ms) linear; }
.root[data-dragging] { transition: none; }
.view { flex-shrink: 0; width: 300px; --swipe-snap-offset: inherit; translate: var(--swipe-snap-offset) 0; }
.strip { position: absolute; inset-block: 0; inset-inline-start: 0; width: 20px; }
`;
document.head.append(css);

interface HostOptions {
  tab?: Ref<SwipeViewsValue | undefined>;
  pages?: Ref<SwipeViewsValue[]>;
  widths?: number[];
  root?: Record<string, unknown>;
  area?: SwipeViewsSide;
  wrap?: boolean;
}

const host = async ({
  tab = ref("a"),
  pages = ref(["a", "b", "c"]),
  widths,
  root = {},
  area,
  wrap,
}: HostOptions = {}) => {
  mount(
    defineComponent({
      setup: () => () =>
        h(
          SwipeViewsRoot,
          {
            class: "root",
            modelValue: tab.value,
            "onUpdate:modelValue": (value: SwipeViewsValue) => (tab.value = value),
            ...root,
          },
          () => [
            ...pages.value.map((value, index) => {
              const view = h(
                SwipeView,
                { key: value, value, class: "view", style: widths ? `width: ${widths[index]}px` : undefined },
                () => String(value),
              );
              return wrap ? h("div", { key: value }, view) : view;
            }),
            area ? h(SwipeViewsSwipeArea, { side: area, class: "strip" }) : null,
          ],
        ),
    }),
    { attachTo: document.body },
  );
  await wait(50);
  return { tab, pages };
};

const root = () => document.querySelector<HTMLElement>(".root")!;
const view = (value: string) =>
  [...document.querySelectorAll<HTMLElement>(".view")].find((node) => node.textContent === value)!;
const offset = () => root().style.getPropertyValue("--swipe-snap-offset");

it("pages to the next view on a drag and emits its value", async () => {
  const { tab } = await host();
  await drag(root(), [250, 50], [50, 50], 4, 80);
  expect(tab.value).toBe("b");
  expect(view("b").dataset.state).toBe("active");
  expect(view("a").dataset.state).toBe("inactive");
});

it("moves to a value set from outside and keeps the others inert once settled", async () => {
  const { tab } = await host();
  tab.value = "c";
  await nextTick();
  expect(offset()).toBe("-600px");
  expect(view("a").inert).toBe(false);
  await wait(400);
  expect(view("a").inert).toBe(true);
  expect(view("b").inert).toBe(true);
  expect(view("c").inert).toBe(false);
});

it("warns about an unknown value, shows the first view and emits nothing", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const { tab } = await host({ tab: ref("zzz") });
  expect(warn).toHaveBeenCalledWith(expect.stringContaining("zzz"));
  expect(offset()).toBe("0px");
  expect(tab.value).toBe("zzz");
});

it("moves to the view now in its place when the active one is removed", async () => {
  const { tab, pages } = await host({ tab: ref("b") });
  pages.value = ["a", "c"];
  await nextTick();
  await nextTick();
  expect(tab.value).toBe("c");
  expect(offset()).toBe("-300px");
});

it("keeps the value and jumps when a view is inserted before the active one", async () => {
  const { tab, pages } = await host({ tab: ref("b") });
  pages.value = ["x", "a", "b", "c"];
  await nextTick();
  await nextTick();
  expect(tab.value).toBe("b");
  expect(offset()).toBe("-600px");
  expect(root().getAnimations()).toHaveLength(0);
});

it("aligns a last view narrower than the frame to the end", async () => {
  await host({ tab: ref("c"), widths: [300, 300, 240] });
  expect(offset()).toBe("-540px");
});

it("writes each view's index and start, mirrored in right-to-left", async () => {
  await host();
  expect(view("b").style.getPropertyValue("--swipe-view-index")).toBe("1");
  expect(view("b").style.getPropertyValue("--swipe-view-start")).toBe("300px");
  document.body.innerHTML = "";
  await host({ root: { dir: "rtl" } });
  expect(view("b").style.getPropertyValue("--swipe-view-start")).toBe("-300px");
});

it("lets a view take the root's live offset mid-transition", async () => {
  const { tab } = await host();
  tab.value = "c";
  await nextTick();
  await wait(150);
  const live = getComputedStyle(root()).getPropertyValue("--swipe-snap-offset");
  expect(parseFloat(live)).toBeLessThan(0);
  expect(parseFloat(live)).toBeGreaterThan(-600);
  expect(getComputedStyle(view("b")).getPropertyValue("--swipe-snap-offset")).toBe(live);
});

it("turns a start strip off on the first view and pages back from it on the second", async () => {
  const { tab } = await host({ area: "start" });
  const strip = document.querySelector<HTMLElement>(".strip")!;
  expect(strip.dataset.disabled).toBe("");
  expect(strip.getAttribute("aria-hidden")).toBe("true");
  tab.value = "b";
  await nextTick();
  await wait(400);
  expect(strip.hasAttribute("data-disabled")).toBe(false);
  await drag(strip, [10, 50], [250, 50], 4, 80);
  expect(tab.value).toBe("a");
});

it("starts only from a strip under swipeAreaOnly", async () => {
  const { tab } = await host({ tab: ref("b"), root: { swipeAreaOnly: true }, area: "start" });
  await drag(view("b"), [250, 50], [50, 50], 4, 80);
  expect(tab.value).toBe("b");
  await drag(document.querySelector(".strip")!, [10, 50], [250, 50], 4, 80);
  expect(tab.value).toBe("a");
});

it("stops at the first view without the rubber band", async () => {
  await host({ root: { rubberband: false } });
  pointer("pointerdown", root(), 50, 50);
  for (const x of [70, 120, 170, 250]) {
    await wait(40);
    pointer("pointermove", root(), x, 50);
  }
  expect(offset()).toBe("0px");
  await wait(80);
  pointer("pointerup", root(), 250, 50);
});

it("warns when a view is not a direct child of the root", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  await host({ wrap: true });
  expect(warn).toHaveBeenCalledWith(expect.stringContaining("direct child"));
});
