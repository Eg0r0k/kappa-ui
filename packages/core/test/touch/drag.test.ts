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

const finger = (identifier: number, target: Element, x: number, y: number) =>
  new Touch({ identifier, target, clientX: x, clientY: y, pageX: x, pageY: y });

const fingers = (
  type: "touchstart" | "touchmove" | "touchend",
  target: Element,
  changedTouches: Touch[],
  touches: Touch[],
) =>
  target.dispatchEvent(
    stamp(
      new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        touches,
        targetTouches: touches,
        changedTouches,
      }),
    ),
  );

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

it("gives a nested finger gesture to the innermost drag and keeps the outer one off", async () => {
  const log: string[] = [];
  mount(
    defineComponent({
      setup: () => {
        const outer = ref<HTMLElement>();
        const child = ref<HTMLElement>();
        useDrag(outer, { towards: "right", onStart: () => log.push("outer"), onMove: () => {}, onRelease: () => {} });
        useDrag(child, { towards: "right", onStart: () => log.push("inner"), onMove: () => {}, onRelease: () => {} });
        return () =>
          h(
            "div",
            { ref: outer, style: "position: fixed; left: 0; top: 0; width: 300px; height: 300px" },
            h("div", { ref: child, "data-test": "inner", style: "width: 200px; height: 100px" }),
          );
      },
    }),
    { attachTo: document.body },
  );
  await wait(30);
  const inner = document.querySelector<HTMLElement>("[data-test=inner]")!;
  touch("touchstart", inner, 20, 50);
  for (const x of [40, 70, 100, 130]) {
    await wait(30);
    touch("touchmove", inner, x, 50);
  }
  await wait(30);
  touch("touchend", inner, 130, 50);
  expect(log).toEqual(["inner"]);
});

it("keeps following the first finger when a second one lands on the element mid-drag", async () => {
  const moves: number[] = [];
  const { element, releases, cancels } = host({ onMove: (move) => moves.push(move.movement) });
  fingers("touchstart", element, [finger(1, element, 100, 100)], [finger(1, element, 100, 100)]);
  for (const y of [130, 160]) {
    await wait(30);
    fingers("touchmove", element, [finger(1, element, 100, y)], [finger(1, element, 100, y)]);
  }
  await wait(30);
  const second = finger(2, element, 200, 100);
  fingers("touchstart", element, [second], [finger(1, element, 100, 160), second]);
  await wait(30);
  fingers("touchmove", element, [finger(1, element, 100, 200)], [finger(1, element, 100, 200), second]);
  expect(moves.at(-1)).toBe(90);
  await wait(30);
  fingers("touchend", element, [second], [finger(1, element, 100, 200)]);
  expect(releases).toHaveLength(0);
  await wait(30);
  fingers("touchmove", element, [finger(1, element, 100, 230)], [finger(1, element, 100, 230)]);
  expect(moves.at(-1)).toBe(120);
  await wait(30);
  fingers("touchend", element, [finger(1, element, 100, 230)], []);
  expect(releases).toHaveLength(1);
  expect(cancels()).toBe(0);
});

it("keeps following the first finger while a second one rests outside the element", async () => {
  const moves: number[] = [];
  const { element, releases } = host({ onMove: (move) => moves.push(move.movement) });
  fingers("touchstart", element, [finger(1, element, 100, 100)], [finger(1, element, 100, 100)]);
  for (const y of [130, 160]) {
    await wait(30);
    fingers("touchmove", element, [finger(1, element, 100, y)], [finger(1, element, 100, y)]);
  }
  await wait(30);
  const outside = finger(2, document.body, 500, 500);
  fingers("touchstart", document.body, [outside], [finger(1, element, 100, 160), outside]);
  await wait(30);
  fingers("touchmove", element, [finger(1, element, 100, 200)], [finger(1, element, 100, 200), outside]);
  expect(moves.at(-1)).toBe(90);
  await wait(30);
  fingers("touchend", element, [finger(1, element, 100, 200)], [outside]);
  expect(releases).toHaveLength(1);
  fingers("touchend", document.body, [outside], []);
});

it("starts no drag when a second finger lands before the drag is decided", async () => {
  const { element, starts } = host();
  fingers("touchstart", element, [finger(1, element, 100, 100)], [finger(1, element, 100, 100)]);
  await wait(30);
  const second = finger(2, element, 200, 100);
  fingers("touchstart", element, [second], [finger(1, element, 100, 100), second]);
  for (const y of [130, 160]) {
    await wait(30);
    fingers(
      "touchmove",
      element,
      [finger(1, element, 100, y)],
      [finger(1, element, 100, y), finger(2, element, 200, y)],
    );
  }
  await wait(30);
  fingers("touchend", element, [finger(1, element, 100, 160)], [finger(2, element, 200, 160)]);
  fingers("touchend", element, [finger(2, element, 200, 160)], []);
  expect(starts).toHaveLength(0);
});

it("keeps a pen out of a running finger drag", async () => {
  const { element, starts, releases, cancels } = host();
  fingers("touchstart", element, [finger(1, element, 100, 100)], [finger(1, element, 100, 100)]);
  for (const y of [130, 160]) {
    await wait(30);
    fingers("touchmove", element, [finger(1, element, 100, y)], [finger(1, element, 100, y)]);
  }
  await wait(30);
  pointer("pointerdown", element, 200, 100, "pen");
  for (const y of [130, 160, 190]) {
    await wait(30);
    pointer("pointermove", element, 200, y, "pen");
  }
  await wait(30);
  pointer("pointerup", element, 200, 190, "pen");
  fingers("touchend", element, [finger(1, element, 100, 160)], []);
  await wait(30);
  expect(starts).toHaveLength(1);
  expect(releases).toHaveLength(1);
  expect(cancels()).toBe(0);
});

it("keeps a finger out of a running mouse drag", async () => {
  const { element, starts, releases, cancels } = host();
  pointer("pointerdown", element, 200, 100, "mouse");
  for (const y of [130, 160]) {
    await wait(30);
    pointer("pointermove", element, 200, y, "mouse");
  }
  expect(starts).toHaveLength(1);
  fingers("touchstart", element, [finger(1, element, 100, 100)], [finger(1, element, 100, 100)]);
  for (const y of [130, 160, 190]) {
    await wait(30);
    fingers("touchmove", element, [finger(1, element, 100, y)], [finger(1, element, 100, y)]);
  }
  expect(starts).toHaveLength(1);
  await wait(30);
  pointer("pointerup", element, 200, 160, "mouse");
  fingers("touchend", element, [finger(1, element, 100, 190)], []);
  await wait(30);
  expect(releases).toHaveLength(1);
  expect(cancels()).toBe(0);
});
