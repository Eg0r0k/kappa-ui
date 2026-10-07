import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, nextTick } from "vue";

import AccordionDemo from "@/examples/accordion/AccordionDemo.vue";
import ButtonDemo from "@/examples/button/ButtonDemo.vue";
import CalendarDemo from "@/examples/calendar/CalendarDemo.vue";
import ComboboxClear from "@/examples/combobox/ComboboxClear.vue";
import CommandDemo from "@/examples/command/CommandDemo.vue";
import DrawerMenuDemo from "@/examples/drawer-menu/DrawerMenuDemo.vue";
import DrawerMenuSelection from "@/examples/drawer-menu/DrawerMenuSelection.vue";
import DrawerMenuSubmenus from "@/examples/drawer-menu/DrawerMenuSubmenus.vue";
import ItemDemo from "@/examples/item/ItemDemo.vue";
import ListboxDemo from "@/examples/listbox/ListboxDemo.vue";
import MenuCheckboxes from "@/examples/menu/MenuCheckboxes.vue";
import MenuDemo from "@/examples/menu/MenuDemo.vue";
import MenuRadioGroup from "@/examples/menu/MenuRadioGroup.vue";
import MenubarDemo from "@/examples/menubar/MenubarDemo.vue";
import NavigationMenuClickOnly from "@/examples/navigation-menu/NavigationMenuClickOnly.vue";
import RangeCalendarDemo from "@/examples/range-calendar/RangeCalendarDemo.vue";
import SelectDemo from "@/examples/select/SelectDemo.vue";
import TabsDemo from "@/examples/tabs/TabsDemo.vue";
import TagsInputDemo from "@/examples/tags-input/TagsInputDemo.vue";
import ToggleDemo from "@/examples/toggle/ToggleDemo.vue";
import ToggleGroupDemo from "@/examples/toggle-group/ToggleGroupDemo.vue";
import TreeComposition from "@/examples/tree/TreeComposition.vue";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});
enableAutoUnmount(afterEach);

const all = (slot: string) => [...document.querySelectorAll<HTMLElement>(`[data-slot=${slot}]`)];

const ripples = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  element.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      isPrimary: true,
      button: 0,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
    }),
  );
  return element.querySelector(":scope > [data-slot=ripple]") !== null;
};

const click = (slot: string, text?: string) => async () => {
  const target = all(slot).find((element) => !text || element.textContent?.includes(text));
  await userEvent.click(target!);
};

const cases: [example: Component, slots: string[], open?: () => Promise<void>][] = [
  [ButtonDemo, ["button"]],
  [ToggleDemo, ["toggle"]],
  [ToggleGroupDemo, ["toggle-group-item"]],
  [CalendarDemo, ["calendar-cell-trigger"]],
  [RangeCalendarDemo, ["range-calendar-cell-trigger"]],
  [TabsDemo, ["tabs-trigger"]],
  [AccordionDemo, ["accordion-trigger"]],
  [CommandDemo, ["command-item"]],
  [ListboxDemo, ["listbox-item"]],
  [TreeComposition, ["tree-item"]],
  [TagsInputDemo, ["tags-input-item-delete"]],
  [NavigationMenuClickOnly, ["navigation-menu-trigger", "navigation-menu-link"], click("navigation-menu-trigger")],
  [MenuDemo, ["menu-item", "menu-sub-trigger"], click("button")],
  [MenuCheckboxes, ["menu-checkbox-item"], click("button")],
  [MenuRadioGroup, ["menu-radio-item"], click("button")],
  [MenubarDemo, ["menubar-trigger", "menubar-item", "menubar-sub-trigger"], click("menubar-trigger", "File")],
  [MenubarDemo, ["menubar-checkbox-item"], click("menubar-trigger", "View")],
  [MenubarDemo, ["menubar-radio-item"], click("menubar-trigger", "Profiles")],
  [SelectDemo, ["select-item"], click("select-trigger")],
  [ComboboxClear, ["combobox-item", "combobox-cancel"], click("combobox-trigger")],
  [DrawerMenuDemo, ["drawer-menu-item"], click("drawer-trigger")],
  [DrawerMenuSubmenus, ["drawer-menu-sub-trigger"], click("drawer-trigger")],
  [DrawerMenuSelection, ["drawer-menu-checkbox-item", "drawer-menu-radio-item"], click("drawer-trigger")],
];

it.each(cases.map(([example, slots, open]) => [slots.join(", "), example, slots, open] as const))(
  "ripples on a press: %s",
  async (_, example, slots, open) => {
    const warn = vi.spyOn(console, "warn");
    mount(example, { attachTo: document.body });
    await open?.();
    for (const slot of slots) {
      await expect.poll(() => all(slot).length, { message: slot }).toBeGreaterThan(0);
      const enabled = all(slot).find((element) => !element.matches(":disabled, [data-disabled], [aria-disabled=true]"));
      expect(ripples(enabled!), slot).toBe(true);
    }
    expect(warn.mock.calls.flat().join("\n")).not.toContain("directive");
  },
);

it("ripples on an Item only when it is a link or a button", async () => {
  mount(ItemDemo, { attachTo: document.body });
  await nextTick();
  const [plain, link] = all("item");
  expect(plain!.tagName).toBe("DIV");
  expect(ripples(plain!)).toBe(false);
  expect(link!.tagName).toBe("A");
  expect(ripples(link!)).toBe(true);
});

it("stays still on a disabled item", async () => {
  mount(MenuCheckboxes, { attachTo: document.body });
  await click("button")();
  await expect.poll(() => all("menu-checkbox-item").length).toBeGreaterThan(0);
  const disabled = all("menu-checkbox-item").find((element) => element.hasAttribute("data-disabled"))!;
  expect(ripples(disabled)).toBe(false);
});
