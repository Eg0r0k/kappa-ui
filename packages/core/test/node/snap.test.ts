import { describe, expect, it } from "vitest";

import { cycleSnapPoint, resolveSnapPoint, toPixels } from "../../src/snap";

describe("toPixels", () => {
  it.each([
    [0.5, 800, 400],
    [1, 800, 800],
    [0, 800, 0],
    [148, 800, 148],
    ["148px", 800, 148],
    ["1.5px", 800, 1.5],
    ["auto", 800, 0],
  ] as const)("%s of %d is %d", (point, viewport, expected) => {
    expect(toPixels(point, viewport)).toBe(expected);
  });
});

const points = [100, 200, 400];

describe("resolveSnapPoint", () => {
  it("settles on the nearest point when released slowly, ties going up", () => {
    expect(resolveSnapPoint(points, 260, 0)).toBe(1);
    expect(resolveSnapPoint(points, 320, 0.3)).toBe(2);
    expect(resolveSnapPoint(points, 150, -0.3)).toBe(1);
    expect(resolveSnapPoint(points, 149, 0)).toBe(0);
  });

  it("closes below half of the smallest point and otherwise returns to it", () => {
    expect(resolveSnapPoint(points, 40, 0)).toBeNull();
    expect(resolveSnapPoint(points, 60, 0)).toBe(0);
    expect(resolveSnapPoint(points, 40, 0, { dismissible: false })).toBe(0);
  });

  it("moves one point in the direction of travel above the step velocity", () => {
    expect(resolveSnapPoint(points, 100, 0.6)).toBe(1);
    expect(resolveSnapPoint(points, 130, 0.6)).toBe(1);
    expect(resolveSnapPoint(points, 230, 0.6)).toBe(2);
    expect(resolveSnapPoint(points, 400, 0.6)).toBe(2);
    expect(resolveSnapPoint(points, 400, -0.6)).toBe(1);
    expect(resolveSnapPoint(points, 230, -0.6)).toBe(1);
    expect(resolveSnapPoint(points, 100, -0.6)).toBeNull();
    expect(resolveSnapPoint(points, 100, -0.6, { dismissible: false })).toBe(0);
  });

  it("goes to the end on a fling, closing downwards only when dismissible", () => {
    expect(resolveSnapPoint(points, 100, 2.5)).toBe(2);
    expect(resolveSnapPoint(points, 400, -2.5)).toBeNull();
    expect(resolveSnapPoint(points, 400, -2.5, { dismissible: false })).toBe(0);
  });

  it("keeps a fling to one step with sequential", () => {
    expect(resolveSnapPoint(points, 100, 2.5, { sequential: true })).toBe(1);
    expect(resolveSnapPoint(points, 400, -2.5, { sequential: true })).toBe(1);
    expect(resolveSnapPoint(points, 100, -2.5, { sequential: true })).toBeNull();
  });

  it("clamps a sequential move to one step from the active point", () => {
    expect(resolveSnapPoint(points, 290, 2.5, { sequential: true, active: 0 })).toBe(1);
    expect(resolveSnapPoint(points, 390, 0, { sequential: true, active: 0 })).toBe(1);
    expect(resolveSnapPoint(points, 40, 0, { sequential: true, active: 2 })).toBe(1);
    expect(resolveSnapPoint(points, 40, 0, { sequential: true, active: 0 })).toBeNull();
  });

  it("returns null without points", () => {
    expect(resolveSnapPoint([], 10, 0)).toBeNull();
  });
});

describe("cycleSnapPoint", () => {
  it("moves to the next point and wraps", () => {
    expect(cycleSnapPoint([0.3, 0.6, 1], 0.3)).toBe(0.6);
    expect(cycleSnapPoint([0.3, 0.6, 1], 1)).toBe(0.3);
    expect(cycleSnapPoint(["100px", "200px"], "200px")).toBe("100px");
  });

  it("starts from the first point when the active one is unknown", () => {
    expect(cycleSnapPoint([0.3, 0.6], null)).toBe(0.3);
    expect(cycleSnapPoint([0.3, 0.6], 0.9)).toBe(0.3);
  });

  it("returns undefined without points", () => {
    expect(cycleSnapPoint([], null)).toBeUndefined();
  });
});
