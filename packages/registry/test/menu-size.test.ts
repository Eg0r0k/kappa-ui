import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h } from "vue";

import {
  Menu,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "@/ui/menu";
import type { MenuSize } from "@/ui/menu";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

const settle = () => new Promise((resolve) => setTimeout(resolve, 200));
const query = (selector: string) => document.querySelector(selector) as HTMLElement;
const minHeight = (selector: string) => getComputedStyle(query(selector)).minHeight;

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
});

const openMenu = async (size?: MenuSize, subSize?: MenuSize) => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h("button", [
          "Open",
          h(Menu, { size }, () => [
            h(MenuLabel, () => "Account"),
            h(MenuItem, () => "Profile"),
            h(MenuRadioGroup, { modelValue: "list" }, () => [h(MenuRadioItem, { value: "list" }, () => "List")]),
            h(MenuSub, () => [
              h(MenuSubTrigger, () => "More"),
              h(MenuSubContent, { size: subSize }, () => h(MenuItem, { class: "sub-item" }, () => "Email")),
            ]),
          ]),
        ]),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  await userEvent.click(wrapper.get("button").element);
  await settle();
};

const openSubmenu = async () => {
  await userEvent.hover(query("[data-slot=menu-sub-trigger]"));
  await settle();
};

describe("menu sizes", () => {
  it.each([
    ["xs", 28, 14],
    ["sm", 32, 16],
    ["md", 36, 16],
    ["lg", 40, 20],
    ["xl", 48, 20],
  ] as const)("%s items are %ipx tall with %ipx indicators", async (size, itemHeight, icon) => {
    await openMenu(size);
    await Promise.all(document.getAnimations().map((animation) => animation.finished));

    expect(query("[data-slot=menu]").dataset.size).toBe(size);
    expect(minHeight("[data-slot=menu-item]")).toBe(`${itemHeight}px`);
    expect(query("[data-slot=menu-radio-item] > span").getBoundingClientRect().width).toBe(icon);
  });

  it("defaults to md, and a submenu follows its parent unless it has its own size", async () => {
    await openMenu();
    expect(query("[data-slot=menu]").dataset.size).toBe("md");
    unmount?.();

    await openMenu("xs");
    await openSubmenu();
    expect(query("[data-slot=menu-sub-content]").dataset.size).toBe("xs");
    expect(minHeight(".sub-item")).toBe("28px");
    unmount?.();

    await openMenu("xs", "xl");
    await openSubmenu();
    expect(minHeight(".sub-item")).toBe("48px");
  });

  it("rounds items with the radius tokens: md for xs, lg for every other size", async () => {
    for (const [size, radius] of [
      ["xs", "6.4px"],
      ["sm", "8px"],
      ["md", "8px"],
      ["xl", "8px"],
    ] as const) {
      await openMenu(size);
      expect(getComputedStyle(query("[data-slot=menu-item]")).borderRadius, size).toBe(radius);
      unmount?.();
      document.body.innerHTML = "";
    }
  });
});

describe("menu control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("%s items read the height, padding, icon and gap tokens", async (size) => {
    await openMenu(size);
    const item = getComputedStyle(query("[data-slot=menu-item]"));

    expect(px(item.minHeight)).toBe(sentinel.height[size]);
    expect(px(item.paddingInlineStart)).toBe(sentinel.padding[size]);
    expect(px(item.getPropertyValue("--menu-icon"))).toBe(sentinel.icon[size]);
    expect(px(item.columnGap)).toBe(sentinel.gap[size]);
  });

  it.each(controlSizes)("%s inset, indicator and icon items start their labels in one column", async (size) => {
    const label = (text: string) => h("span", { class: "label" }, text);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("button", [
            "Open",
            h(Menu, { size }, () => [
              h(MenuItem, () => [h("svg", { viewBox: "0 0 24 24" }), label("Icon")]),
              h(MenuItem, { inset: true }, () => label("Inset")),
              h(MenuRadioGroup, { modelValue: "list" }, () => [
                h(MenuRadioItem, { value: "list" }, () => label("Radio")),
              ]),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );
    unmount = () => wrapper.unmount();
    await userEvent.click(wrapper.get("button").element);
    await settle();

    const starts = [...document.querySelectorAll(".label")].map((element) => element.getBoundingClientRect().left);
    expect(new Set(starts).size).toBe(1);
  });
});
