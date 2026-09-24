import { expect, it } from "vitest";

import { getOverflowEdges } from "@/ui/scroll-area";

it("marks neither edge when the content fits", () => {
  expect(getOverflowEdges(0, 300, 300)).toEqual({ start: false, end: false });
});

it("marks only the end when at the start", () => {
  expect(getOverflowEdges(0, 1000, 300)).toEqual({ start: false, end: true });
});

it("marks both edges in the middle", () => {
  expect(getOverflowEdges(350, 1000, 300)).toEqual({ start: true, end: true });
});

it("marks only the start at the max position", () => {
  expect(getOverflowEdges(700, 1000, 300)).toEqual({ start: true, end: false });
});

it("marks only the start half a pixel before the max position", () => {
  expect(getOverflowEdges(699.5, 1000, 300)).toEqual({ start: true, end: false });
});
