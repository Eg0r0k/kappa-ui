import { describe, expect, it } from "vitest";

import {
  clamp,
  getDragMultiplier,
  getHorizontalPosition,
  getMinThumbSize,
  getPercentage,
  getThumbSize,
  getThumbStart,
} from "@/ui/scroll-area";

describe("clamp", () => {
  it("bounds a value on both sides", () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});

describe("getPercentage", () => {
  it("maps a position onto 0..1", () => {
    expect(getPercentage(0, 1200, 300)).toBe(0);
    expect(getPercentage(450, 1200, 300)).toBe(0.5);
    expect(getPercentage(900, 1200, 300)).toBe(1);
  });

  it("clamps a position past the end", () => {
    expect(getPercentage(5000, 1200, 300)).toBe(1);
  });

  it("returns 0 when there is nothing to scroll", () => {
    expect(getPercentage(0, 300, 300)).toBe(0);
    expect(getPercentage(0, 200, 300)).toBe(0);
  });

  it("rounds to four decimals", () => {
    expect(getPercentage(100, 1200, 300)).toBe(0.1111);
  });
});

describe("getMinThumbSize", () => {
  it("is a fifth of a short track", () => {
    expect(getMinThumbSize(200)).toBe(40);
  });

  it("is a flat 50 from 250 up", () => {
    expect(getMinThumbSize(250)).toBe(50);
    expect(getMinThumbSize(1000)).toBe(50);
  });
});

describe("getThumbSize", () => {
  it("is proportional to the visible fraction", () => {
    expect(getThumbSize(300, 1200)).toBe(75);
  });

  it("never goes below the minimum", () => {
    expect(getThumbSize(300, 100000)).toBe(50);
  });

  it("never exceeds the track", () => {
    expect(getThumbSize(300, 100)).toBe(300);
  });
});

describe("getThumbStart", () => {
  it("travels the track minus its own size", () => {
    expect(getThumbStart(0, 0, 300, 75)).toBe(0);
    expect(getThumbStart(0, 0.5, 300, 75)).toBe(112.5);
    expect(getThumbStart(0, 1, 300, 75)).toBe(225);
  });

  it("starts from the leading offset", () => {
    expect(getThumbStart(20, 0, 300, 75)).toBe(20);
  });
});

describe("getDragMultiplier", () => {
  it("converts thumb travel into content travel", () => {
    expect(getDragMultiplier(1200, 300, 300, 75)).toBe(4);
  });

  it("is 0 when the thumb fills the track", () => {
    expect(getDragMultiplier(1200, 300, 300, 300)).toBe(0);
  });
});

describe("getHorizontalPosition", () => {
  it("passes through in ltr and negates in rtl", () => {
    expect(getHorizontalPosition(250, false)).toBe(250);
    expect(getHorizontalPosition(250, true)).toBe(-250);
    expect(getHorizontalPosition(-250, true)).toBe(250);
  });
});
