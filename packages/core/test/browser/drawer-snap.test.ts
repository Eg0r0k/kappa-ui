import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { type VNodeChild, defineComponent, h, nextTick, ref } from "vue";

import {
  DrawerContent,
  DrawerHandle,
  DrawerOverlay,
  DrawerRoot,
  type DrawerRootProps,
  DrawerSwipeArea,
} from "../../src/drawer";
import type { SnapPoint } from "../../src/snap";
import { drag, flick, pointer, wait } from "./pointer";

const PANEL = "position: fixed; left: 0; bottom: 0; width: 300px; height: 400px";
const BODY = "height: 200px; overflow: auto";
const AREA = "position: fixed; left: 0; bottom: 0; width: 300px; height: 20px";
const POINTS = ["100px", "200px", "400px"];

const sheet = document.createElement("style");
sheet.textContent = [
  "@keyframes drawer-snap-test-out { to { translate: 0 100% } }",
  "[role=dialog][data-state=closed], #overlay[data-state=closed] { animation: drawer-snap-test-out 150ms forwards }",
  "[role=dialog] { translate: 0 calc(var(--drawer-swipe-movement, 0px) + var(--drawer-snap-offset, 0px)); }",
].join(" ");
document.head.append(sheet);

const harness = (
  root: Partial<DrawerRootProps> = {},
  body: () => VNodeChild = () => h("p", { id: "text" }, "Body"),
  startOpen = true,
) => {
  const open = ref(startOpen);
  const active = ref<SnapPoint | null | undefined>(root.activeSnapPoint);
  const changes: (SnapPoint | null)[] = [];
  mount(
    defineComponent({
      setup: () => () =>
        h(
          DrawerRoot,
          {
            ...root,
            open: open.value,
            "onUpdate:open": (value: boolean) => (open.value = value),
            ...(active.value === undefined ? {} : { activeSnapPoint: active.value }),
            "onUpdate:activeSnapPoint": (value: SnapPoint | null) => {
              changes.push(value);
              if (active.value !== undefined) active.value = value;
            },
          },
          () => [
            h(DrawerOverlay, { id: "overlay" }),
            h(DrawerContent, { style: PANEL }, () => [
              h(DrawerHandle, { id: "handle" }),
              h("div", { id: "body", style: BODY }, body() ?? undefined),
            ]),
            h(DrawerSwipeArea, { id: "area", style: AREA }),
          ],
        ),
    }),
    { attachTo: document.body },
  );
  return { open, active, changes };
};

const settle = async () => {
  await nextTick();
  await nextTick();
};
const panel = () => document.querySelector<HTMLElement>("[role=dialog]")!;
const overlay = () => document.getElementById("overlay")!;
const body = () => document.getElementById("body")!;
const text = () => document.getElementById("text")!;
const handle = () => document.getElementById("handle")!;
const area = () => document.getElementById("area")!;
const variable = (name: string) => panel().style.getPropertyValue(name);
const opacity = () => parseFloat(overlay().style.getPropertyValue("--drawer-overlay-opacity"));

const creep = async (target: Element, from: number, to: number, step = 40, pause = 50) => {
  pointer("pointerdown", target, 150, from);
  const sign = Math.sign(to - from);
  for (let y = from + sign * step; sign > 0 ? y <= to : y >= to; y += sign * step) {
    await wait(pause);
    pointer("pointermove", target, 150, y);
  }
  await wait(10);
  pointer("pointerup", target, 150, to);
};

it("opens at the first point, hidden below the edge by the rest of its size", async () => {
  const { changes } = harness({ snapPoints: POINTS });
  await settle();
  expect(variable("--drawer-snap-offset")).toBe("300px");
  expect(variable("--drawer-swipe-movement")).toBe("0px");
  expect(panel().hasAttribute("data-expanded")).toBe(false);
  expect(opacity()).toBe(0);
  expect(changes).toEqual([]);
});

