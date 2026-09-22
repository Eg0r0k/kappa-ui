import { expect, it } from "vitest";

import {
  getVirtualContainerStyle,
  getVirtualItemStyle,
  getVirtualWindow,
  getVisibleIndex,
  resolveVirtualCount,
  resolveVirtualizeOptions,
  toVirtualDirection,
} from "@/ui/scroll-area";

it("prefers itemsSize only when itemsFn supplies the data", () => {
  expect(resolveVirtualCount(3, 500, true)).toBe(500);
  expect(resolveVirtualCount(3, 500, false)).toBe(3);
  expect(resolveVirtualCount(3, undefined, true)).toBe(3);
  expect(resolveVirtualCount(3, -1, true)).toBe(3);
  expect(resolveVirtualCount(0, 0, true)).toBe(0);
});

it("derives the rendered window from the first and last slice", () => {
  const slices = [
    { index: 7, start: 168, end: 192 },
    { index: 8, start: 192, end: 216 },
    { index: 9, start: 216, end: 240 },
  ];

  expect(getVirtualWindow(slices)).toEqual({ from: 7, size: 3 });
  expect(getVirtualWindow([])).toEqual({ from: 0, size: 0 });
});

it("finds the first slice whose end passes the offset", () => {
  const slices = [
    { index: 0, start: 0, end: 24 },
    { index: 1, start: 24, end: 48 },
    { index: 2, start: 48, end: 72 },
  ];

  expect(getVisibleIndex(slices, 0)).toBe(0);
  expect(getVisibleIndex(slices, 24)).toBe(1);
  expect(getVisibleIndex(slices, 30)).toBe(1);
  expect(getVisibleIndex(slices, 71)).toBe(2);
  expect(getVisibleIndex(slices, 999)).toBe(2);
  expect(getVisibleIndex([], 10)).toBe(0);
});

it("maps the engine's scroll direction onto Quasar's names", () => {
  expect(toVirtualDirection("forward")).toBe("increase");
  expect(toVirtualDirection("backward")).toBe("decrease");
  expect(toVirtualDirection(null)).toBe("increase");
});

it("sizes the container on the virtualized axis only", () => {
  expect(getVirtualContainerStyle(4800, false, 300)).toEqual({
    position: "relative",
    width: "100%",
    height: "4800px",
  });
  expect(getVirtualContainerStyle(4800, true, 300)).toEqual({
    position: "relative",
    width: "4800px",
    height: "300px",
  });
});

it("positions vertical items by transform and horizontal ones logically", () => {
  expect(getVirtualItemStyle(240, false)).toEqual({
    position: "absolute",
    top: "0px",
    insetInlineStart: "0px",
    width: "100%",
    transform: "translateY(240px)",
  });
  expect(getVirtualItemStyle(240, true)).toEqual({
    position: "absolute",
    top: "0px",
    insetInlineStart: "240px",
    height: "100%",
  });
});

it("resolves virtualize options with Quasar-flavoured defaults", () => {
  const fromBoolean = resolveVirtualizeOptions(true);
  expect(fromBoolean.estimateSize(0)).toBe(24);
  expect(fromBoolean.overscan).toBe(4);
  expect(fromBoolean.lanes).toBe(1);
  expect(fromBoolean.gap).toBe(0);
  expect(fromBoolean.scrollMargin).toBe(0);
  expect(fromBoolean.getScrollElement).toBeUndefined();

  const fromObject = resolveVirtualizeOptions({
    estimateSize: 48,
    overscan: 10,
    lanes: 3,
    gap: 16,
    scrollMargin: 120,
  });
  expect(fromObject.estimateSize(7)).toBe(48);
  expect(fromObject.overscan).toBe(10);
  expect(fromObject.lanes).toBe(3);
  expect(fromObject.gap).toBe(16);
  expect(fromObject.scrollMargin).toBe(120);

  const fromFunction = resolveVirtualizeOptions({
    estimateSize: (index) => index * 2,
  });
  expect(fromFunction.estimateSize(5)).toBe(10);

  expect(resolveVirtualizeOptions(false).estimateSize(0)).toBe(24);
  expect(resolveVirtualizeOptions(undefined).overscan).toBe(4);
});
