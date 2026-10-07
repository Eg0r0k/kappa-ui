import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNodeChild, defineComponent, h, ref } from "vue";

import { type DragMove, useDrag } from "../../src/drag";
import { pointer, stamp, wait } from "../browser/pointer";

const host = (options: Partial<Parameters<typeof useDrag>[1]> = {}, children: () => VNodeChild = () => null) => {
  const releases: DragMove[] = [];
  const starts: DragMove[] = [];
  let cancels = 0;
  const wrapper = mount(
    defineComponent({
      setup: () => {
        const element = ref<HTMLElement>();
        useDrag(element, {
          towards: "bottom",
          onStart: (move) => starts.push(move),
          onMove: () => {},
          onRelease: (move) => releases.push(move),
          onCancel: () => (cancels += 1),
          ...options,
        });
        return () =>
          h(
            "div",
            { ref: element, style: "position: fixed; left: 0; top: 0; width: 300px; height: 400px" },
            children() ?? undefined,
          );
      },
    }),
    { attachTo: document.body },
  );
  return { element: wrapper.element as HTMLElement, releases, starts, cancels: () => cancels };
};

const touch = (type: "touchstart" | "touchmove" | "touchend", target: Element, x: number, y: number) => {
  const point = new Touch({ identifier: 1, target, clientX: x, clientY: y, pageX: x, pageY: y });
  const event = stamp(
    new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      touches: type === "touchend" ? [] : [point],
      targetTouches: type === "touchend" ? [] : [point],
      changedTouches: [point],
    }),
  );
  target.dispatchEvent(event);
  return event;
};

it("drags with a mouse on a touch-capable device", async () => {
  expect("ontouchstart" in window).toBe(true);
  const { element, starts, releases } = host({}, () => h("span", "grip"));
  const grip = element.querySelector("span")!;
  pointer("pointerdown", grip, 10, 10, "mouse");
  await wait(30);
  pointer("pointermove", grip, 10, 60, "mouse");
  await wait(30);
  pointer("pointerup", grip, 10, 60, "mouse");
  await wait(30);
  expect(starts).toHaveLength(1);
  expect(releases).toHaveLength(1);
});

it("leaves fingers to touch events, which drag and own their touchmove once the drag is decided", async () => {
  const { element, starts, releases } = host();
  pointer("pointerdown", element, 100, 100);
  await wait(30);
  pointer("pointermove", element, 100, 150);
  await wait(30);
  pointer("pointerup", element, 100, 150);
  await wait(30);
  expect(starts).toHaveLength(0);

  touch("touchstart", element, 100, 100);
  await wait(30);
  expect(touch("touchmove", element, 100, 102).defaultPrevented).toBe(false);
  await wait(30);
  touch("touchmove", element, 100, 130);
  await wait(30);
  expect(starts).toHaveLength(1);
  expect(touch("touchmove", element, 100, 160).defaultPrevented).toBe(true);
  await wait(30);
  touch("touchend", element, 100, 160);
  await wait(30);
  expect(releases).toHaveLength(1);
});

it("lets a mouse click through before any gesture and right after a finger drag", async () => {
  let clicks = 0;
  const { element, releases } = host({}, () => h("button", { onClick: () => (clicks += 1) }, "Press"));
  const button = element.querySelector("button")!;
  await userEvent.click(button);
  expect(clicks).toBe(1);
  touch("touchstart", element, 100, 100);
  for (const y of [130, 160]) {
    await wait(30);
    touch("touchmove", element, 100, y);
  }
  await wait(30);
  touch("touchend", element, 100, 160);
  await wait(30);
  expect(releases).toHaveLength(1);
  await userEvent.click(button);
  expect(clicks).toBe(2);
});

it("ignores touch events that arrive while a pen drags", async () => {
  const { element, starts, releases, cancels } = host();
  pointer("pointerdown", element, 100, 100, "pen");
  touch("touchstart", element, 100, 100);
  for (const y of [130, 160]) {
    await wait(30);
    pointer("pointermove", element, 100, y, "pen");
    touch("touchmove", element, 100, y);
  }
  await wait(30);
  pointer("pointerup", element, 100, 160, "pen");
  touch("touchend", element, 100, 160);
  await wait(30);
  expect(starts).toHaveLength(1);
  expect(releases).toHaveLength(1);
  expect(cancels()).toBe(0);
});

it("keeps the pen flag when an ignored touch press arrives mid-drag", async () => {
  const { element, starts, cancels } = host();
  pointer("pointerdown", element, 100, 100, "pen");
  await wait(30);
  pointer("pointermove", element, 100, 150, "pen");
  await wait(30);
  expect(starts).toHaveLength(1);

  pointer("pointerdown", element, 100, 100, "touch");
  touch("touchstart", element, 100, 100);
  await wait(30);
  touch("touchmove", element, 100, 130);
  await wait(30);
  touch("touchmove", element, 100, 160);
  await wait(30);
  touch("touchend", element, 100, 160);
  await wait(30);

  expect(starts).toHaveLength(1);
  expect(cancels()).toBe(0);
});

it("keys the input model off the start event instead of a flag left over from the previous gesture", async () => {
  const { element, starts } = host({}, () => h("p", "Some text to select"));
  const text = element.querySelector("p")!;

  pointer("pointerdown", element, 100, 100);
  await wait(30);
  pointer("pointermove", element, 100, 150);
  await wait(30);
  pointer("pointerup", element, 100, 150);
  await wait(30);
  expect(starts).toHaveLength(0);

  touch("touchstart", element, 100, 100);
  await wait(30);
  touch("touchmove", element, 100, 150);
  await wait(30);
  touch("touchend", element, 100, 150);
  await wait(30);
  expect(starts).toHaveLength(1);

  const range = document.createRange();
  range.selectNodeContents(text);
  getSelection()!.addRange(range);
  pointer("pointerdown", text, 10, 10, "mouse");
  await wait(30);
  pointer("pointermove", text, 10, 60, "mouse");
  await wait(30);
  pointer("pointerup", text, 10, 60, "mouse");
  await wait(30);
  expect(starts).toHaveLength(1);

  getSelection()!.removeAllRanges();
  pointer("pointerdown", text, 10, 10, "mouse");
  await wait(30);
  pointer("pointermove", text, 10, 60, "mouse");
  await wait(30);
  pointer("pointerup", text, 10, 60, "mouse");
  await wait(30);
  expect(starts).toHaveLength(2);
});
