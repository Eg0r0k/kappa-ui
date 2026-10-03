import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, h, nextTick } from "vue";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandLabel,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/ui/command";

enableAutoUnmount(afterEach);

const content = (onSelect: (value: string) => void = () => {}) => [
  h(CommandInput, { placeholder: "Search" }),
  h(CommandList, () => [
    h(CommandEmpty, () => "No results."),
    h(CommandGroup, () => [
      h(CommandLabel, () => "Fruits"),
      h(CommandItem, { value: "apple", onSelect: () => onSelect("apple") }, () => "Apple"),
      h(CommandItem, { value: "banana", onSelect: () => onSelect("banana") }, () => "Banana"),
    ]),
    h(CommandSeparator),
    h(CommandGroup, () => [
      h(CommandLabel, () => "Settings"),
      h(CommandItem, { value: "profile", onSelect: () => onSelect("profile") }, () => [
        "Profile",
        h(CommandShortcut, () => "⌘P"),
      ]),
      h(CommandItem, { value: "billing", disabled: true, onSelect: () => onSelect("billing") }, () => "Billing"),
    ]),
  ]),
];

const render = (node: VNode) => mount({ render: () => node }, { attachTo: document.body });
const root = () => document.querySelector<HTMLElement>("[data-slot=command]")!;
const input = () => document.querySelector<HTMLInputElement>("[data-slot=command-input]")!;
const items = () => [...document.querySelectorAll<HTMLElement>("[data-slot=command-item]")];
const groups = () => [...document.querySelectorAll<HTMLElement>("[data-slot=command-group]")];
const texts = () => items().map((item) => item.textContent?.trim());
const settle = () => new Promise((resolve) => setTimeout(resolve, 300));

it("renders a listbox with a search input, labelled groups, items and a shortcut", async () => {
  render(h(Command, () => content()));
  await nextTick();
  expect(root().dataset.size).toBe("md");
  expect(root().querySelector("[role=listbox]")).not.toBeNull();
  expect(texts()).toEqual(["Apple", "Banana", "Profile⌘P", "Billing"]);
  const label = document.querySelector<HTMLElement>("[data-slot=command-label]")!;
  expect(groups()[0]!.getAttribute("aria-labelledby")).toBe(label.id);
  expect(document.querySelector("[data-slot=command-shortcut]")!.getAttribute("dir")).toBe("ltr");
  expect(document.querySelector("[data-slot=command-separator]")).not.toBeNull();
  expect(document.querySelector("[data-slot=command-empty]")).toBeNull();
  expect(document.activeElement).not.toBe(input());
});

it("filters items and hides groups without a match and separators while searching", async () => {
  render(h(Command, () => content()));
  await userEvent.click(input());
  await userEvent.keyboard("ban");
  expect(texts()).toEqual(["Banana"]);
  expect(groups()[1]!.hidden).toBe(true);
  expect(document.querySelector("[data-slot=command-separator]")).toBeNull();
  await userEvent.keyboard("zz");
  expect(items()).toHaveLength(0);
  expect(document.querySelector("[data-slot=command-empty]")!.textContent).toBe("No results.");
  await userEvent.clear(input());
  expect(items()).toHaveLength(4);
});

it("highlights the first item on focus, stops before a disabled item and selects with Enter", async () => {
  const selected: string[] = [];
  render(h(Command, () => content((value) => selected.push(value))));
  await userEvent.click(input());
  expect(items()[0]!.hasAttribute("data-highlighted")).toBe(true);
  await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
  expect(items()[2]!.hasAttribute("data-highlighted")).toBe(true);
  await userEvent.keyboard("{Enter}");
  expect(selected).toEqual(["profile"]);
  await userEvent.click(items()[3]!, { force: true });
  expect(selected).toEqual(["profile"]);
});

it("clears the search once an item is selected", async () => {
  const selected: string[] = [];
  render(h(Command, () => content((value) => selected.push(value))));
  await userEvent.click(input());
  await userEvent.keyboard("banana");
  await userEvent.click(items()[0]!);
  expect(selected).toEqual(["banana"]);
  expect(input().value).toBe("");
  expect(items()).toHaveLength(4);
});

it("takes Menu's item heights from size", async () => {
  const heights = (["xs", "md", "xl"] as const).map((size) => {
    const wrapper = render(h(Command, { size }, () => content()));
    const height = [root().dataset.size, items()[0]!.offsetHeight];
    wrapper.unmount();
    return height;
  });
  expect(heights).toEqual([
    ["xs", 28],
    ["md", 36],
    ["xl", 48],
  ]);
});

it("opens as a dialog named by its title, with the search focused and no close button", async () => {
  render(h(CommandDialog, { open: true }, () => content()));
  await settle();
  const dialog = document.querySelector<HTMLElement>("[role=dialog]")!;
  expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)!.textContent).toBe("Command Palette");
  expect(document.activeElement).toBe(input());
  expect(document.querySelector("[data-slot=dialog-close]")).toBeNull();
});
