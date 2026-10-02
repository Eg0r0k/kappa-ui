import { mount } from "@vue/test-utils";
import { DialogTitle } from "reka-ui";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNodeChild, defineComponent, h, nextTick, ref } from "vue";

import { DrawerContent, DrawerRoot } from "../../src/drawer";
import {
  DrawerMenu,
  DrawerMenuCheckboxItem,
  DrawerMenuGroup,
  DrawerMenuItem,
  DrawerMenuItemIndicator,
  DrawerMenuLabel,
  DrawerMenuRadioGroup,
  DrawerMenuRadioItem,
  DrawerMenuSeparator,
} from "../../src/drawer-menu";
import { pointer, wait } from "./pointer";

afterEach(() => {
  document.body.innerHTML = "";
});

const settle = async () => {
  await nextTick();
  await nextTick();
};

const render = (items: () => VNodeChild, menu: Record<string, unknown> = {}) => {
  const open = ref(true);
  mount(
    defineComponent({
      setup: () => () =>
        h(DrawerRoot, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
          h(DrawerContent, { style: "position: fixed; left: 0; bottom: 0; width: 320px; height: 400px" }, () => [
            h(DialogTitle, () => "File"),
            h(DrawerMenu, menu, items),
          ]),
        ),
    }),
    { attachTo: document.body },
  );
  return open;
};

const item = (text: string) =>
  [...document.querySelectorAll<HTMLElement>("[role^=menuitem]")].find((node) => node.textContent?.trim() === text)!;

const panels = () => [...document.querySelectorAll<HTMLElement>("[data-drawer-menu-panel]")];

const basic = () => [
  h(DrawerMenuItem, () => "Open"),
  h(DrawerMenuItem, () => "Rename"),
  h(DrawerMenuItem, { disabled: true }, () => "Archive"),
  h(DrawerMenuItem, () => "Delete"),
];

it("renders a menu panel labelled by the drawer title", async () => {
  render(() => [h(DrawerMenuLabel, () => "Actions"), h(DrawerMenuGroup, basic), h(DrawerMenuSeparator)]);
  await settle();
  const [panel] = panels();
  const title = document.querySelector("h2, [id^=reka-dialog-title]")!;
  expect(panel!.getAttribute("role")).toBe("menu");
  expect(panel!.getAttribute("aria-orientation")).toBe("vertical");
  expect(panel!.getAttribute("aria-labelledby")).toBe(title.id);
  expect(panel!.querySelector("[role=group]")).not.toBeNull();
  expect(panel!.querySelector("[role=separator]")!.getAttribute("aria-orientation")).toBe("horizontal");
  expect(item("Open").getAttribute("role")).toBe("menuitem");
  expect(item("Archive").getAttribute("aria-disabled")).toBe("true");
  expect(item("Archive").hasAttribute("data-disabled")).toBe(true);
});

it("moves focus with the arrow keys, Home and End, skipping disabled items", async () => {
  render(basic);
  await settle();
  item("Open").focus();
  await userEvent.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(item("Rename"));
  expect(item("Rename").hasAttribute("data-highlighted")).toBe(true);
  await userEvent.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(item("Delete"));
  await userEvent.keyboard("{Home}");
  expect(document.activeElement).toBe(item("Open"));
  await userEvent.keyboard("{End}");
  expect(document.activeElement).toBe(item("Delete"));
  await userEvent.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(item("Delete"));
});

it("wraps around with loop", async () => {
  render(basic, { loop: true });
  await settle();
  item("Delete").focus();
  await userEvent.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(item("Open"));
});

it.each([
  ["a click", async () => item("Open").click()],
  [
    "Enter",
    async () => {
      item("Open").focus();
      await userEvent.keyboard("{Enter}");
    },
  ],
  [
    "Space",
    async () => {
      item("Open").focus();
      await userEvent.keyboard(" ");
    },
  ],
])("closes the drawer when an item is chosen by %s", async (_, choose) => {
  const open = render(basic);
  await settle();
  await choose();
  await settle();
  expect(open.value).toBe(false);
});

it("emits a cancelable select and stays open when it is prevented", async () => {
  const events: Event[] = [];
  const open = render(() =>
    h(
      DrawerMenuItem,
      {
        onSelect: (event: Event) => {
          events.push(event);
          event.preventDefault();
        },
      },
      () => "Open",
    ),
  );
  await settle();
  item("Open").click();
  await settle();
  expect(events).toHaveLength(1);
  expect(events[0]!.cancelable).toBe(true);
  expect(open.value).toBe(true);
});

it("ignores a disabled item", async () => {
  const selected = vi.fn();
  const open = render(() => h(DrawerMenuItem, { disabled: true, onSelect: selected }, () => "Archive"));
  await settle();
  item("Archive").click();
  await settle();
  expect(selected).not.toHaveBeenCalled();
  expect(open.value).toBe(true);
});

