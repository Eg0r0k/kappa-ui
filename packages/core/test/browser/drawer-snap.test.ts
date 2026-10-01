import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
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
import { pointer, wait } from "./pointer";

const PANEL = "position: fixed; left: 0; bottom: 0; width: 300px; height: 400px";
const BODY = "height: 200px; overflow: auto";
const AREA = "position: fixed; left: 0; bottom: 0; width: 300px; height: 20px";
const POINTS = ["100px", "200px", "400px"];

const sheet = document.createElement("style");
sheet.textContent = [
  "@keyframes drawer-snap-test-out { to { translate: 0 100% } }",
  "[role=dialog][data-state=closed], #overlay[data-state=closed] { animation: drawer-snap-test-out 150ms forwards }",
].join(" ");
document.head.append(sheet);

afterEach(() => {
  document.body.innerHTML = "";
});

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
const text = () => document.getElementById("text")!;
const variable = (name: string) => panel().style.getPropertyValue(name);
const opacity = () => parseFloat(overlay().style.getPropertyValue("--drawer-overlay-opacity"));

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
  expect(opacity()).toBeGreaterThan(0);
  expect(opacity()).toBeLessThan(1);
  pointer("pointerup", text(), 150, 190);
  await settle();
  document.body.innerHTML = "";
  harness({ snapPoints: POINTS, fadeFromIndex: 0 });
  await settle();
  expect(opacity()).toBe(1);
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
  await wait(250);
  open.value = true;
  await settle();
  expect(variable("--drawer-snap-offset")).toBe("300px");
});
