import { describe, expect, it } from "vitest";

import {
  type TextControlSize,
  type TextControlVariant,
  textControlBase,
  textControlFrameVariant,
  textControlInnerText,
  textControlRadius,
  textControlSize,
  textControlText,
  textControlVariant,
} from "@/lib/text-control";

const variants: TextControlVariant[] = ["outline", "soft", "filled", "ghost", "subtle"];
const sizes: TextControlSize[] = ["xs", "sm", "md", "lg", "xl"];

const control = ":where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*)";
const open = ">[data-slot=input-group-control][data-state=open]";
const stateOrder = [
  ":focus-visible",
  "[aria-invalid=true]",
  "[aria-invalid=true]:focus-visible",
  ":user-invalid",
  ":user-invalid:focus-visible",
  ":disabled",
];

const hasSelectors = (classes: string) =>
  classes
    .trim()
    .split(/\s+/)
    .filter((token) => token.startsWith("has-["))
    .map((token) => token.slice("has-[".length, token.lastIndexOf("]:")));

const frameStates = (classes: string) => [
  ...new Set(
    hasSelectors(classes)
      .filter((selector) => selector !== open)
      .map((selector) => selector.slice(control.length)),
  ),
];

describe("text-control", () => {
  it("exports the five variants for a control and for a frame, and the five sizes", () => {
    expect(textControlBase).toContain("w-full");
    expect(Object.keys(textControlVariant)).toEqual(variants);
    expect(Object.keys(textControlFrameVariant)).toEqual(variants);
    expect(Object.keys(textControlSize)).toEqual(sizes);
    expect(Object.keys(textControlRadius)).toEqual(sizes);
    expect(Object.keys(textControlText)).toEqual(sizes);
    expect(textControlInnerText).toContain("--control-text");
  });

  it("rounds every variant from --frame-radius, which each size sets from its radius token", () => {
    for (const variant of variants) {
      expect(textControlVariant[variant]).toMatch(/rounded(-t)?-\(--frame-radius\)/);
      expect(textControlFrameVariant[variant]).toMatch(/rounded(-t)?-\(--frame-radius\)/);
    }
    for (const size of sizes) expect(textControlRadius[size]).toContain(`--radius-control-${size}`);
  });

  it("reads every frame state through one :where list, so they share a specificity", () => {
    for (const variant of variants) {
      const selectors = hasSelectors(textControlFrameVariant[variant]);
      expect(selectors.length, variant).toBeGreaterThan(0);
      expect(
        selectors.filter((selector) => selector !== open && !selector.startsWith(control)),
        variant,
      ).toEqual([]);
    }
  });

  it("lists the frame states focus first, then invalid, then user-invalid, then disabled", () => {
    for (const variant of variants) {
      const states = frameStates(textControlFrameVariant[variant]);
      expect(states, variant).toEqual(stateOrder.filter((state) => states.includes(state)));
      expect(states, variant).toEqual(expect.arrayContaining(stateOrder.slice(0, 5)));
    }
  });

  it("keeps a focused invalid control destructive in every variant", () => {
    for (const variant of variants) {
      expect(textControlVariant[variant], variant).toContain("aria-invalid:border-destructive");
      expect(textControlVariant[variant], variant).toContain("user-invalid:focus-visible:border-destructive");
    }
  });
});
