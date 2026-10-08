import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { type MaybeRefOrGetter, type VNodeChild, defineComponent, h, nextTick, ref } from "vue";

import { type UseSwipeSnapReturn, useSwipeSnap } from "../../src/swipe-snap";
import { drag, flick, pointer, wait } from "./pointer";

const css = document.createElement("style");
css.textContent = `
@property --swipe-snap-offset { syntax: "<length>"; inherits: false; initial-value: 0px; }
@property --swipe-snap-position { syntax: "<number>"; inherits: false; initial-value: 0; }
.snap {
  transition:
    --swipe-snap-offset var(--swipe-snap-duration, 300ms) linear,
    --swipe-snap-position var(--swipe-snap-duration, 300ms) linear;
}
.snap[data-dragging] { transition: none; }
`;
document.head.append(css);

interface HostOptions {
  points?: MaybeRefOrGetter<readonly number[]>;
  active?: number;
  axis?: "x" | "y";
  rtl?: boolean;
  sequential?: boolean;
  enabled?: MaybeRefOrGetter<boolean>;
  children?: () => VNodeChild;
}

const host = async ({
  points = [0, 300, 600, 900],
  active = 0,
  axis = "x",
  rtl = false,
  sequential = true,
  enabled = true,
  children,
}: HostOptions = {}) => {
  const index = ref(active);
  let snap!: UseSwipeSnapReturn;
  mount(
    defineComponent({
      setup: () => {
        const element = ref<HTMLElement>();
        snap = useSwipeSnap(element, { points, active: index, axis, rtl, sequential, enabled });
        return () =>
          h(
            "div",
            { ref: element, class: "snap", style: "position: fixed; left: 0; top: 0; width: 300px; height: 200px" },
            children?.(),
          );
      },
    }),
    { attachTo: document.body },
  );
  await wait(30);
  const element = document.querySelector<HTMLElement>(".snap")!;
  return { element, index, snap, offset: () => element.style.getPropertyValue("--swipe-snap-offset") };
};

it("writes the active point as a negative offset and its index as the position", async () => {
  const { element, offset } = await host({ active: 1 });
  expect(offset()).toBe("-300px");
  expect(element.style.getPropertyValue("--swipe-snap-position")).toBe("1");
});

it("springs back from a slow drag under half the way", async () => {
  const { element, index, offset } = await host();
  await drag(element, [250, 100], [150, 100], 4, 80);
  expect(index.value).toBe(0);
  expect(offset()).toBe("0px");
});

it("goes on to the next point from a slow drag past half the way", async () => {
  const { element, index, offset } = await host();
  await drag(element, [250, 100], [50, 100], 4, 80);
  expect(index.value).toBe(1);
  expect(offset()).toBe("-300px");
  expect(element.hasAttribute("data-settling")).toBe(true);
});

it("goes on to the next point from a short quick flick", async () => {
  const { element, index } = await host();
  await flick(element, [250, 100], [130, 100]);
  expect(index.value).toBe(1);
});

it("steps one point on a hard fling when sequential", async () => {
  const { element, index } = await host();
  await flick(element, [290, 100], [10, 100]);
  expect(index.value).toBe(1);
});

it("flings to the last point when not sequential", async () => {
  const { element, index } = await host({ sequential: false });
  await flick(element, [290, 100], [10, 100]);
  expect(index.value).toBe(3);
});

it("rubber-bands before the first point", async () => {
  const { element, index, offset } = await host();
  pointer("pointerdown", element, 50, 100);
  for (const x of [70, 120, 170, 250]) {
    await wait(40);
    pointer("pointermove", element, x, 100);
  }
  const pulled = parseFloat(offset());
  expect(pulled).toBeGreaterThan(0);
  expect(pulled).toBeLessThan(100);
  await wait(80);
  pointer("pointerup", element, 250, 100);
  expect(index.value).toBe(0);
});

it("catches a settle where it is and drags on from there", async () => {
  const { element, snap } = await host();
  snap.snapTo(2);
  expect(element.hasAttribute("data-settling")).toBe(true);
  await wait(150);
  const live = parseFloat(getComputedStyle(element).getPropertyValue("--swipe-snap-offset"));
  expect(live).toBeLessThan(-100);
  expect(live).toBeGreaterThan(-550);
  pointer("pointerdown", element, 150, 100);
  await wait(10);
  pointer("pointermove", element, 165, 100);
  await wait(10);
  pointer("pointermove", element, 185, 100);
  expect(element.hasAttribute("data-dragging")).toBe(true);
  expect(element.hasAttribute("data-settling")).toBe(false);
  expect(Math.abs(parseFloat(element.style.getPropertyValue("--swipe-snap-offset")) - live)).toBeLessThan(60);
  await wait(80);
  pointer("pointerup", element, 185, 100);
});

