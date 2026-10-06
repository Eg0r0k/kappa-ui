import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { type VNode, h } from "vue";

import { Button } from "@/ui/button";
import { Combobox, ComboboxAnchor, ComboboxInput } from "@/ui/combobox";
import { Input } from "@/ui/input";
import { InputFloating } from "@/ui/input-floating";
import { Select, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Textarea } from "@/ui/textarea";
import { Toggle } from "@/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

afterEach(() => {
  document.body.innerHTML = "";
});

const marks = (node: () => VNode, slot: string) => {
  mount({ render: node }, { attachTo: document.body });
  const element = document.querySelector<HTMLElement>(`[data-slot=${slot}]`)!;
  return { variant: element.dataset.variant, size: element.dataset.size };
};

it.each([
  ["button", () => h(Button, () => "Save"), { variant: "solid", size: "md" }],
  ["toggle", () => h(Toggle, { "aria-label": "Bold" }, () => "B"), { variant: "ghost", size: "md" }],
  [
    "toggle-group-item",
    () => h(ToggleGroup, { type: "single" }, () => h(ToggleGroupItem, { value: "a" }, () => "A")),
    { variant: "ghost", size: "md" },
  ],
  ["input", () => h(Input, { "aria-label": "Name" }), { variant: "outline", size: "md" }],
  ["textarea", () => h(Textarea, { "aria-label": "Note" }), { variant: "outline", size: "md" }],
  ["input-floating", () => h(InputFloating, { label: "Email" }), { variant: "outline", size: "md" }],
  [
    "select-trigger",
    () => h(Select, () => h(SelectTrigger, { "aria-label": "Role" }, () => h(SelectValue))),
    { variant: "outline", size: "md" },
  ],
  [
    "combobox-anchor",
    () => h(Combobox, () => h(ComboboxAnchor, () => h(ComboboxInput, { "aria-label": "Fruit" }))),
    { variant: "outline", size: "md" },
  ],
  ["separator", () => h(Separator), { variant: undefined, size: "xs" }],
] as const)("%s marks its resolved variant and size when they are left out", (slot, node, expected) => {
  expect(marks(node, slot)).toEqual(expected);
});

it("marks Button's colour, primary by default", () => {
  mount(
    { render: () => [h(Button, () => "A"), h(Button, { color: "neutral" }, () => "B")] },
    { attachTo: document.body },
  );
  expect(
    [...document.querySelectorAll<HTMLElement>("[data-slot=button]")].map((button) => button.dataset.color),
  ).toEqual(["primary", "neutral"]);
});

it.each(["xs", "sm", "md", "lg", "xl", "icon-xs", "icon-sm", "icon-md", "icon-lg", "icon-xl"] as const)(
  "Button takes the size %s and marks it",
  (size) => {
    expect(marks(() => h(Button, { size, "aria-label": "Add" }, () => "+"), "button").size).toBe(size);
  },
);
