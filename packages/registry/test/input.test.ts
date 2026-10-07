import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { Input } from "@/ui/input";
import { InputFloating } from "@/ui/input-floating";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

afterEach(() => {
  document.body.innerHTML = "";
});

const style = (slot: string) => getComputedStyle(document.querySelector(`[data-slot=${slot}]`)!);

describe("Input control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("%s reads its height and padding tokens", (size) => {
    mount(Input, { props: { size }, attrs: { "aria-label": "Name" }, attachTo: document.body });

    expect(px(style("input").height)).toBe(sentinel.height[size]);
    expect(px(style("input").paddingInlineStart)).toBe(sentinel.padding[size]);
  });
});

describe("InputFloating control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("outline %s reads its height and puts the text and label at the padding", (size) => {
    mount(InputFloating, { props: { label: "Email", size, variant: "outline" }, attachTo: document.body });

    expect(px(style("input-floating").height)).toBe(sentinel.height[size]);
    expect(px(style("input-floating-input").paddingInlineStart)).toBe(sentinel.padding[size]);
    expect(px(style("input-floating-label").insetInlineStart)).toBe(sentinel.padding[size]);
  });
});
