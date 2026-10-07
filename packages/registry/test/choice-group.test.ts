import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { type VNodeChild, h } from "vue";

import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { ChoiceGroup } from "@/ui/choice-group";
import { Field, FieldLabel } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";

const option = (control: VNodeChild) =>
  h(Field, { orientation: "horizontal" }, () => [control, h(FieldLabel, () => "Option")]);

it("lays fields out on its own with the variant and orientation on the root", () => {
  mount(
    {
      render: () =>
        h(ChoiceGroup, { variant: "card", orientation: "horizontal" }, () => [
          option(h(Checkbox, { value: "a" })),
          option(h(Checkbox, { value: "b" })),
        ]),
    },
    { attachTo: document.body },
  );
  const group = document.querySelector<HTMLElement>("[data-slot=choice-group]")!;
  expect(group.dataset.variant).toBe("card");
  expect(group.dataset.orientation).toBe("horizontal");
  expect(group.className).toContain("choice-row");
  expect(getComputedStyle(group).display).toBe("grid");
});

it("dresses a checkbox group and a radio group without replacing their own roots", () => {
  mount(
    {
      render: () => [
        h(CheckboxGroup, { variant: "card" }, () => [option(h(Checkbox, { value: "a" }))]),
        h(RadioGroup, { variant: "list", orientation: "horizontal" }, () => [option(h(Radio, { value: "a" }))]),
      ],
    },
    { attachTo: document.body },
  );
  expect(document.querySelector("[data-slot=choice-group]")).toBeNull();
  const checkboxes = document.querySelector<HTMLElement>("[data-slot=checkbox-group]")!;
  expect(checkboxes.dataset.variant).toBe("card");
  expect(checkboxes.className).toContain("choice-row");
  const radios = document.querySelector<HTMLElement>("[data-slot=radio-group]")!;
  expect(radios.dataset.variant).toBe("list");
  expect(radios.dataset.orientation).toBe("horizontal");
  expect(radios.className).toContain("divide-x");
  expect(radios.getAttribute("role")).toBe("radiogroup");
});

const palette = "--primary: rgb(0, 0, 255); --success: rgb(0, 128, 0); --success-text: rgb(0, 90, 0)";
// The selected row's tint: the tone over transparent at --state-selected.
const tint = (color: string) => {
  const probe = document.createElement("div");
  probe.style.backgroundColor = `color-mix(in oklab, ${color} 8%, transparent)`;
  document.body.append(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
};
const fields = () => [...document.querySelectorAll<HTMLElement>("[data-slot=field]")];

it("edges a selected card and tints a selected row in the group's color", () => {
  mount(
    {
      render: () =>
        h("div", { style: palette }, [
          h(RadioGroup, { variant: "card", color: "success", defaultValue: "a" }, () => [
            option(h(Radio, { value: "a" })),
          ]),
          h(CheckboxGroup, { variant: "list", color: "success", defaultValue: ["a"] }, () => [
            option(h(Checkbox, { value: "a" })),
          ]),
          h(CheckboxGroup, { variant: "list", defaultValue: ["a"] }, () => [option(h(Checkbox, { value: "a" }))]),
        ]),
    },
    { attachTo: document.body },
  );
  const [card, row, primaryRow] = fields();

  expect(document.querySelector<HTMLElement>("[data-slot=radio-group]")!.dataset.color).toBe("success");
  expect(getComputedStyle(card!).borderTopColor).toBe("rgb(0, 90, 0)");
  expect(getComputedStyle(row!).backgroundColor).toBe(tint("rgb(0, 128, 0)"));
  expect(getComputedStyle(primaryRow!).backgroundColor).toBe(tint("rgb(0, 0, 255)"));
});

it("keeps the primary tint for a group copied before the color prop", () => {
  mount(
    {
      render: () =>
        h("div", { "data-slot": "alert", "data-color": "success", style: palette }, [
          h("div", { class: "choice-row" }, [
            h("div", { "data-slot": "field" }, [h("button", { "data-slot": "checkbox", "data-state": "checked" })]),
          ]),
        ]),
    },
    { attachTo: document.body },
  );

  expect(getComputedStyle(fields()[0]!).backgroundColor).toBe(tint("rgb(0, 0, 255)"));
});

it("edges and tints in a custom color of its own", () => {
  const style = document.createElement("style");
  style.textContent = `@layer base {
    [data-slot][data-color="brand"] { --tone: rgb(255, 0, 200); --tone-text: rgb(120, 0, 90); }
  }`;
  document.head.append(style);
  try {
    mount(
      {
        render: () => [
          h(ChoiceGroup, { variant: "card", color: "brand" }, () => [
            option(h(Checkbox, { value: "a", defaultValue: true })),
          ]),
          h(ChoiceGroup, { variant: "list", color: "brand" }, () => [
            option(h(Checkbox, { value: "a", defaultValue: true })),
          ]),
        ],
      },
      { attachTo: document.body },
    );
    const [card, row] = fields();

    expect(getComputedStyle(card!).borderTopColor).toBe("rgb(120, 0, 90)");
    expect(getComputedStyle(row!).backgroundColor).toBe(tint("rgb(255, 0, 200)"));
  } finally {
    style.remove();
  }
});

it("keeps the primary tint for a choice-row whose data-color has no data-slot to define it", () => {
  mount(
    {
      render: () =>
        h("div", { style: palette }, [
          h("div", { class: "choice-row", "data-color": "success" }, [
            h("div", { "data-slot": "field" }, [h("button", { "data-slot": "checkbox", "data-state": "checked" })]),
          ]),
        ]),
    },
    { attachTo: document.body },
  );

  expect(getComputedStyle(fields()[0]!).backgroundColor).toBe(tint("rgb(0, 0, 255)"));
});
