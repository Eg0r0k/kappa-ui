import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, h, nextTick, ref } from "vue";

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

it("collapses the list, its padding and its top edge when nothing is left to show", async () => {
  render(
    h(Command, () => [
      h(CommandInput, { placeholder: "Search" }),
      h(CommandList, () => h(CommandGroup, () => h(CommandItem, { value: "apple" }, () => "Apple"))),
    ]),
  );
  const list = () => document.querySelector<HTMLElement>("[data-slot=command-list]")!;
  const edge = () => getComputedStyle(list()).borderTopWidth;
  expect(getComputedStyle(list()).display).not.toBe("none");
  expect(edge()).toBe("1px");

  await userEvent.click(input());
  await userEvent.keyboard("zz");
  expect(getComputedStyle(list()).display).toBe("none");
  expect(list().getBoundingClientRect().height).toBe(0);

  await userEvent.clear(input());
  expect(getComputedStyle(list()).display).not.toBe("none");
  expect(edge()).toBe("1px");
});

it("draws no edge under an input that nothing follows", () => {
  render(h(Command, () => h(CommandInput, { placeholder: "Search" })));
  expect(getComputedStyle(document.querySelector("[data-slot=command-input-wrapper]")!).borderBottomWidth).toBe("0px");
  expect(getComputedStyle(document.querySelector("[data-slot=command]")!).height).toBe(
    getComputedStyle(document.querySelector("[data-slot=command-input-wrapper]")!).height,
  );
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
  await vi.waitFor(() => expect(document.activeElement).toBe(input()));
  const dialog = document.querySelector<HTMLElement>("[role=dialog]")!;
  expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)!.textContent).toBe("Command Palette");
  expect(document.querySelector("[data-slot=dialog-close]")).toBeNull();
});

it("keeps every item, group and separator with ignoreFilter, and shows no empty state", async () => {
  render(h(Command, { ignoreFilter: true }, () => content()));
  await userEvent.click(input());
  await userEvent.keyboard("zz");
  expect(items()).toHaveLength(4);
  expect(groups().every((group) => !group.hidden)).toBe(true);
  expect(document.querySelector("[data-slot=command-separator]")).not.toBeNull();
  expect(document.querySelector("[data-slot=command-empty]")).toBeNull();
});

const bound = (search: { value: string }) =>
  mount(
    {
      setup: () => () =>
        h(Command, () => [
          h(CommandInput, {
            modelValue: search.value,
            "onUpdate:modelValue": (value: string) => (search.value = value),
          }),
          content()[1],
        ]),
    },
    { attachTo: document.body },
  );

it("binds the search with v-model on the input, both ways", async () => {
  const search = ref("ban");
  bound(search);
  await nextTick();
  expect(input().value).toBe("ban");
  expect(texts()).toEqual(["Banana"]);
  await userEvent.click(input());
  await userEvent.keyboard("x");
  expect(search.value).toBe("banx");
  search.value = "";
  await nextTick();
  expect(items()).toHaveLength(4);
});

it("tells the bound search when selecting an item clears it", async () => {
  const search = ref("");
  bound(search);
  await userEvent.click(input());
  await userEvent.keyboard("apple");
  await userEvent.click(items()[0]!);
  expect(search.value).toBe("");
});
