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
import { drag, flick, pointer, wait } from "./pointer";

const PANEL = "position: fixed; left: 0; bottom: 0; width: 300px; height: 400px";
const BODY = "height: 200px; overflow: auto";

const sheet = document.createElement("style");
sheet.textContent = [
  "@keyframes drawer-test-out { to { translate: 0 100% } }",
  "[role=dialog][data-state=closed] { animation: drawer-test-out 150ms forwards }",
  "@keyframes drawer-test-in { from { translate: 0 100% } }",
  ".drawer-test-enter [role=dialog][data-state=open] { animation: drawer-test-in 300ms linear }",
].join(" ");
document.head.append(sheet);

afterEach(() => {
  document.body.innerHTML = "";
  document.body.style.cssText = "";
  document.documentElement.classList.remove("drawer-test-enter");
  window.scrollTo(0, 0);
});

const harness = (
  root: Partial<DrawerRootProps> = {},
  body: () => VNodeChild = () => h("p", "Body"),
  startOpen = true,
) => {
  const open = ref(startOpen);
  mount(
    defineComponent({
      setup: () => () =>
        h(DrawerRoot, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value), ...root }, () => [
          h(DrawerOverlay, { id: "overlay" }),
          h(DrawerContent, { style: PANEL }, () => [
            h(DrawerHandle, { id: "handle" }),
            h("div", { id: "body", style: BODY }, body() ?? undefined),
          ]),
          h(DrawerSwipeArea, { id: "area", style: "position: fixed; left: 0; bottom: 0; width: 300px; height: 20px" }),
        ]),
    }),
    { attachTo: document.body },
  );
  return open;
};

const settle = async () => {
  await nextTick();
  await nextTick();
};
const panel = () => document.querySelector<HTMLElement>("[role=dialog]")!;
const body = () => document.getElementById("body")!;
const handle = () => document.getElementById("handle")!;
const variable = (name: string) => panel().style.getPropertyValue(name);

it("closes after a drag past a quarter of its height, writing the variables on the way", async () => {
  const open = harness();
  await settle();
  expect(variable("--drawer-size")).toBe("400px");
  pointer("pointerdown", body(), 150, 100);
  await wait(30);
  pointer("pointermove", body(), 150, 164);
  await wait(30);
  expect(panel().hasAttribute("data-swiping")).toBe(true);
  expect(parseFloat(variable("--drawer-swipe-movement"))).toBeCloseTo(60, 0);
  expect(parseFloat(variable("--drawer-swipe-progress"))).toBeCloseTo(0.15, 2);
  pointer("pointermove", body(), 150, 254);
  await wait(30);
  pointer("pointerup", body(), 150, 254);
  await settle();
  expect(open.value).toBe(false);
  expect(panel().hasAttribute("data-swiping")).toBe(false);
  expect(parseFloat(variable("--drawer-swipe-movement"))).toBeCloseTo(150, 0);
});

it("returns after a short drag", async () => {
  const open = harness();
  await settle();
  await drag(body(), [150, 100], [150, 150]);
  await settle();
  expect(open.value).toBe(true);
  expect(variable("--drawer-swipe-movement")).toBe("0px");
  expect(panel().hasAttribute("data-swiping")).toBe(false);
});

it("closes on a flick", async () => {
  const open = harness();
  await settle();
  await flick(body(), [150, 50], [150, 250]);
  await settle();
  expect(open.value).toBe(false);
});

it("lets a scrolled body scroll and drags from its top", async () => {
  const open = harness({}, () => h("div", { style: "height: 1000px" }));
  await settle();
  body().scrollTop = 100;
  await drag(body(), [150, 100], [150, 300]);
  await settle();
  expect(open.value).toBe(true);
  body().scrollTop = 0;
  await drag(body(), [150, 100], [150, 300]);
  await settle();
  expect(open.value).toBe(false);
});

it("lets a body at its top scroll toward its end and drags upward only from its end", async () => {
  const open = harness({}, () => h("div", { style: "height: 1000px" }));
  await settle();
  const upward = async () => {
    let swiping = false;
    pointer("pointerdown", body(), 150, 300);
    for (const y of [250, 200, 150, 100]) {
      await wait(40);
      pointer("pointermove", body(), 150, y);
      await settle();
      swiping ||= panel().hasAttribute("data-swiping");
    }
    await wait(40);
    pointer("pointerup", body(), 150, 100);
    await settle();
    return swiping;
  };
  expect(await upward()).toBe(false);
  expect(open.value).toBe(true);
  body().scrollTop = body().scrollHeight;
  expect(await upward()).toBe(true);
  expect(open.value).toBe(true);
  expect(variable("--drawer-swipe-movement")).toBe("0px");
});