it("lands on the given point and is expanded at the largest", async () => {
  harness({ snapPoints: POINTS, activeSnapPoint: "400px" });
  await settle();
  expect(variable("--drawer-snap-offset")).toBe("0px");
  expect(panel().hasAttribute("data-expanded")).toBe(true);
  expect(opacity()).toBe(1);
});

it("reads a fraction as a share of the viewport", async () => {
  harness({ snapPoints: [0.25] });
  await settle();
  expect(parseFloat(variable("--drawer-snap-offset"))).toBeCloseTo(Math.max(0, 400 - window.innerHeight * 0.25), 0);
});

it("is expanded without snap points", async () => {
  harness();
  await settle();
  expect(panel().hasAttribute("data-expanded")).toBe(true);
  expect(variable("--drawer-snap-offset")).toBe("0px");
  expect(opacity()).toBe(1);
});

it("fades the overlay between the point below fadeFromIndex and the point at it", async () => {
  harness({ snapPoints: POINTS, activeSnapPoint: "200px" });
  await settle();
  expect(opacity()).toBe(0);
  pointer("pointerdown", text(), 150, 300);
  await wait(30);
  pointer("pointermove", text(), 150, 250);
  await wait(30);
  pointer("pointermove", text(), 150, 190);
  await wait(30);
  expect(opacity()).toBeCloseTo(0.5, 1);
  pointer("pointerup", text(), 150, 190);
  await settle();
  document.body.innerHTML = "";
  harness({ snapPoints: POINTS, fadeFromIndex: 0 });
  await settle();
  expect(opacity()).toBe(1);
});

it("keeps --drawer-swipe-progress at zero while dragging between snap points", async () => {
  harness({ snapPoints: ["400px"] });
  await settle();
  pointer("pointerdown", text(), 150, 100);
  await wait(30);
  pointer("pointermove", text(), 150, 200);
  await wait(30);
  expect(overlay().style.getPropertyValue("--drawer-swipe-progress")).toBe("0");
  pointer("pointerup", text(), 150, 200);
  await settle();
});

it("follows a controlled active point", async () => {
  const { active } = harness({ snapPoints: POINTS, activeSnapPoint: "100px" });
  await settle();
  active.value = "400px";
  await settle();
  expect(variable("--drawer-snap-offset")).toBe("0px");
  expect(panel().hasAttribute("data-expanded")).toBe(true);
});

it("returns to the first point after a close, holding the exit offset until then", async () => {
  const { open, changes } = harness({ snapPoints: POINTS, activeSnapPoint: "400px" });
  await settle();
  open.value = false;
  await settle();
  expect(changes.at(-1)).toBe("100px");
  expect(variable("--drawer-snap-offset")).toBe("0px");
  expect(opacity()).toBe(1);
  await expect.poll(() => document.querySelector("[role=dialog]")).toBeNull();
  open.value = true;
  await settle();
  expect(variable("--drawer-snap-offset")).toBe("300px");
});

it("settles a slow drag on the nearest point and reports it", async () => {
  const { changes } = harness({ snapPoints: POINTS });
  await settle();
  await drag(text(), [150, 300], [150, 130], 4, 120);
  await settle();
  expect(changes).toEqual(["200px"]);
  expect(variable("--drawer-snap-offset")).toBe("200px");
  expect(variable("--drawer-swipe-movement")).toBe("0px");
  expect(panel().hasAttribute("data-swiping")).toBe(false);
});

it("moves one point in the direction of a quick swipe", async () => {
  const { changes } = harness({ snapPoints: POINTS });
  await settle();
  await creep(text(), 300, 220);
  await settle();
  expect(changes.at(-1)).toBe("200px");
  await creep(text(), 100, 180);
  await settle();
  expect(changes.at(-1)).toBe("100px");
  expect(variable("--drawer-snap-offset")).toBe("300px");
});

