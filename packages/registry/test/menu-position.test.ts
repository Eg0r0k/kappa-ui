import { describe, expect, it } from "vitest";

import { parsePosition, placeMenu } from "@/ui/menu/position";

const viewport = { width: 1000, height: 800 };
const rect = { top: 100, bottom: 140, left: 200, right: 300 };
const place = (options: Partial<Parameters<typeof placeMenu>[0]> = {}) =>
  placeMenu({
    rect,
    width: 150,
    height: 120,
    anchor: parsePosition("bottom start", false),
    self: parsePosition("top start", false),
    offset: [0, 0],
    viewport,
    ...options,
  });

describe("parsePosition", () => {
  it("turns start and end into physical sides by reading direction", () => {
    expect(parsePosition("top start", false)).toEqual({ vertical: "top", horizontal: "left" });
    expect(parsePosition("top start", true)).toEqual({ vertical: "top", horizontal: "right" });
    expect(parsePosition("center end", true)).toEqual({ vertical: "center", horizontal: "left" });
    expect(parsePosition("bottom middle", true)).toEqual({ vertical: "bottom", horizontal: "middle" });
  });
});

describe("placeMenu", () => {
  it("meets the self point with the anchor point", () => {
    expect(place()).toMatchObject({ top: 140, left: 200, maxHeight: null, maxWidth: null });
    expect(
      place({ anchor: parsePosition("center middle", false), self: parsePosition("center middle", false) }),
    ).toMatchObject({
      top: 60,
      left: 175,
    });
    expect(place({ anchor: parsePosition("bottom end", false), self: parsePosition("top end", false) })).toMatchObject({
      top: 140,
      left: 150,
    });
  });

  it("pushes the menu away from the target by the offset", () => {
    expect(place({ offset: [8, 4] })).toMatchObject({ top: 144, left: 192 });
  });

  it("flips below when there is no room above", () => {
    expect(place({ anchor: parsePosition("top end", false), self: parsePosition("bottom end", false) })).toMatchObject({
      top: 140,
      left: 150,
      self: { vertical: "top", horizontal: "right" },
    });
  });

  it("flips to the side with more room and caps the height there", () => {
    const low = { top: 700, bottom: 740, left: 200, right: 300 };

    expect(place({ rect: low })).toMatchObject({
      top: 580,
      maxHeight: 700,
      self: { vertical: "bottom", horizontal: "left" },
    });
  });

  it("stays below and shrinks when below still has more room", () => {
    const tall = place({ rect: { top: 300, bottom: 340, left: 200, right: 300 }, height: 600 });

    expect(tall).toMatchObject({ top: 340, maxHeight: 460, self: { vertical: "top", horizontal: "left" } });
  });

  it("flips horizontally near the end edge", () => {
    const right = { top: 100, bottom: 140, left: 900, right: 980 };

    expect(place({ rect: right })).toMatchObject({ left: 830, self: { vertical: "top", horizontal: "right" } });
  });

  it("keeps a centred menu inside the viewport", () => {
    const edge = { top: 10, bottom: 10, left: 20, right: 20 };
    const centred = place({
      rect: edge,
      anchor: parsePosition("center middle", false),
      self: parsePosition("center middle", false),
    });

    expect(centred).toMatchObject({ top: 0, left: 0 });
  });
});
