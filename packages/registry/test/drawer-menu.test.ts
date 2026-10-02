import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
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

import { wait } from "./pointer";

afterEach(() => {
  document.body.innerHTML = "";
});

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
  ["sm", 40],
  ["md", 48],
  ["lg", 56],
])("makes %s items %ipx tall", async (size, height) => {
  render(() => h(DrawerMenuItem, () => "Open"), { size });
  await settle();
  expect(slot("drawer-menu-item")!.getBoundingClientRect().height).toBe(height);
  expect(slot("drawer-menu")!.dataset.size).toBe(size);
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