it("drags from the handle even over scrolled content", async () => {
  const open = harness({}, () => h("div", { style: "height: 1000px" }));
  await settle();
  body().scrollTop = 100;
  await drag(handle(), [150, 10], [150, 210]);
  await settle();
  expect(open.value).toBe(false);
});

it("with handleOnly drags from the handle alone, and a handle tap closes", async () => {
  const open = harness({ handleOnly: true });
  await settle();
  await drag(body(), [150, 100], [150, 300]);
  await settle();
  expect(open.value).toBe(true);
  await drag(handle(), [150, 10], [150, 210]);
  await settle();
  expect(open.value).toBe(false);

  open.value = true;
  await settle();
  await wait(0);
  handle().click();
  await settle();
  expect(open.value).toBe(false);
});

it("keeps a non-dismissible drawer open after a long drag and a handle tap", async () => {
  const open = harness({ dismissible: false });
  await settle();
  await drag(body(), [150, 50], [150, 350]);
  await settle();
  expect(open.value).toBe(true);
  expect(variable("--drawer-swipe-movement")).toBe("0px");
  handle().click();
  await settle();
  expect(open.value).toBe(true);
});

it("drags with a mouse only from the handle or a data-drawer-drag zone", async () => {
  const open = harness({}, () => [
    h("header", { id: "head", "data-drawer-drag": "" }, "Title"),
    h("p", { id: "text" }, "Text"),
  ]);
  await settle();
  const mouseDrag = async (target: Element) => {
    pointer("pointerdown", target, 150, 50, "mouse");
    await wait(30);
    pointer("pointermove", target, 150, 150, "mouse");
    await wait(30);
    pointer("pointermove", target, 150, 250, "mouse");
    await wait(30);
    pointer("pointerup", target, 150, 250, "mouse");
    await settle();
  };
  await mouseDrag(document.getElementById("text")!);
  expect(open.value).toBe(true);
  await mouseDrag(document.getElementById("head")!);
  expect(open.value).toBe(false);
});

it("ignores a drag that starts inside data-no-drag", async () => {
  const open = harness({}, () => h("div", { id: "map", "data-no-drag": "", style: "height: 150px" }));
  await settle();
  await drag(document.getElementById("map")!, [150, 50], [150, 350]);
  await settle();
  expect(open.value).toBe(true);
});

it("writes no style on body and keeps the page scroll position", async () => {
  document.body.style.height = "3000px";
  window.scrollTo(0, 500);
  const open = harness();
  await settle();
  expect(window.scrollY).toBe(500);
  expect(document.body.style.background).toBe("");
  open.value = false;
  await settle();
  await wait(250);
  expect(window.scrollY).toBe(500);
  expect(document.body.style.background).toBe("");
});

it("starts the next opening from zero", async () => {
  const open = harness();
  await settle();
  await drag(body(), [150, 50], [150, 350]);
  await settle();
  expect(open.value).toBe(false);
  await wait(250);
  open.value = true;
  await settle();
  expect(variable("--drawer-swipe-movement")).toBe("0px");
  expect(panel().hasAttribute("data-swiping")).toBe(false);
});

it("picks a drag up where the enter animation left the panel and lets it be pulled open", async () => {
  document.documentElement.classList.add("drawer-test-enter");
  const open = harness();
  await settle();
  await wait(60);
  pointer("pointerdown", handle(), 150, 300);
  await wait(30);
  pointer("pointermove", handle(), 150, 270);
  await wait(30);
  expect(panel().hasAttribute("data-swiping")).toBe(true);
  const seeded = parseFloat(variable("--drawer-swipe-movement"));
  expect(seeded).toBeGreaterThan(100);
  pointer("pointermove", handle(), 150, 240);
  await wait(30);
  expect(seeded - parseFloat(variable("--drawer-swipe-movement"))).toBeCloseTo(30, 0);
  pointer("pointerup", handle(), 150, 240);
  await settle();
  expect(open.value).toBe(true);
  expect(variable("--drawer-swipe-movement")).toBe("0px");
});

it("renders no overlay and keeps gestures in a non-modal drawer", async () => {
  const open = harness({ modal: false });
  await settle();
  expect(document.getElementById("overlay")).toBeNull();
  await drag(body(), [150, 50], [150, 350]);
  await settle();
  expect(open.value).toBe(false);
});
