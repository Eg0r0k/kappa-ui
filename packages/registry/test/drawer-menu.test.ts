import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { type VNodeChild, h, nextTick } from "vue";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/ui/drawer";
import {
  DrawerMenu,
  DrawerMenuCheckboxItem,
  DrawerMenuGroup,
  DrawerMenuItem,
  DrawerMenuLabel,
  DrawerMenuRadioGroup,
  DrawerMenuRadioItem,
  DrawerMenuSeparator,
  DrawerMenuSub,
  DrawerMenuSubContent,
  DrawerMenuSubTrigger,
} from "@/ui/drawer-menu";

import { type ControlSize, controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";
import { wait } from "./pointer";

const settle = async () => {
  await nextTick();
  await nextTick();
};

const render = (items: () => VNodeChild, menu: Record<string, unknown> = {}) =>
  mount(
    {
      render: () =>
        h(Drawer, { open: true }, () =>
          h(DrawerContent, () => [h(DrawerHeader, () => h(DrawerTitle, () => "File")), h(DrawerMenu, menu, items)]),
        ),
    },
    { attachTo: document.body },
  );

const slot = (name: string) => document.querySelector<HTMLElement>(`[data-slot=${name}]`);

const probe = (className: string) => {
  const element = document.createElement("span");
  element.className = className;
  document.body.append(element);
  const color = getComputedStyle(element).color;
  element.remove();
  return color;
};

const everything = () => [
  h(DrawerMenuLabel, () => "File"),
  h(DrawerMenuGroup, () => [
    h(DrawerMenuItem, () => "Open"),
    h(DrawerMenuItem, { variant: "destructive" }, () => "Delete"),
  ]),
  h(DrawerMenuSeparator),
  h(DrawerMenuCheckboxItem, { modelValue: true }, () => "Starred"),
  h(DrawerMenuRadioGroup, { modelValue: "name" }, () => h(DrawerMenuRadioItem, { value: "name" }, () => "Name")),
  h(DrawerMenuSub, () => [
    h(DrawerMenuSubTrigger, () => "Share"),
    h(DrawerMenuSubContent, () => [h(DrawerMenuItem, () => "Mail"), h(DrawerMenuItem, () => "Messages")]),
  ]),
];

it("puts a data-slot on every part", async () => {
  render(everything);
  await settle();
  for (const name of [
    "drawer-menu",
    "drawer-menu-label",
    "drawer-menu-group",
    "drawer-menu-item",
    "drawer-menu-separator",
    "drawer-menu-checkbox-item",
    "drawer-menu-radio-group",
    "drawer-menu-radio-item",
    "drawer-menu-item-indicator",
    "drawer-menu-sub-trigger",
  ]) {
    expect(slot(name), name).not.toBeNull();
  }
  slot("drawer-menu-sub-trigger")!.click();
  await settle();
  expect(slot("drawer-menu-sub-content")).not.toBeNull();
  expect(slot("drawer-menu-back")!.textContent?.trim()).toBe("Share");
});

it.each([
  ["xs", 36, 10, 14],
  ["sm", 40, 12, 16],
  ["md", 48, 16, 20],
  ["lg", 56, 16, 24],
  ["xl", 64, 20, 24],
])("makes %s items %ipx tall, padded %ipx, with %ipx icons", async (size, height, padding, icon) => {
  render(() => h(DrawerMenuItem, () => [h("svg", { viewBox: "0 0 24 24" }), "Open"]), { size });
  await settle();
  const item = slot("drawer-menu-item")!;
  const style = getComputedStyle(item);
  expect(item.getBoundingClientRect().height).toBe(height);
  expect([px(style.paddingInlineStart), px(style.columnGap)]).toEqual([padding, padding]);
  expect(item.querySelector("svg")!.getBoundingClientRect().width).toBe(icon);
  expect(slot("drawer-menu")!.dataset.size).toBe(size);
});

it("defaults to md", async () => {
  render(() => h(DrawerMenuItem, () => "Open"));
  await settle();
  expect(slot("drawer-menu")!.dataset.size).toBe("md");
  expect(slot("drawer-menu-item")!.getBoundingClientRect().height).toBe(48);
});

describe("drawer menu control tokens", () => {
  overrideControlTokens();

  const room = {
    xs: { height: 8, padding: 2, icon: 0 },
    sm: { height: 8, padding: 2, icon: 0 },
    md: { height: 12, padding: 4, icon: 4 },
    lg: { height: 16, padding: 4, icon: 4 },
    xl: { height: 16, padding: 4, icon: 4 },
  } satisfies Record<ControlSize, Record<string, number>>;

  it.each(controlSizes)("%s items add room for a thumb to the control height, padding and icon", async (size) => {
    render(() => h(DrawerMenuItem, () => [h("svg", { viewBox: "0 0 24 24" }), "Open"]), { size });
    await settle();
    const element = slot("drawer-menu-item")!;
    const item = getComputedStyle(element);

    expect(px(item.minHeight)).toBe(sentinel.height[size] + room[size].height);
    expect(px(item.paddingInlineStart)).toBe(sentinel.padding[size] + room[size].padding);
    expect(px(item.columnGap)).toBe(sentinel.padding[size] + room[size].padding);
    expect(element.querySelector("svg")!.getBoundingClientRect().width).toBe(sentinel.icon[size] + room[size].icon);
  });
});

it("colours a destructive item", async () => {
  render(() => h(DrawerMenuItem, { variant: "destructive" }, () => "Delete"));
  await settle();
  expect(getComputedStyle(slot("drawer-menu-item")!).color).toBe(probe("text-destructive"));
});

it("slides between panels and follows the visible one's height", async () => {
  render(everything);
  await wait(500);
  const menu = slot("drawer-menu")!;
  slot("drawer-menu-sub-trigger")!.click();
  await settle();
  const sub = slot("drawer-menu-sub-content")!;
  expect(sub.dataset.motion).toBe("from-end");
  expect(sub.getAnimations().map((animation) => (animation as CSSAnimation).animationName)).toContain(
    "kappa-drawer-menu-from-end",
  );
  await wait(500);
  expect(Math.round(menu.getBoundingClientRect().height)).toBe(Math.round(sub.getBoundingClientRect().height));
  slot("drawer-menu-back")!.click();
  await settle();
  expect(sub.dataset.motion).toBe("to-end");
  await wait(500);
  expect(slot("drawer-menu-sub-content")).toBeNull();
});

it("does not scroll while a taller panel leaves", async () => {
  render(() => [
    h(DrawerMenuItem, () => "Open"),
    h(DrawerMenuSub, () => [
      h(DrawerMenuSubTrigger, () => "Share"),
      h(DrawerMenuSubContent, () => Array.from({ length: 10 }, (_, index) => h(DrawerMenuItem, () => `Row ${index}`))),
    ]),
  ]);
  await wait(500);
  slot("drawer-menu-sub-trigger")!.click();
  await wait(500);
  slot("drawer-menu-back")!.click();
  await wait(80);
  const menu = slot("drawer-menu")!;
  expect(menu.scrollHeight).toBeGreaterThan(menu.clientHeight);
  expect(["clip", "hidden"]).toContain(getComputedStyle(menu).overflowY);
  await wait(500);
  expect(getComputedStyle(menu).overflowY).toBe("auto");
});

it("brings a long root back to where it was scrolled", async () => {
  render(() => [
    ...Array.from({ length: 20 }, (_, index) => h(DrawerMenuItem, () => `Row ${index}`)),
    h(DrawerMenuSub, () => [
      h(DrawerMenuSubTrigger, () => "Share"),
      h(DrawerMenuSubContent, () => h(DrawerMenuItem, () => "Mail")),
    ]),
  ]);
  await wait(500);
  const menu = slot("drawer-menu")!;
  menu.scrollTop = menu.scrollHeight;
  await wait(100);
  const scrolled = menu.scrollTop;
  expect(scrolled).toBeGreaterThan(0);
  slot("drawer-menu-sub-trigger")!.click();
  await wait(500);
  expect(menu.scrollTop).toBe(0);
  slot("drawer-menu-back")!.click();
  await wait(500);
  expect(menu.scrollTop).toBe(scrolled);
  expect(document.activeElement).toBe(slot("drawer-menu-sub-trigger"));
});
