import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { defineComponent, h, withDirectives } from "vue";

import { vRipple } from "../../src/ripple";

const host = (value: unknown = true, style = "") =>
  mount(
    defineComponent({
      setup: () => () =>
        withDirectives(
          h("div", { "data-test": "host", style: `width:200px;height:100px;${style}` }, [
            h("button", { "data-test": "nested" }, "Nested"),
          ]),
          [[vRipple, value]],
        ),
    }),
    { attachTo: document.body },
  );

const element = (name: string) => document.querySelector<HTMLElement>(`[data-test=${name}]`)!;

const press = (target: HTMLElement, x: number, y: number) => {
  const rect = element("host").getBoundingClientRect();
  target.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      isPrimary: true,
      button: 0,
      clientX: rect.left + x,
      clientY: rect.top + y,
    }),
  );
};

const release = (target: HTMLElement) =>
  target.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, isPrimary: true }));

const container = () => element("host").querySelector<HTMLElement>(":scope > [data-slot=ripple]");
const waves = () => [...(container()?.children ?? [])] as HTMLElement[];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mediaMatching = (feature: string) =>
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) => ({ matches: query.includes(feature), media: query }) as MediaQueryList,
  );

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

it("adds a clipped container and a growing wave on press", () => {
  host();
  press(element("host"), 50, 50);

  const box = container()!;
  expect(box.getAttribute("aria-hidden")).toBe("true");
  expect(box.style.position).toBe("absolute");
  expect(box.style.inset).toBe("0px");
  expect(box.style.overflow).toBe("hidden");
  expect(box.style.pointerEvents).toBe("none");
  expect(box.style.borderRadius).toBe("inherit");
  expect(element("host").style.position).toBe("relative");
  expect(waves()).toHaveLength(1);
  expect(waves()[0]!.getAnimations()).toHaveLength(1);
});

it("grows from the press point towards the centre", () => {
  host();
  press(element("host"), 50, 50);

  const [grow] = waves()[0]!.getAnimations();
  const keyframes = (grow!.effect as KeyframeEffect).getKeyframes();
  expect(keyframes[0]!.transform).toBe("translate(30px, 30px) scale(1)");
  expect(String(keyframes[1]!.transform)).toMatch(/^translate\(80px, 30px\) scale\(7\.7\d*\)$/);
});

it("reads its timing from custom properties at press time", () => {
  host(true, "--delta-ripple-grow-duration:123ms;--delta-ripple-easing:linear");
  press(element("host"), 50, 50);

  const timing = waves()[0]!.getAnimations()[0]!.effect!.getTiming();
  expect(timing.duration).toBe(123);
  expect(timing.easing).toBe("linear");
});

it("holds a short press for its minimum, then fades and removes the wave", async () => {
  host(true, "--delta-ripple-fade-duration:20ms");
  press(element("host"), 50, 50);
  release(element("host"));

  expect(waves()).toHaveLength(1);
  await wait(400);
  expect(waves()).toHaveLength(0);
});

it("tints the wave through the directive options", () => {
  host({ color: "red", opacity: 0.3 });
  press(element("host"), 50, 50);

  const wave = waves()[0]!;
  expect(wave.style.getPropertyValue("--delta-ripple-color")).toBe("red");
  expect(wave.style.getPropertyValue("--delta-ripple-opacity")).toBe("0.3");
});

it("stays off when bound to false", () => {
  host(false);
  press(element("host"), 50, 50);
  expect(container()).toBeNull();
});

it("ignores presses that start on a nested control", () => {
  host();
  press(element("nested"), 10, 10);
  expect(waves()).toHaveLength(0);
});

it("ripples from the centre on keyboard activation", () => {
  host();
  element("host").click();

  const keyframes = (waves()[0]!.getAnimations()[0]!.effect as KeyframeEffect).getKeyframes();
  expect(keyframes[0]!.transform).toBe("translate(80px, 30px) scale(1)");
});

it("skips the grow animation under reduced motion", () => {
  mediaMatching("prefers-reduced-motion");
  host();
  press(element("host"), 50, 50);

  const wave = waves()[0]!;
  expect(wave.getAnimations()).toHaveLength(0);
  expect(wave.style.transform).toMatch(/^translate\(80px, 30px\) scale\(7\.7\d*\)$/);
});

it("draws nothing in forced colours", () => {
  mediaMatching("forced-colors");
  host();
  press(element("host"), 50, 50);
  expect(container()).toBeNull();
});

it("removes its container on unmount", () => {
  const wrapper = host();
  press(element("host"), 50, 50);
  const box = container()!;

  wrapper.unmount();
  expect(box.isConnected).toBe(false);
});

it("stops a wave's animation when the host unmounts mid-grow", () => {
  const wrapper = host();
  press(element("host"), 50, 50);
  const wave = waves()[0]!;
  const [grow] = wave.getAnimations();
  expect(grow!.playState).not.toBe("idle");

  wrapper.unmount();
  expect(wave.isConnected).toBe(false);
  expect(grow!.playState).toBe("idle");
});
