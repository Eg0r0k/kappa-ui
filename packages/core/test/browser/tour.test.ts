import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";

import { type TourStep, type UseTourOptions, useTour } from "../../src/tour";

const stops: (() => void)[] = [];
afterEach(() => stops.splice(0).forEach((stop) => stop()));

const create = <T extends TourStep>(steps: T[] | (() => T[]), options?: UseTourOptions) => {
  const scope = effectScope();
  const tour = scope.run(() => useTour(steps, options))!;
  stops.push(() => scope.stop());
  return tour;
};

const element = (id: string, tag = "div") => {
  const node = document.createElement(tag);
  node.id = id;
  document.body.append(node);
  return node;
};

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe("useTour", () => {
  it("walks the steps and finishes after the last", () => {
    const tour = create([{ title: "a" }, { title: "b" }]);
    expect(tour.open.value).toBe(false);

    tour.start();
    expect([tour.open.value, tour.index.value, tour.current.value?.title]).toEqual([true, 0, "a"]);
    expect([tour.hasPrev.value, tour.hasNext.value, tour.total.value]).toEqual([false, true, 2]);

    tour.next();
    expect([tour.index.value, tour.hasPrev.value, tour.hasNext.value]).toEqual([1, true, false]);
    tour.prev();
    tour.prev();
    expect(tour.index.value).toBe(0);

    tour.goTo(1);
    tour.next();
    expect(tour.open.value).toBe(false);
  });

  it("loops back to the first step", () => {
    const tour = create([{}, {}], { loop: true });
    tour.start(1);
    tour.next();
    expect([tour.open.value, tour.index.value]).toEqual([true, 0]);
  });

  it("starts at initialStep and clamps the index", () => {
    const tour = create([{}, {}, {}], { initialStep: 2 });
    tour.start();
    expect(tour.index.value).toBe(2);
    tour.goTo(10);
    expect(tour.index.value).toBe(2);
    tour.goTo(-3);
    expect(tour.index.value).toBe(0);
  });

  it("never opens without steps and closes when they run out", async () => {
    const steps = ref<TourStep[]>([{}]);
    const tour = create(() => steps.value);
    tour.start();
    steps.value = [];
    await nextTick();
    expect(tour.open.value).toBe(false);
    tour.start();
    expect(tour.open.value).toBe(false);
  });

  it("resolves ids, selectors, elements and getters", () => {
    const a = element("tour-a");
    const b = element("tour-b");
    b.className = "tour-b";
    const later = ref<HTMLElement>();
    const tour = create([{ target: "tour-a" }, { target: ".tour-b" }, { target: b }, { target: () => later.value }], {
      scrollIntoView: false,
    });

    expect(tour.reference.value).toBeUndefined();
    tour.start();
    expect(tour.reference.value).toBe(a);
    tour.next();
    expect(tour.reference.value).toBe(b);
    tour.next();
    expect(tour.reference.value).toBe(b);
    tour.next();
    expect(tour.centered.value).toBe(true);
    later.value = a;
    expect(tour.reference.value).toBe(a);
    expect(tour.centered.value).toBe(false);
  });

  it("reads a plain word as an id, never as a tag", () => {
    element("tour-header-tag-test", "header");
    const tour = create([{ target: "header" }], { scrollIntoView: false });
    tour.start();
    expect(tour.centered.value).toBe(true);
  });

  it("centres a step without a target, and warns about one whose target is missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const tour = create([{ target: null }, { target: "#tour-nowhere" }, { target: "[[" }], { scrollIntoView: false });

    tour.start();
    await settle();
    const rect = tour.reference.value!.getBoundingClientRect();
    expect([rect.x, rect.y, rect.width, rect.height]).toEqual([innerWidth / 2, innerHeight / 2, 0, 0]);
    expect(tour.centered.value).toBe(true);
    expect(warn).not.toHaveBeenCalled();

    tour.next();
    await settle();
    expect(tour.centered.value).toBe(true);
    expect(warn).toHaveBeenLastCalledWith(expect.stringContaining("#tour-nowhere"));

    tour.next();
    await settle();
    expect(warn).toHaveBeenLastCalledWith(expect.stringContaining("[["));
  });

  it("scrolls each target into view, and not a centred step", async () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});
    const a = element("tour-scroll-a");
    const b = element("tour-scroll-b");
    const tour = create([{ target: a }, { target: b }, { target: null }]);

    tour.start();
    await settle();
    expect(scroll).toHaveBeenLastCalledWith({ behavior: "smooth", block: "center" });
    expect(scroll.mock.contexts.at(-1)).toBe(a);
    tour.next();
    await settle();
    expect(scroll.mock.contexts.at(-1)).toBe(b);
    tour.next();
    await settle();
    expect(scroll).toHaveBeenCalledTimes(2);
  });

  it("takes scroll options, or none", async () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});
    const a = element("tour-options-a");
    create([{ target: a }], { scrollIntoView: false }).start();
    await settle();
    expect(scroll).not.toHaveBeenCalled();
    create([{ target: a }], { scrollIntoView: { block: "start" } }).start();
    await settle();
    expect(scroll).toHaveBeenCalledWith({ block: "start" });
  });
});
