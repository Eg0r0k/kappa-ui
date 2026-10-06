import { enableAutoUnmount, mount } from "@vue/test-utils";
import { ConfigProvider } from "reka-ui";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { h } from "vue";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/ui/menubar";
import type { MenubarSize } from "@/ui/menubar";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";
import { fileMenu, openMenus, parkPointer, q, renderMenubar, settle, trigger, viewMenu } from "./menubar-fixture";

enableAutoUnmount(afterEach);
beforeEach(parkPointer);

const sized = (root: Record<string, unknown>, content: Record<string, unknown> = {}, subSize?: MenubarSize) =>
  mount(
    {
      render: () =>
        h(Menubar, { "aria-label": "App", ...root }, () => [
          h(MenubarMenu, () => [
            h(MenubarTrigger, () => "File"),
            h(MenubarContent, content, () => [
              h(MenubarItem, () => "New"),
              h(MenubarSub, () => [
                h(MenubarSubTrigger, () => "Share"),
                h(MenubarSubContent, { size: subSize }, () => h(MenubarItem, { class: "sub-item" }, () => "Email")),
              ]),
            ]),
          ]),
        ]),
    },
    { attachTo: document.body },
  );

const openSub = async () => {
  await userEvent.click(trigger("File"));
  await settle();
  await userEvent.hover(q("[data-slot=menubar-sub-trigger]")!);
  await settle();
};

describe("menubar sizes", () => {
  it.each([
    ["xs", 28],
    ["sm", 32],
    ["md", 36],
    ["lg", 40],
    ["xl", 48],
  ] as const)("%s triggers are %ipx tall and menus follow the bar", async (size, height) => {
    sized({ size });
    expect(q("[data-slot=menubar]")!.dataset.size).toBe(size);
    expect(trigger("File").getBoundingClientRect().height).toBe(height);
    await openSub();
    expect(q("[data-slot=menubar-content]")!.dataset.size).toBe(size);
    expect(q("[data-slot=menubar-sub-content]")!.dataset.size).toBe(size);
    expect(getComputedStyle(q("[data-slot=menubar-item]")!).minHeight).toBe(`${height}px`);
  });

  it("follows Button's type scale and corners on triggers", () => {
    for (const [size, font, radius] of [
      ["xs", "label-sm", "md"],
      ["sm", "label-md", "lg"],
      ["md", "label-lg", "lg"],
      ["xl", "title-md", "xl"],
    ] as const) {
      const wrapper = sized({ size });
      const style = getComputedStyle(trigger("File"));
      const probe = document.createElement("span");
      probe.className = `text-${font} rounded-${radius}`;
      document.body.append(probe);
      expect(style.fontSize, size).toBe(getComputedStyle(probe).fontSize);
      expect(style.borderRadius, size).toBe(getComputedStyle(probe).borderRadius);
      probe.remove();
      wrapper.unmount();
    }
  });

  it("lets a menu and a submenu take their own size", async () => {
    sized({ size: "xs" }, { size: "lg" }, "xl");
    await openSub();
    expect(q("[data-slot=menubar-content]")!.dataset.size).toBe("lg");
    expect(getComputedStyle(q("[data-slot=menubar-item]")!).minHeight).toBe("40px");
    expect(getComputedStyle(q(".sub-item")!).minHeight).toBe("48px");
  });
});

describe("menubar control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("%s triggers read the height, padding, icon and gap tokens", (size) => {
    mount(
      {
        render: () =>
          h(Menubar, { "aria-label": "App", size }, () =>
            h(MenubarMenu, () => [
              h(MenubarTrigger, () => [h("svg", { viewBox: "0 0 24 24" }), "File"]),
              h(MenubarContent, () => h(MenubarItem, () => "New")),
            ]),
          ),
      },
      { attachTo: document.body },
    );
    const style = getComputedStyle(trigger("File"));
    expect(px(style.height)).toBe(sentinel.height[size]);
    expect(px(style.paddingInlineStart)).toBe(sentinel.padding[size]);
    expect(px(style.columnGap)).toBe(sentinel.gap[size]);
    expect(trigger("File").querySelector("svg")!.getBoundingClientRect().width).toBe(sentinel.icon[size]);
  });
});