it("settles on an outside change of the active point and ignores one during a drag", async () => {
  const { element, index, offset } = await host();
  index.value = 2;
  await nextTick();
  expect(offset()).toBe("-600px");
  expect(element.hasAttribute("data-settling")).toBe(true);
  await wait(400);
  expect(element.hasAttribute("data-settling")).toBe(false);

  pointer("pointerdown", element, 150, 100);
  for (const x of [130, 110, 90]) {
    await wait(40);
    pointer("pointermove", element, x, 100);
  }
  index.value = 0;
  await nextTick();
  expect(parseFloat(offset())).toBeLessThan(-600);
  await wait(80);
  pointer("pointerup", element, 90, 100);
  await nextTick();
  expect(index.value).toBe(2);
});

it("waits for a scroller inside to reach its edge", async () => {
  const { element, index } = await host({
    children: () =>
      h(
        "div",
        { class: "scroller", style: "width: 200px; overflow-x: auto" },
        h("div", { style: "width: 600px; height: 50px" }),
      ),
  });
  const scroller = element.querySelector<HTMLElement>(".scroller")!;
  await drag(scroller, [150, 20], [20, 20], 4, 80);
  expect(index.value).toBe(0);
  scroller.scrollLeft = 400;
  await drag(scroller, [190, 20], [10, 20], 4, 80);
  expect(index.value).toBe(1);
});

it("mirrors the axis in right-to-left and keeps the index logical", async () => {
  const { element, index, offset } = await host({ rtl: true });
  await drag(element, [50, 100], [250, 100], 4, 80);
  expect(index.value).toBe(1);
  expect(offset()).toBe("300px");
});

it("drags along y", async () => {
  const { element, index } = await host({ axis: "y" });
  await drag(element, [150, 190], [150, 10], 4, 80);
  expect(index.value).toBe(1);
});

it("moves at once without animation and leaves data-dragging alone", async () => {
  const { element, snap, index } = await host();
  const seen: string[] = [];
  new MutationObserver((records) => seen.push(...records.map((record) => record.attributeName!))).observe(element, {
    attributes: true,
    attributeFilter: ["data-dragging"],
  });
  snap.snapTo(3, { animate: false });
  expect(index.value).toBe(3);
  expect(getComputedStyle(element).getPropertyValue("--swipe-snap-offset")).toBe("-900px");
  expect(element.getAnimations()).toHaveLength(0);
  expect(element.hasAttribute("data-settling")).toBe(false);
  expect(element.style.getPropertyValue("--swipe-snap-duration")).toBe("");
  await wait(20);
  expect(seen).toEqual([]);
});

it("ends settling on its own transition, not on one from inside", async () => {
  const { element, snap } = await host({ children: () => h("span") });
  snap.snapTo(1);
  element
    .querySelector("span")!
    .dispatchEvent(new TransitionEvent("transitionend", { propertyName: "--swipe-snap-offset", bubbles: true }));
  expect(element.hasAttribute("data-settling")).toBe(true);
  element.dispatchEvent(new TransitionEvent("transitionend", { propertyName: "--swipe-snap-offset", bubbles: true }));
  expect(element.hasAttribute("data-settling")).toBe(false);
});

it("does not settle when nothing moves or nothing transitions", async () => {
  const { element, snap } = await host();
  snap.snapTo(0);
  expect(element.hasAttribute("data-settling")).toBe(false);
  element.style.transition = "none";
  snap.snapTo(1);
  expect(element.hasAttribute("data-settling")).toBe(false);
});

it("follows new points at once at rest", async () => {
  const points = ref([0, 300, 600]);
  const { element, offset } = await host({ points, active: 1 });
  points.value = [0, 200, 400];
  await nextTick();
  expect(offset()).toBe("-200px");
  expect(element.getAnimations()).toHaveLength(0);
});

it("goes back to the active point when switched off mid-drag", async () => {
  const enabled = ref(true);
  const { element, offset } = await host({ enabled });
  pointer("pointerdown", element, 250, 100);
  for (const x of [230, 200, 170]) {
    await wait(40);
    pointer("pointermove", element, x, 100);
  }
  expect(element.hasAttribute("data-dragging")).toBe(true);
  enabled.value = false;
  await nextTick();
  await wait(10);
  expect(element.hasAttribute("data-dragging")).toBe(false);
  expect(offset()).toBe("0px");
  pointer("pointerup", element, 170, 100);
});

it("drags from an attached element", async () => {
  const index = ref(0);
  mount(
    defineComponent({
      setup: () => {
        const element = ref<HTMLElement>();
        const strip = ref<HTMLElement>();
        const snap = useSwipeSnap(element, { points: [0, 300, 600], active: index, canStart: () => false });
        snap.attach(strip);
        return () =>
          h("div", [
            h("div", {
              ref: element,
              class: "snap",
              style: "position: fixed; left: 0; top: 0; width: 300px; height: 200px",
            }),
            h("div", {
              ref: strip,
              class: "strip",
              style: "position: fixed; left: 0; top: 200px; width: 300px; height: 40px",
            }),
          ]);
      },
    }),
    { attachTo: document.body },
  );
  await wait(30);
  await drag(document.querySelector(".snap")!, [250, 100], [50, 100], 4, 80);
  expect(index.value).toBe(0);
  await drag(document.querySelector(".strip")!, [250, 220], [50, 220], 4, 80);
  expect(index.value).toBe(1);
});
