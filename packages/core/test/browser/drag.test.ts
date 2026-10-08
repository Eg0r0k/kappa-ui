import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNodeChild, defineComponent, h, ref } from "vue";

import { type DragMove, releaseVerdict, scrollBlocksDrag, useDrag } from "../../src/drag";
import { drag, flick, pointer, wait } from "./pointer";

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

it("reports movement towards the side as positive, calls release, and reads zero velocity after a rest", async () => {
  const { element, starts, moves, releases } = host();
  await drag(element, [100, 100], [100, 210], 4, 80);
  expect(starts).toHaveLength(1);
  expect(moves.at(-1)!.movement).toBeCloseTo(100, 0);
  expect(releases).toHaveLength(1);
  expect(releases[0]!.velocity).toBe(0);
});

it("mirrors the sign for the top side", async () => {
  const { element, moves } = host({ towards: "top" });
  await drag(element, [100, 200], [100, 90]);
  expect(moves.at(-1)!.movement).toBeCloseTo(100, 0);
});

it("reports the release velocity over the last moves when released on the move", async () => {
  const { element, releases } = host();
  pointer("pointerdown", element, 100, 100);
  for (let y = 120; y <= 260; y += 20) {
    await wait(20);
    pointer("pointermove", element, 100, y);
  }
  await wait(10);
  pointer("pointerup", element, 100, 260);
  expect(releases).toHaveLength(1);
  expect(releases[0]!.velocity).toBeGreaterThan(0.5);
  expect(releases[0]!.velocity).toBeLessThan(2);

  const back = host({ towards: "top" });
  await flick(back.element, [100, 250], [100, 50]);
  expect(back.releases[0]!.velocity).toBeGreaterThan(2);
});

it("ignores a tap", async () => {
  const { element, starts, releases } = host();
  pointer("pointerdown", element, 100, 100);
  await wait(20);
  pointer("pointerup", element, 101, 101);
  expect(starts).toHaveLength(0);
  expect(releases).toHaveLength(0);
});

it("never starts, and reports no cancel, when canStart says no or the target is inside data-no-drag", async () => {
  const { element, starts, cancels } = host({ canStart: () => false });
  await drag(element, [100, 100], [100, 200]);
  expect(starts).toHaveLength(0);
  expect(cancels()).toBe(0);

  const inner = host({}, () => h("p", { "data-no-drag": "" }, "text"));
  await drag(inner.element.querySelector("p")!, [10, 10], [10, 120]);
  expect(inner.starts).toHaveLength(0);
});

it("drags with a mouse from anywhere and clears the selection the press started", async () => {
  const { element, starts } = host({}, () => h("p", "Some text to select"));
  const text = element.querySelector("p")!;
  pointer("pointerdown", text, 10, 10, "mouse");
  const range = document.createRange();
  range.selectNodeContents(text);
  getSelection()!.addRange(range);
  await wait(20);
  pointer("pointermove", text, 10, 60, "mouse");
  await wait(20);
  expect(starts).toHaveLength(1);
  expect(getSelection()!.toString()).toBe("");
  pointer("pointerup", text, 10, 60, "mouse");
});

