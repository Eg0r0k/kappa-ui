import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h } from "vue";

import type { MenuSize } from "@/lib/menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Menu, MenuItem } from "@/ui/menu";

const settle = () => new Promise((resolve) => setTimeout(resolve, 200));
const query = (selector: string) => document.querySelector(selector) as HTMLElement;
const minHeight = (selector: string) => getComputedStyle(query(selector)).minHeight;

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  document.body.innerHTML = "";
});

const openDropdown = async (size?: MenuSize, subSize?: MenuSize) => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(DropdownMenu, () => [
          h(DropdownMenuTrigger, () => "Open"),
          h(DropdownMenuContent, { size }, () => [
            h(DropdownMenuLabel, () => "Account"),
            h(DropdownMenuItem, () => "Profile"),
            h(DropdownMenuRadioGroup, { modelValue: "list" }, () => [h(DropdownMenuRadioItem, { value: "list" }, () => "List")]),
            h(DropdownMenuSub, () => [
              h(DropdownMenuSubTrigger, () => "More"),
              h(DropdownMenuSubContent, { size: subSize }, () => h(DropdownMenuItem, { class: "sub-item" }, () => "Email")),
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
  await userEvent.hover(query("[data-slot=dropdown-menu-sub-trigger]"));
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
    await openDropdown(size);

    expect(query("[data-slot=dropdown-menu-content]").dataset.size).toBe(size);
    expect(minHeight("[data-slot=dropdown-menu-item]")).toBe(`${itemHeight}px`);
    expect(query("[data-slot=dropdown-menu-radio-item] > span").getBoundingClientRect().width).toBe(icon);
  });

  it("defaults to md, and a submenu follows its parent unless it has its own size", async () => {
    await openDropdown();
    expect(query("[data-slot=dropdown-menu-content]").dataset.size).toBe("md");
    unmount?.();

    await openDropdown("xs");
    await openSubmenu();
    expect(query("[data-slot=dropdown-menu-sub-content]").dataset.size).toBe("xs");
    expect(minHeight(".sub-item")).toBe("28px");
    unmount?.();

    await openDropdown("xs", "xl");
    await openSubmenu();
    expect(minHeight(".sub-item")).toBe("48px");
  });

  it("sizes the Quasar-style menu", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () => h("button", ["Open", h(Menu, { size: "lg" }, () => h(MenuItem, () => "Rename"))]),
      }),
      { attachTo: document.body },
    );
    unmount = () => wrapper.unmount();
    await userEvent.click(wrapper.get("button").element);
    await settle();

    expect(query("[data-slot=menu]").dataset.size).toBe("lg");
    expect(minHeight("[data-slot=menu-item]")).toBe("40px");
  });

  it("rounds items with the radius tokens: md for xs, lg for every other size", async () => {
    for (const [size, radius] of [["xs", "10px"], ["sm", "12px"], ["md", "12px"], ["xl", "12px"]] as const) {
      await openDropdown(size);
      expect(getComputedStyle(query("[data-slot=dropdown-menu-item]")).borderRadius, size).toBe(radius);
      unmount?.();
      document.body.innerHTML = "";
    }
  });
});
