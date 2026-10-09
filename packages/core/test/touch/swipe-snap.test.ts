import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { defineComponent, h, ref } from "vue";

import { useSwipeSnap } from "../../src/swipe-snap";
import { stamp, wait } from "../browser/pointer";

const touch = (type: "touchstart" | "touchmove" | "touchend", target: Element, x: number, y: number) => {
  const point = new Touch({ identifier: 1, target, clientX: x, clientY: y, pageX: x, pageY: y });
  target.dispatchEvent(
    stamp(
      new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        touches: type === "touchend" ? [] : [point],
        targetTouches: type === "touchend" ? [] : [point],
        changedTouches: [point],
      }),
    ),
  );
};

const host = async () => {
  const index = ref(0);
  mount(
    defineComponent({
      setup: () => {
        const element = ref<HTMLElement>();
        useSwipeSnap(element, { points: [0, 300, 600], active: index });
        return () =>
          h("div", {
            ref: element,
            class: "snap",
            style: "position: fixed; left: 0; top: 0; width: 300px; height: 200px",
          });
      },
    }),
    { attachTo: document.body },
  );
  await wait(30);
  return { element: document.querySelector<HTMLElement>(".snap")!, index };
};

const swipe = async (element: Element, points: [number, number][]) => {
  touch("touchstart", element, ...points[0]!);
  for (const point of points.slice(1)) {
    await wait(40);
    touch("touchmove", element, ...point);
  }
  await wait(80);
  touch("touchend", element, ...points.at(-1)!);
};

it("pages on a sideways finger drag", async () => {
  const { element, index } = await host();
  await swipe(element, [
    [250, 100],
    [220, 100],
    [150, 100],
    [60, 100],
  ]);
  expect(index.value).toBe(1);
});

it("leaves a vertical finger drag to the page", async () => {
  const { element, index } = await host();
  await swipe(element, [
    [250, 20],
    [245, 60],
    [240, 120],
    [235, 180],
  ]);
  expect(index.value).toBe(0);
  expect(element.hasAttribute("data-dragging")).toBe(false);
});

it("settles a finger drag that a second finger joined", async () => {
  const { element, index } = await host();
  const first = (x: number) => new Touch({ identifier: 1, target: element, clientX: x, clientY: 100 });
  const second = new Touch({ identifier: 2, target: element, clientX: 200, clientY: 150 });
  const send = (type: "touchstart" | "touchmove" | "touchend", changedTouches: Touch[], touches: Touch[]) =>
    element.dispatchEvent(
      stamp(new TouchEvent(type, { bubbles: true, cancelable: true, touches, targetTouches: touches, changedTouches })),
    );
  send("touchstart", [first(250)], [first(250)]);
  for (const x of [220, 150]) {
    await wait(40);
    send("touchmove", [first(x)], [first(x)]);
  }
  await wait(40);
  send("touchstart", [second], [first(150), second]);
  await wait(40);
  send("touchmove", [first(60)], [first(60), second]);
  await wait(80);
  send("touchend", [first(60)], [second]);
  await wait(40);
  send("touchend", [second], []);
  expect(element.hasAttribute("data-dragging")).toBe(false);
  expect(index.value).toBe(1);
});
