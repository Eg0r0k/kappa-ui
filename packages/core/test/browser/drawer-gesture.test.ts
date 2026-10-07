import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { type VNodeChild, defineComponent, h, nextTick, ref, watch } from "vue";

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
  document.documentElement.classList.remove("drawer-test-enter");
  window.scrollTo(0, 0);
});

const harness = (
  root: Partial<DrawerRootProps> = {},
  body: () => VNodeChild = () => h("p", "Body"),
  startOpen = true,
  panelStyle = PANEL,
) => {
  const open = ref(startOpen);
  mount(
    defineComponent({
      setup: () => () =>
        h(DrawerRoot, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value), ...root }, () => [
          h(DrawerOverlay, { id: "overlay" }),
          h(DrawerContent, { style: panelStyle }, () => [
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
const area = () => document.getElementById("area")!;
const variable = (name: string) => panel().style.getPropertyValue(name);
const gone = () => expect.poll(() => document.querySelector("[role=dialog]")).toBeNull();

it("closes after a drag past half of its height, writing the variables on the way", async () => {
  const open = harness();
  await settle();
  expect(variable("--drawer-size")).toBe("400px");
  pointer("pointerdown", body(), 150, 100);
  await wait(30);
  pointer("pointermove", body(), 150, 170);
  await wait(30);
  expect(panel().hasAttribute("data-swiping")).toBe(true);
  expect(parseFloat(variable("--drawer-swipe-movement"))).toBeCloseTo(60, 0);
  expect(parseFloat(variable("--drawer-swipe-progress"))).toBeCloseTo(0.15, 2);
  pointer("pointermove", body(), 150, 320);
  await wait(260);
  pointer("pointerup", body(), 150, 320);
  await settle();
  expect(open.value).toBe(false);
  expect(panel().hasAttribute("data-swiping")).toBe(false);
  expect(parseFloat(variable("--drawer-swipe-movement"))).toBeCloseTo(210, 0);
});

it("returns after a slow drag short of half of its height", async () => {
  const open = harness();
  await settle();
  await drag(body(), [150, 100], [150, 260], 4, 120);
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

it("drags with a mouse from the body, but not while text is selected", async () => {
  const open = harness({}, () => h("p", { id: "text" }, "Selectable text"));
  await settle();
  const text = document.getElementById("text")!;
  const mouseDrag = async () => {
    pointer("pointerdown", text, 150, 50, "mouse");
    await wait(30);
    pointer("pointermove", text, 150, 150, "mouse");
    await wait(30);
    pointer("pointermove", text, 150, 250, "mouse");
    await wait(30);
    pointer("pointerup", text, 150, 250, "mouse");
    await settle();
  };
  const range = document.createRange();
  range.selectNodeContents(text);
  getSelection()!.addRange(range);
  await mouseDrag();
  expect(open.value).toBe(true);
  getSelection()!.removeAllRanges();
  await mouseDrag();
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
  await gone();
  expect(window.scrollY).toBe(500);
  expect(document.body.style.background).toBe("");
});

it("starts the next opening from zero", async () => {
  const open = harness();
  await settle();
  await drag(body(), [150, 50], [150, 350]);
  await settle();
  expect(open.value).toBe(false);
  await gone();
  open.value = true;
  await settle();
  expect(variable("--drawer-swipe-movement")).toBe("0px");
  expect(panel().hasAttribute("data-swiping")).toBe(false);
});

it("drops a drag that a close interrupts and starts the next opening clean", async () => {
  const open = harness();
  await settle();
  pointer("pointerdown", body(), 150, 100);
  await wait(30);
  pointer("pointermove", body(), 150, 160);
  await wait(30);
  expect(panel().hasAttribute("data-swiping")).toBe(true);
  open.value = false;
  await settle();
  expect(panel().hasAttribute("data-swiping")).toBe(false);
  await gone();
  open.value = true;
  await settle();
  expect(variable("--drawer-swipe-movement")).toBe("0px");
  expect(panel().hasAttribute("data-swiping")).toBe(false);
});

it("picks a drag up where the enter animation left the panel and lets it be pulled open", async () => {
  document.documentElement.classList.add("drawer-test-enter");
  const open = harness();
  await settle();
  const [enter] = panel().getAnimations();
  enter!.pause();
  enter!.currentTime = 60;
  pointer("pointerdown", handle(), 150, 300);
  await wait(30);
  pointer("pointermove", handle(), 150, 270);
  await wait(30);
  expect(panel().hasAttribute("data-swiping")).toBe(true);
  const seeded = parseFloat(variable("--drawer-swipe-movement"));
  expect(seeded).toBeCloseTo(300, 0);
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

it("stays closed after a sideways mouse drag on the swipe area", async () => {
  const open = harness({}, undefined, false);
  await settle();
  pointer("pointerdown", area(), 150, 395, "mouse");
  await wait(30);
  pointer("pointermove", area(), 210, 392, "mouse");
  await wait(30);
  pointer("pointermove", area(), 270, 388, "mouse");
  await wait(30);
  pointer("pointerup", area(), 270, 388, "mouse");
  await settle();
  expect(open.value).toBe(false);
  expect(document.querySelector("[role=dialog]")).toBeNull();
});

it("leaves --drawer-swipe-progress above zero while dragging without snap points", async () => {
  const open = harness();
  await settle();
  pointer("pointerdown", body(), 150, 100);
  await wait(30);
  pointer("pointermove", body(), 150, 160);
  await wait(30);
  const overlay = document.getElementById("overlay")!;
  expect(parseFloat(overlay.style.getPropertyValue("--drawer-swipe-progress"))).toBeGreaterThan(0);
  pointer("pointerup", body(), 150, 160);
  await settle();
  expect(open.value).toBe(true);
});

it("opens from the swipe area following the finger and stays open after a long swipe", async () => {
  const open = harness({}, () => h("p", "Body"), false);
  await settle();
  expect(panel()).toBeNull();
  pointer("pointerdown", area(), 150, 395);
  await wait(30);
  pointer("pointermove", area(), 150, 380);
  await wait(30);
  expect(open.value).toBe(true);
  await settle();
  expect(panel().hasAttribute("data-swiping")).toBe(true);
  pointer("pointermove", area(), 150, 190);
  await wait(30);
  expect(parseFloat(variable("--drawer-swipe-movement"))).toBeCloseTo(400 - 195, 0);
  pointer("pointerup", area(), 150, 190);
  await settle();
  expect(open.value).toBe(true);
  expect(variable("--drawer-swipe-movement")).toBe("0px");
  expect(document.getElementById("area")).not.toBeNull();
});

it("closes again when the swipe from the edge is released early after a slow pull", async () => {
  const open = harness({}, () => h("p", "Body"), false);
  await settle();
  pointer("pointerdown", area(), 150, 395);
  await wait(60);
  pointer("pointermove", area(), 150, 380);
  await wait(60);
  expect(open.value).toBe(true);
  pointer("pointermove", area(), 150, 370);
  await wait(60);
  pointer("pointermove", area(), 150, 365);
  await wait(120);
  pointer("pointerup", area(), 150, 365);
  await settle();
  expect(open.value).toBe(false);
});

it("keeps the drawer open after a short quick swipe from the edge", async () => {
  const open = harness({}, () => h("p", "Body"), false);
  await settle();
  pointer("pointerdown", area(), 150, 395);
  await wait(30);
  pointer("pointermove", area(), 150, 380);
  await wait(30);
  pointer("pointermove", area(), 150, 365);
  await wait(10);
  pointer("pointerup", area(), 150, 365);
  await settle();
  expect(open.value).toBe(true);
  expect(variable("--drawer-swipe-movement")).toBe("0px");
});

it("closes again when a short swipe from the edge turns back towards it", async () => {
  const open = harness({}, () => h("p", "Body"), false);
  await settle();
  pointer("pointerdown", area(), 150, 395);
  await wait(30);
  pointer("pointermove", area(), 150, 375);
  await wait(30);
  pointer("pointermove", area(), 150, 360);
  await wait(30);
  pointer("pointermove", area(), 150, 380);
  await wait(10);
  pointer("pointerup", area(), 150, 380);
  await settle();
  expect(open.value).toBe(false);
});

it("drags a right-side drawer towards the right and closes it", async () => {
  const open = harness(
    { side: "right" },
    undefined,
    true,
    "position: fixed; right: 0; top: 0; width: 300px; height: 400px",
  );
  await settle();
  expect(variable("--drawer-size")).toBe("300px");
  pointer("pointerdown", body(), 100, 100);
  await wait(40);
  pointer("pointermove", body(), 160, 100);
  await wait(40);
  expect(panel().dataset.side).toBe("right");
  expect(parseFloat(variable("--drawer-swipe-movement"))).toBeGreaterThan(0);
  pointer("pointermove", body(), 280, 100);
  await wait(40);
  pointer("pointerup", body(), 280, 100);
  await settle();
  expect(open.value).toBe(false);
});

it("ignores a move on the swipe area towards the edge", async () => {
  const open = harness({}, () => h("p", "Body"), false);
  await settle();
  const seen: boolean[] = [];
  const stop = watch(open, (value) => seen.push(value), { flush: "sync" });
  await drag(area(), [150, 380], [150, 420]);
  await settle();
  stop();
  expect(seen).not.toContain(true);
  expect(open.value).toBe(false);
});

it("keeps the swipe area rendered while open, with its gesture off", async () => {
  const open = harness();
  await settle();
  expect(area()).not.toBeNull();
  await drag(area(), [150, 395], [150, 200]);
  await settle();
  expect(open.value).toBe(true);
  expect(variable("--drawer-swipe-movement")).toBe("0px");
});
