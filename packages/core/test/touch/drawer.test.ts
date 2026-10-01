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