it("leaves a press alone while text is already selected", async () => {
  const { element, starts } = host({}, () => h("p", "Some text to select"));
  const text = element.querySelector("p")!;
  const range = document.createRange();
  range.selectNodeContents(text);
  getSelection()!.addRange(range);
  pointer("pointerdown", text, 10, 10, "mouse");
  await wait(20);
  pointer("pointermove", text, 10, 60, "mouse");
  await wait(20);
  pointer("pointerup", text, 10, 60, "mouse");
  expect(starts).toHaveLength(0);
  getSelection()!.removeAllRanges();
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
  expect(moves.at(-1)!.movement).toBeCloseTo(-51.2, 1);
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

it("ignores a sideways gesture on a fresh instance and still drags normally afterwards", async () => {
  const { element, starts, releases } = host();
  pointer("pointerdown", element, 100, 100);
  for (const [x, y] of [
    [160, 103],
    [220, 108],
    [280, 112],
  ] as const) {
    await wait(30);
    pointer("pointermove", element, x, y);
  }
  await wait(30);
  pointer("pointerup", element, 280, 112);
  expect(starts).toHaveLength(0);

  const selectstart = new Event("selectstart", { bubbles: true, cancelable: true });
  document.body.dispatchEvent(selectstart);
  expect(selectstart.defaultPrevented).toBe(false);

  await drag(element, [100, 100], [100, 210], 4, 80);
  expect(starts).toHaveLength(1);
  expect(releases).toHaveLength(1);
});

it("keeps releasing fast after a drag that pauses and then flicks", async () => {
  const { element, releases } = host();
  pointer("pointerdown", element, 100, 100);
  let y = 100;
  for (let i = 0; i < 6; i++) {
    await wait(60);
    y += 10;
    pointer("pointermove", element, 100, y);
  }
  for (let i = 0; i < 3; i++) {
    await wait(16);
    y += 30;
    pointer("pointermove", element, 100, y);
  }
  await wait(10);
  pointer("pointerup", element, 100, y);
  expect(releases).toHaveLength(1);
  expect(releases[0]!.velocity).toBeGreaterThan(0.5);
});

it("releaseVerdict closes at the swipe velocity or half of the size, on 10px while the size is unknown, never without net movement", () => {
  expect(releaseVerdict(10, 400, 0.5)).toBe("close");
  expect(releaseVerdict(199, 400, 0.49)).toBe("return");
  expect(releaseVerdict(200, 400, 0)).toBe("close");
  expect(releaseVerdict(9, 0, 0)).toBe("return");
  expect(releaseVerdict(10, 0, 0)).toBe("close");
  expect(releaseVerdict(0, 400, 3)).toBe("return");
  expect(releaseVerdict(300, 400, -1)).toBe("close");
});

const nested = (inner: Partial<Parameters<typeof useDrag>[1]> = {}) => {
  const log: string[] = [];
  mount(
    defineComponent({
      setup: () => {
        const outer = ref<HTMLElement>();
        const child = ref<HTMLElement>();
        useDrag(outer, { towards: "right", onStart: () => log.push("outer"), onMove: () => {}, onRelease: () => {} });
        useDrag(child, {
          towards: "right",
          onStart: () => log.push("inner"),
          onMove: () => {},
          onRelease: () => {},
          ...inner,
        });
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
  return { log, inner: () => document.querySelector<HTMLElement>("[data-test=inner]")! };
};

it("gives a nested gesture to the innermost drag only", async () => {
  const { log, inner } = nested();
  await wait(30);
  await drag(inner(), [20, 50], [150, 50]);
  expect(log).toEqual(["inner"]);
});

it("gives a nested gesture to the outer drag when the inner one refuses it", async () => {
  const { log, inner } = nested({ canStart: () => false });
  await wait(30);
  await drag(inner(), [20, 50], [150, 50]);
  expect(log).toEqual(["outer"]);
});

it("reads a right-to-left scroller from its start on the right", () => {
  const boundary = document.createElement("div");
  boundary.innerHTML = `<div dir="rtl" style="width: 100px; overflow-x: auto"><div style="width: 300px; height: 10px"></div></div>`;
  document.body.append(boundary);
  const scroller = boundary.firstElementChild as HTMLElement;
  const content = scroller.firstElementChild!;
  expect(scrollBlocksDrag(content, boundary, "left")).toBe(false);
  expect(scrollBlocksDrag(content, boundary, "right")).toBe(true);
  scroller.scrollLeft = -200;
  expect(scrollBlocksDrag(content, boundary, "left")).toBe(true);
  expect(scrollBlocksDrag(content, boundary, "right")).toBe(false);
});