describe("menubar variants", () => {
  it.each([
    ["outline", "1px", true],
    ["soft", "0px", true],
    ["ghost", "0px", false],
  ] as const)("draws the %s bar", (variant, border, filled) => {
    renderMenubar({ root: { variant } });
    const bar = q("[data-slot=menubar]")!;
    const style = getComputedStyle(bar);
    expect(bar.dataset.variant).toBe(variant);
    expect(style.borderTopWidth).toBe(border);
    expect(style.backgroundColor !== "rgba(0, 0, 0, 0)").toBe(filled);
  });

  it("defaults to outline and gives the soft bar the muted surface", () => {
    renderMenubar({ root: { variant: "soft" } });
    const probe = document.createElement("div");
    probe.className = "bg-muted";
    document.body.append(probe);
    expect(getComputedStyle(q("[data-slot=menubar]")!).backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
  });

  it("shows the open menu's trigger with a state layer", async () => {
    renderMenubar();
    const file = trigger("File");
    expect(getComputedStyle(file, "::before").opacity).toBe("0");
    await userEvent.click(file);
    await settle();
    await parkPointer();
    await expect.poll(() => getComputedStyle(file, "::before").opacity).toBe("0.08");
  });
});

describe("menubar geometry", () => {
  it("opens 4px under the trigger, aligned to its start", async () => {
    renderMenubar();
    await userEvent.click(trigger("Edit"));
    await settle();
    const box = trigger("Edit").getBoundingClientRect();
    const menu = q("[data-slot=menubar-content]")!.getBoundingClientRect();
    expect(Math.round(menu.top - box.bottom)).toBe(4);
    expect(Math.round(menu.left)).toBe(Math.round(box.left));
  });

  // nuxt/ui#6449: a long menu scrolls inside the viewport instead of being clipped
  it("caps a long menu to the space below and scrolls it", async () => {
    await page.viewport(800, 320);
    try {
      mount(
        {
          render: () =>
            h(Menubar, { "aria-label": "App" }, () =>
              h(MenubarMenu, () => [
                h(MenubarTrigger, () => "Recent"),
                h(MenubarContent, () =>
                  Array.from({ length: 30 }, (_, index) => h(MenubarItem, () => `File ${index + 1}`)),
                ),
              ]),
            ),
        },
        { attachTo: document.body },
      );
      await userEvent.click(trigger("Recent"));
      await settle();
      const menu = q("[data-slot=menubar-content]")!;
      expect(menu.getBoundingClientRect().bottom).toBeLessThanOrEqual(320);
      expect(menu.scrollHeight).toBeGreaterThan(menu.clientHeight);
    } finally {
      await page.viewport(414, 896);
    }
  });
});

describe("menubar in right-to-left", () => {
  const rtl = () =>
    mount(
      {
        render: () =>
          h(ConfigProvider, { dir: "rtl" }, () =>
            h("div", { dir: "rtl", class: "flex justify-center" }, [
              h(Menubar, { "aria-label": "App" }, () => [fileMenu(), viewMenu()]),
            ]),
          ),
      },
      { attachTo: document.body },
    );

  it("runs the arrows the other way and aligns menus to the trigger's right edge", async () => {
    rtl();
    expect(q("[data-slot=menubar]")!.getAttribute("dir")).toBe("rtl");
    trigger("File").focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(trigger("View"));
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await settle();
    expect(openMenus()).toEqual([trigger("File").id]);
    const box = trigger("File").getBoundingClientRect();
    const menu = q("[data-slot=menubar-content]")!.getBoundingClientRect();
    expect(Math.abs(menu.right - box.right)).toBeLessThanOrEqual(1);

    await userEvent.keyboard("{ArrowLeft}");
    await settle();
    expect(openMenus()).toEqual([trigger("View").id]);
  });

  it("opens submenus with ArrowLeft and flips their chevron", async () => {
    rtl();
    trigger("File").focus();
    await userEvent.keyboard("{Enter}");
    await settle();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await userEvent.keyboard("{ArrowLeft}");
    await settle();
    expect(q("[data-slot=menubar-sub-content]")).not.toBeNull();
    const chevron = q("[data-slot=menubar-sub-trigger] svg")!;
    expect(getComputedStyle(chevron).rotate).toBe("180deg");
    expect(q("[data-slot=menubar-shortcut]")!.getAttribute("dir")).toBe("ltr");
  });
});
