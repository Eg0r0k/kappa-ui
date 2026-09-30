import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { type VNodeChild, h } from "vue";

import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { ChoiceGroup } from "@/ui/choice-group";
import { Field, FieldLabel } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";

afterEach(() => {
  document.body.innerHTML = "";
});

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
