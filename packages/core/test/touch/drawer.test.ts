import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import { DrawerContent, DrawerHandle, DrawerOverlay, DrawerRoot } from "../../src/drawer";
import { pointer, wait } from "../browser/pointer";

const PANEL = "position: fixed; left: 0; bottom: 0; width: 300px; height: 400px";

afterEach(() => {
  document.body.innerHTML = "";
});

const touch = (type: "touchstart" | "touchmove" | "touchend", target: Element, x: number, y: number) => {
  const point = new Touch({ identifier: 1, target, clientX: x, clientY: y, pageX: x, pageY: y });
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    touches: type === "touchend" ? [] : [point],
    targetTouches: type === "touchend" ? [] : [point],
    changedTouches: [point],
  });
  target.dispatchEvent(event);
  return event;
};

const finger = (type: "start" | "move" | "end", target: Element, x: number, y: number) => {
  pointer(type === "start" ? "pointerdown" : type === "move" ? "pointermove" : "pointerup", target, x, y, "touch");
  return touch(type === "start" ? "touchstart" : type === "move" ? "touchmove" : "touchend", target, x, y);
};

const harness = () => {
  const open = ref(true);
  mount(
    defineComponent({
      setup: () => () =>
        h(DrawerRoot, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () => [
          h(DrawerOverlay, { id: "overlay" }),
          h(DrawerContent, { style: PANEL }, () => [
            h(DrawerHandle, { id: "handle" }),
            h("div", { id: "body", style: "height: 200px; overflow: auto" }, h("p", { id: "text" }, "Body")),
          ]),
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
const text = () => document.getElementById("text")!;

it("closes after a finger drags the body past half of its height", async () => {
  const open = harness();
  await settle();
  expect(panel().style.getPropertyValue("--drawer-size")).toBe("400px");
  finger("start", text(), 150, 100);
  for (const y of [120, 160, 220, 280, 330]) {
    await wait(40);
    finger("move", text(), 150, y);
  }
  await settle();
  expect(panel().hasAttribute("data-swiping")).toBe(true);
  await wait(40);
  finger("end", text(), 150, 330);
  await settle();
  expect(open.value).toBe(false);
});

it("closes on a quick finger flick from the body", async () => {
  const open = harness();
  await settle();
  finger("start", text(), 150, 100);
  await wait(16);
  finger("move", text(), 150, 130);
  await wait(16);
  finger("move", text(), 150, 200);
  await wait(16);
  finger("move", text(), 150, 260);
  await wait(10);
  finger("end", text(), 150, 260);
  await settle();
  expect(open.value).toBe(false);
});

it("closes after a finger drag that pauses and then flicks, well short of half the height", async () => {
  const open = harness();
  await settle();
  finger("start", text(), 150, 100);
  let y = 100;
  for (let i = 0; i < 6; i++) {
    await wait(60);
    y += 10;
    finger("move", text(), 150, y);
  }
  for (let i = 0; i < 3; i++) {
    await wait(16);
    y += 30;
    finger("move", text(), 150, y);
  }
  await wait(10);
  finger("end", text(), 150, y);
  await settle();
  expect(open.value).toBe(false);
});

it("closes after a mouse drag that pauses and then flicks, well short of half the height", async () => {
  const open = harness();
  await settle();
  pointer("pointerdown", text(), 150, 100, "mouse");
  let y = 100;
  for (let i = 0; i < 6; i++) {
    await wait(60);
    y += 10;
    pointer("pointermove", text(), 150, y, "mouse");
  }
  for (let i = 0; i < 3; i++) {
    await wait(16);
    y += 30;
    pointer("pointermove", text(), 150, y, "mouse");
  }
  await wait(10);
  pointer("pointerup", text(), 150, y, "mouse");
  await settle();
  expect(open.value).toBe(false);
});

it("drags with a mouse from the body on a touch-capable device", async () => {
  const open = harness();
  await settle();
  pointer("pointerdown", text(), 150, 100, "mouse");
  await wait(30);
  pointer("pointermove", text(), 150, 200, "mouse");
  await wait(30);
  pointer("pointermove", text(), 150, 330, "mouse");
  await wait(30);
  pointer("pointerup", text(), 150, 330, "mouse");
  await settle();
  expect(open.value).toBe(false);
});

const scrolledHarness = () => {
  const open = ref(true);
  mount(
    defineComponent({
      setup: () => () =>
        h(DrawerRoot, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
          h(DrawerContent, { style: PANEL }, () =>
            h(
              "div",
              { id: "body", style: "height: 200px; overflow: auto" },
              h("p", { id: "text", style: "height: 600px" }, "Body"),
            ),
          ),
        ),
    }),
    { attachTo: document.body },
  );
  return open;
};

it("takes over a scroll that reaches the top during the same finger gesture", async () => {
  const open = scrolledHarness();
  await settle();
  const body = document.getElementById("body")!;
  body.scrollTop = 60;
  finger("start", text(), 150, 100);
  for (const y of [115, 130]) {
    await wait(30);
    finger("move", text(), 150, y);
  }
  await settle();
  expect(panel().hasAttribute("data-swiping")).toBe(false);
  body.scrollTop = 0;
  for (const y of [160, 220, 280, 330]) {
    await wait(30);
    finger("move", text(), 150, y);
  }
  await settle();
  expect(panel().hasAttribute("data-swiping")).toBe(true);
  await wait(30);
  finger("end", text(), 150, 330);
  await settle();
  expect(open.value).toBe(false);
});

it("leaves a gesture to the browser once its moves cannot be cancelled", async () => {
  const open = scrolledHarness();
  await settle();
  const body = document.getElementById("body")!;
  body.scrollTop = 60;
  finger("start", text(), 150, 100);
  await wait(30);
  finger("move", text(), 150, 130);
  body.scrollTop = 0;
  for (const y of [160, 220, 280, 330]) {
    await wait(30);
    const point = new Touch({ identifier: 1, target: text(), clientX: 150, clientY: y, pageX: 150, pageY: y });
    text().dispatchEvent(
      new TouchEvent("touchmove", {
        bubbles: true,
        cancelable: false,
        touches: [point],
        targetTouches: [point],
        changedTouches: [point],
      }),
    );
  }
  await settle();
  expect(panel().hasAttribute("data-swiping")).toBe(false);
  finger("end", text(), 150, 330);
  await settle();
  expect(open.value).toBe(true);
});
