import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { defineComponent, h, nextTick } from "vue";

import { SwipeAction, SwipeActionContent, SwipeActions, SwipeContent, SwipeItem } from "../../src/swipe-actions";
import { wait } from "../browser/pointer";

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

const setup = async () => {
  mount(
    defineComponent({
      setup: () => () =>
        h("div", { style: "position: fixed; left: 0; top: 0" }, [
          h(SwipeItem, { style: "width: 300px" }, () => [
            h(SwipeActions, { side: "end" }, () =>
              h(SwipeAction, () => h(SwipeActionContent, { style: "width: 80px; height: 48px" }, () => "Delete")),
            ),
            h(SwipeContent, { "data-test": "content", style: "height: 48px" }, () => "Row"),
          ]),
        ]),
    }),
    { attachTo: document.body },
  );
  await wait(50);
  return document.querySelector<HTMLElement>("[data-test=content]")!;
};

const state = () => document.querySelector<HTMLElement>("[data-state]")!.dataset.state;

it("opens on a sideways finger drag", async () => {
  const content = await setup();
  touch("touchstart", content, 250, 24);
  for (const x of [230, 200, 170, 150]) {
    await wait(30);
    touch("touchmove", content, x, 24);
  }
  await wait(30);
  touch("touchend", content, 150, 24);
  await nextTick();
  expect(state()).toBe("end");
});

it("leaves a vertical finger drag to the page", async () => {
  const content = await setup();
  touch("touchstart", content, 250, 24);
  let prevented = false;
  for (const y of [40, 60, 80]) {
    await wait(30);
    prevented ||= touch("touchmove", content, 245, y).defaultPrevented;
  }
  touch("touchend", content, 245, 80);
  await nextTick();
  expect(prevented).toBe(false);
  expect(state()).toBe("closed");
});
