import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNodeChild, defineComponent, h, ref } from "vue";

import { type DragMove, releaseVerdict, scrollBlocksDrag, useDrag } from "../../src/drag";
import { drag, flick, pointer, wait } from "./pointer";

afterEach(() => {
  document.body.innerHTML = "";
});

const host = (options: Partial<Parameters<typeof useDrag>[1]> = {}, children: () => VNodeChild = () => null) => {
  const moves: DragMove[] = [];
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
          onMove: (move) => moves.push(move),
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
  return {
    element: wrapper.element as HTMLElement,
    moves,
    releases,
    starts,
    cancels: () => cancels,
    unmount: () => wrapper.unmount(),
  };
};

it("reports movement towards the side as positive and calls release", async () => {
  const { element, starts, moves, releases } = host();
  await drag(element, [100, 100], [100, 210], 4, 80);
  expect(starts).toHaveLength(1);
  expect(moves.at(-1)!.movement).toBeCloseTo(100, 0);
  expect(releases).toHaveLength(1);
  expect(releases[0]!.swipe).toBe(0);
});

it("mirrors the sign for the top side", async () => {
  const { element, moves } = host({ towards: "top" });
  await drag(element, [100, 200], [100, 90]);
  expect(moves.at(-1)!.movement).toBeCloseTo(100, 0);
});

it("flags a fast release as a swipe", async () => {
  const { element, releases } = host();
  await flick(element, [100, 50], [100, 250]);
  expect(releases[0]!.swipe).toBe(1);
});

it("ignores a tap", async () => {
  const { element, starts, releases } = host();
  pointer("pointerdown", element, 100, 100);
  await wait(20);
  pointer("pointerup", element, 101, 101);
  expect(starts).toHaveLength(0);
  expect(releases).toHaveLength(0);
});

it("cancels when canStart says no and when the target is inside data-no-drag", async () => {
  const { element, starts, cancels } = host({ canStart: () => false });
  await drag(element, [100, 100], [100, 200]);
  expect(starts).toHaveLength(0);
  expect(cancels()).toBe(0);

  const inner = host({}, () => h("p", { "data-no-drag": "" }, "text"));
  await drag(inner.element.querySelector("p")!, [10, 10], [10, 120]);
  expect(inner.starts).toHaveLength(0);
});

it("lets a mouse drag only from where mouseFrom allows", async () => {
  const { element, starts } = host({ mouseFrom: (target) => target.hasAttribute("data-drag") }, () => [
    h("span", { "data-drag": "" }, "grip"),
    h("span", "text"),
  ]);
  const [grip, text] = element.querySelectorAll("span");
  pointer("pointerdown", text!, 10, 10, "mouse");
  await wait(20);
  pointer("pointermove", text!, 10, 60, "mouse");
  await wait(20);
  pointer("pointerup", text!, 10, 60, "mouse");
  expect(starts).toHaveLength(0);

  pointer("pointerdown", grip!, 10, 10, "mouse");
  await wait(20);
  pointer("pointermove", grip!, 10, 60, "mouse");
  await wait(20);
  pointer("pointerup", grip!, 10, 60, "mouse");
  expect(starts).toHaveLength(1);
});

it("reads the direction from the finger when the threshold leaves no movement yet", async () => {
  const { element, starts, releases } = host({ canStart: (move) => move.direction > 0 });
  pointer("pointerdown", element, 100, 100);
  for (let y = 101; y <= 115; y++) {
    await wait(5);
    pointer("pointermove", element, 100, y);
  }
  await wait(40);
  pointer("pointerup", element, 100, 115);
  expect(starts).toHaveLength(1);
  expect(releases).toHaveLength(1);
});

it("leaves arrow keys alone", async () => {
  const { element, starts, releases } = host({}, () => h("button", "Focus"));
  element.querySelector("button")!.focus();
  await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
  await wait(30);
  expect(starts).toHaveLength(0);
  expect(releases).toHaveLength(0);
});

it("cancels a running drag once when its host unmounts", async () => {
  const { element, starts, releases, cancels, unmount } = host();
  pointer("pointerdown", element, 100, 100);
  await wait(30);
  pointer("pointermove", element, 100, 150);
  await wait(30);
  expect(starts).toHaveLength(1);
  unmount();
  expect(cancels()).toBe(1);
  pointer("pointerup", element, 100, 150);
  expect(releases).toHaveLength(0);
  expect(cancels()).toBe(1);
});

it("keeps movement at or above the lower bound apart from the rubber band", async () => {
  const { element, moves } = host({ bounds: { min: 0 } });
  await drag(element, [100, 300], [100, 100]);
  expect(moves.at(-1)!.movement).toBeGreaterThan(-200);
  expect(moves.at(-1)!.movement).toBeLessThanOrEqual(0);
});

it("scrollBlocksDrag reads the scroll chain for each side", () => {
  const boundary = document.createElement("div");
  boundary.innerHTML =
    '<div id="s" style="height: 100px; overflow: auto"><div style="height: 300px"><span id="t">x</span></div></div>';
  document.body.append(boundary);
  const scroller = boundary.querySelector<HTMLElement>("#s")!;
  const target = boundary.querySelector("#t")!;
  expect(scrollBlocksDrag(target, boundary, "bottom")).toBe(false);
  expect(scrollBlocksDrag(target, boundary, "top")).toBe(true);
  scroller.scrollTop = 50;
  expect(scrollBlocksDrag(target, boundary, "bottom")).toBe(true);
  expect(scrollBlocksDrag(target, boundary, "top")).toBe(true);
  scroller.scrollTop = 200;
  expect(scrollBlocksDrag(target, boundary, "top")).toBe(false);
  expect(scrollBlocksDrag(target, boundary, "left")).toBe(false);
});

it("releaseVerdict closes on a swipe or half of the size, and on 10px while the size is unknown", () => {
  expect(releaseVerdict(10, 400, 1)).toBe("close");
  expect(releaseVerdict(199, 400, 0)).toBe("return");
  expect(releaseVerdict(200, 400, 0)).toBe("close");
  expect(releaseVerdict(9, 0, 0)).toBe("return");
  expect(releaseVerdict(10, 0, 0)).toBe("close");
  expect(releaseVerdict(300, 400, -1)).toBe("close");
});