it("ignores the click that ends a mouse drag of the drawer", async () => {
  const selected = vi.fn();
  const open = render(() => h(DrawerMenuItem, { onSelect: selected }, () => "Open"));
  await settle();
  const target = item("Open");
  const box = target.getBoundingClientRect();
  const x = box.x + 20;
  pointer("pointerdown", target, x, box.y + 5, "mouse");
  for (const distance of [10, 20, 30]) {
    await wait(30);
    pointer("pointermove", target, x, box.y + 5 + distance, "mouse");
  }
  await wait(30);
  pointer("pointerup", target, x, box.y + 35, "mouse");
  target.click();
  await settle();
  expect(selected).not.toHaveBeenCalled();
  expect(open.value).toBe(true);
});

it("highlights the item under a mouse and not the one under a touch", async () => {
  render(basic);
  await settle();
  const rename = item("Rename");
  const box = rename.getBoundingClientRect();
  pointer("pointermove", rename, box.x + 5, box.y + 5, "mouse");
  await settle();
  expect(rename.hasAttribute("data-highlighted")).toBe(true);
  expect(document.activeElement).toBe(rename);
  const first = item("Open");
  pointer("pointermove", first, box.x + 5, box.y - 5, "touch");
  await settle();
  expect(first.hasAttribute("data-highlighted")).toBe(false);
  rename.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
  await settle();
  expect(rename.hasAttribute("data-highlighted")).toBe(false);
});

it("toggles a checkbox item through v-model and reports its state", async () => {
  const checked = ref<boolean | "indeterminate">(false);
  const open = render(() =>
    h(
      DrawerMenuCheckboxItem,
      {
        modelValue: checked.value,
        "onUpdate:modelValue": (value: boolean | "indeterminate") => (checked.value = value),
        onSelect: (event: Event) => event.preventDefault(),
      },
      () => [h(DrawerMenuItemIndicator, () => "✓"), "Hidden files"],
    ),
  );
  await settle();
  const node = document.querySelector<HTMLElement>("[role=menuitemcheckbox]")!;
  expect(node.getAttribute("aria-checked")).toBe("false");
  expect(node.dataset.state).toBe("unchecked");
  expect(node.textContent).toBe("Hidden files");
  node.click();
  await settle();
  expect(checked.value).toBe(true);
  expect(node.getAttribute("aria-checked")).toBe("true");
  expect(node.dataset.state).toBe("checked");
  expect(node.textContent).toBe("✓Hidden files");
  expect(open.value).toBe(true);
  checked.value = "indeterminate";
  await settle();
  expect(node.getAttribute("aria-checked")).toBe("mixed");
  expect(node.dataset.state).toBe("indeterminate");
  node.click();
  await settle();
  expect(checked.value).toBe(true);
});

it("closes the drawer after a checkbox item toggles", async () => {
  const checked = ref<boolean | "indeterminate">(false);
  const open = render(() =>
    h(
      DrawerMenuCheckboxItem,
      {
        modelValue: checked.value,
        "onUpdate:modelValue": (value: boolean | "indeterminate") => (checked.value = value),
      },
      () => "Starred",
    ),
  );
  await settle();
  document.querySelector<HTMLElement>("[role=menuitemcheckbox]")!.click();
  await settle();
  expect(checked.value).toBe(true);
  expect(open.value).toBe(false);
});

it("selects a radio item of its group", async () => {
  const sort = ref("name");
  const open = render(() =>
    h(
      DrawerMenuRadioGroup,
      { modelValue: sort.value, "onUpdate:modelValue": (value: unknown) => (sort.value = String(value)) },
      () => [
        h(DrawerMenuRadioItem, { value: "name" }, () => [h(DrawerMenuItemIndicator, () => "•"), "Name"]),
        h(DrawerMenuRadioItem, { value: "date" }, () => [h(DrawerMenuItemIndicator, () => "•"), "Date"]),
      ],
    ),
  );
  await settle();
  const [name, date] = document.querySelectorAll<HTMLElement>("[role=menuitemradio]");
  expect(name!.closest("[role=group]")).not.toBeNull();
  expect(name!.getAttribute("aria-checked")).toBe("true");
  expect(name!.dataset.state).toBe("checked");
  expect(date!.getAttribute("aria-checked")).toBe("false");
  expect(name!.textContent).toBe("•Name");
  expect(date!.textContent).toBe("Date");
  date!.click();
  await settle();
  expect(sort.value).toBe("date");
  expect(open.value).toBe(false);
});

it("keeps a force-mounted indicator and marks its state", async () => {
  render(() =>
    h(DrawerMenuCheckboxItem, { modelValue: false }, () => [
      h(DrawerMenuItemIndicator, { forceMount: true, id: "indicator" }, () => "✓"),
      "Starred",
    ]),
  );
  await settle();
  expect(document.getElementById("indicator")!.dataset.state).toBe("unchecked");
});
