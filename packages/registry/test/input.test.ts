import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick } from "vue";

import { Input } from "@/ui/input";
import { InputFloating } from "@/ui/input-floating";
import { Textarea } from "@/ui/textarea";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

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

describe("text control invalid look", () => {
  const colors = "--input: rgb(0, 0, 255); --primary: rgb(0, 128, 0); --destructive: rgb(255, 0, 0)";
  const settle = async (element: Element) => {
    await nextTick();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  };

  it.each([
    ["an outline Input", () => h(Input, { "aria-label": "Name", style: colors, required: true }), "input", "Top"],
    [
      "a filled Input",
      () => h(Input, { variant: "filled", "aria-label": "Name", style: colors, required: true }),
      "input",
      "Bottom",
    ],
    ["a Textarea", () => h(Textarea, { "aria-label": "Bio", style: colors, required: true }), "textarea", "Top"],
  ] as const)("keeps the destructive border on %s focused while :user-invalid", async (_, node, tag, side) => {
    const wrapper = mount(
      defineComponent(() => () => h("div", [node(), h("button", "after")])),
      {
        attachTo: document.body,
      },
    );
    const control = document.querySelector<HTMLInputElement>(tag)!;
    await userEvent.type(control, "a");
    await userEvent.clear(control);
    control.blur();
    control.focus();
    await settle(control);
    expect(control.matches(":user-invalid:focus-visible")).toBe(true);
    const look = getComputedStyle(control);
    expect(side === "Top" ? look.borderTopColor : look.borderBottomColor).toBe("rgb(255, 0, 0)");
    wrapper.unmount();
  });
});