it("flings to the last point, and closes from a fling towards the edge", async () => {
  const { open, changes } = harness({ snapPoints: POINTS });
  await settle();
  await flick(text(), [150, 300], [150, 100]);
  await settle();
  expect(changes.at(-1)).toBe("400px");
  expect(variable("--drawer-snap-offset")).toBe("0px");
  await flick(text(), [150, 100], [150, 300]);
  await settle();
  expect(open.value).toBe(false);
  expect(changes.at(-1)).toBe("100px");
});

it("keeps a fling to one step with snapToSequentialPoints", async () => {
  const { changes } = harness({ snapPoints: POINTS, snapToSequentialPoints: true });
  await settle();
  await flick(text(), [150, 300], [150, 100]);
  await settle();
  expect(changes.at(-1)).toBe("200px");
});

it("returns a non-dismissible drawer to the smallest point instead of closing", async () => {
  const { open, changes } = harness({ snapPoints: POINTS, dismissible: false });
  await settle();
  await drag(text(), [150, 50], [150, 350]);
  await settle();
  expect(open.value).toBe(true);
  await flick(text(), [150, 50], [150, 350]);
  await settle();
  expect(open.value).toBe(true);
  expect(changes).toEqual([]);
  expect(variable("--drawer-snap-offset")).toBe("300px");
  expect(variable("--drawer-swipe-movement")).toBe("0px");
});

it("closes from the smallest point once dragged past half of it", async () => {
  const { open } = harness({ snapPoints: POINTS });
  await settle();
  await drag(text(), [150, 100], [150, 170], 4, 120);
  await settle();
  expect(open.value).toBe(false);
});

it("cycles the points from a handle tap, wrapping to the first", async () => {
  const { open, changes } = harness({ snapPoints: POINTS });
  await settle();
  for (let i = 0; i < 3; i++) {
    handle().click();
    await settle();
  }
  expect(changes).toEqual(["200px", "400px", "100px"]);
  expect(open.value).toBe(true);
});

it("drags from a scrolled body below the largest point and scrolls it only there", async () => {
  const tall = () => h("div", { style: "height: 1000px" }, h("p", { id: "text" }, "Body"));
  const low = harness({ snapPoints: POINTS }, tall);
  await settle();
  body().scrollTop = 100;
  await drag(text(), [150, 100], [150, 300]);
  await settle();
  expect(low.open.value).toBe(false);
  document.body.innerHTML = "";

  const high = harness({ snapPoints: POINTS, activeSnapPoint: "400px" }, tall);
  await settle();
  body().scrollTop = 100;
  await drag(text(), [150, 100], [150, 300]);
  await settle();
  expect(high.open.value).toBe(true);
  expect(high.changes).toEqual([]);
});

it("opens from the swipe area at the active point", async () => {
  const { open } = harness({ snapPoints: POINTS }, undefined, false);
  await settle();
  pointer("pointerdown", area(), 150, 395);
  await wait(30);
  pointer("pointermove", area(), 150, 380);
  await wait(30);
  expect(open.value).toBe(true);
  await settle();
  pointer("pointermove", area(), 150, 300);
  await wait(30);
  expect(parseFloat(variable("--drawer-swipe-movement"))).toBeCloseTo(15, 0);
  pointer("pointerup", area(), 150, 300);
  await settle();
  expect(open.value).toBe(true);
  expect(variable("--drawer-swipe-movement")).toBe("0px");
  expect(variable("--drawer-snap-offset")).toBe("300px");
});

it("lets a drag move the panel above the active point only up to the largest one", async () => {
  harness({ snapPoints: POINTS, activeSnapPoint: "200px" });
  await settle();
  pointer("pointerdown", text(), 150, 390);
  await wait(30);
  pointer("pointermove", text(), 150, 300);
  await wait(30);
  pointer("pointermove", text(), 150, 100);
  await wait(30);
  expect(parseFloat(variable("--drawer-swipe-movement"))).toBeGreaterThan(-260);
  expect(parseFloat(variable("--drawer-swipe-movement"))).toBeLessThanOrEqual(-200);
  pointer("pointerup", text(), 150, 100);
  await settle();
});
