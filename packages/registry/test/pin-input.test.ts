import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, h, nextTick } from "vue";

import { Field, FieldError, FieldLabel } from "@/ui/field";
import { PinInput, PinInputGroup, PinInputSeparator, PinInputSlot } from "@/ui/pin-input";

import { controlSizes, overrideControlTokens, sentinel } from "./control-tokens";

afterEach(() => {
  document.body.innerHTML = "";
});

const pin = (props: Record<string, unknown> = {}, count = 4) =>
  h(PinInput, props, () => [
    h(PinInputGroup, () => Array.from({ length: count }, (_, index) => h(PinInputSlot, { index }))),
  ]);

const render = (node: VNode) => mount({ render: () => node }, { attachTo: document.body });

const root = () => document.querySelector<HTMLElement>("[data-slot=pin-input]")!;
const slots = () => [...document.querySelectorAll<HTMLInputElement>("[data-slot=pin-input-slot]")];
const hidden = () => root().querySelector<HTMLInputElement>("input[tabindex='-1']")!;

it("renders one text box per slot, a hidden form input and a group root", () => {
  render(pin({ name: "code" }));
  expect(root().getAttribute("role")).toBe("group");
  expect(root().dataset.variant).toBe("outline");
  expect(root().dataset.size).toBe("md");
  expect(slots()).toHaveLength(4);
  expect(slots()[0]!.tagName).toBe("INPUT");
  expect(slots()[0]!.getAttribute("autocomplete")).toBe("one-time-code");
  expect(hidden().name).toBe("code");
});

it("fills the value one character per slot and reports completion", async () => {
  const updates: unknown[] = [];
  const completed: unknown[] = [];
  render(
    pin({
      "onUpdate:modelValue": (value: unknown) => updates.push(value),
      onComplete: (value: unknown) => completed.push(value),
    }),
  );
  await userEvent.click(slots()[0]!);
  await userEvent.keyboard("1234");
  expect(slots().map((slot) => slot.value)).toEqual(["1", "2", "3", "4"]);
  expect(updates.at(-1)).toEqual(["1", "2", "3", "4"]);
  expect(completed).toEqual([["1", "2", "3", "4"]]);
  expect(hidden().value).toBe("1234");
  expect(root().dataset.complete).toBe("");
});

it("masks the characters with mask and shows a placeholder while empty", () => {
  render(pin({ mask: true, placeholder: "•" }));
  expect(slots()[0]!.type).toBe("password");
  expect(slots()[0]!.placeholder).toBe("•");
});

it.each([
  ["xs", 28],
  ["sm", 32],
  ["md", 36],
  ["lg", 40],
  ["xl", 48],
] as const)("draws square %s slots of %ipx", (size, px) => {
  render(pin({ size }));
  const box = slots()[0]!.getBoundingClientRect();
  expect([box.width, box.height]).toEqual([px, px]);
});

it("takes the text control variants", () => {
  render(pin({ variant: "soft" }));
  expect(root().dataset.variant).toBe("soft");
  expect(slots()[0]!.className).toContain("bg-muted");
  expect(slots()[0]!.className).not.toContain("border-input");
});

it("separates groups with a dash, or the slot", () => {
  render(
    h(PinInput, {}, () => [
      h(PinInputGroup, () => [h(PinInputSlot, { index: 0 }), h(PinInputSlot, { index: 1 })]),
      h(PinInputSeparator),
      h(PinInputGroup, () => [h(PinInputSlot, { index: 2 }), h(PinInputSlot, { index: 3 })]),
    ]),
  );
  const separator = document.querySelector<HTMLElement>("[data-slot=pin-input-separator]")!;
  expect(separator.querySelector("svg")).not.toBeNull();
  expect(separator.getAttribute("aria-hidden")).toBe("true");
  expect(document.querySelectorAll("[data-slot=pin-input-group]")).toHaveLength(2);
  document.body.innerHTML = "";

  render(h(PinInput, {}, () => [h(PinInputSeparator, () => "/")]));
  expect(document.querySelector("[data-slot=pin-input-separator]")!.textContent).toBe("/");
});

it("takes its label, error and state from a surrounding field", async () => {
  render(
    h(Field, { invalid: true, required: true }, () => [
      h(FieldLabel, () => "Verification code"),
      pin(),
      h(FieldError, { errors: "Enter all four digits." }),
    ]),
  );
  await nextTick();
  const label = document.querySelector<HTMLElement>("[data-slot=field-label]")!;
  const error = document.querySelector<HTMLElement>("[data-slot=field-error]")!;
  expect(root().getAttribute("aria-labelledby")).toBe(label.id);
  expect(root().getAttribute("aria-describedby")).toBe(error.id);
  expect(hidden().required).toBe(true);
  expect(hidden().id).toBe(label.getAttribute("for"));
  for (const slot of slots()) expect(slot.getAttribute("aria-invalid")).toBe("true");
});

it("is disabled by the prop or by a disabled field", async () => {
  render(pin({ disabled: true }));
  expect(root().dataset.disabled).toBe("");
  for (const slot of slots()) expect(slot.disabled).toBe(true);
  document.body.innerHTML = "";

  render(h(Field, { disabled: true }, () => [h(FieldLabel, () => "Code"), pin()]));
  await nextTick();
  for (const slot of slots()) expect(slot.disabled).toBe(true);
});

describe("PinInput control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("draws %s slots as squares of the height token", (size) => {
    render(pin({ size }));
    const box = slots()[0]!.getBoundingClientRect();

    expect([box.width, box.height]).toEqual([sentinel.height[size], sentinel.height[size]]);
  });
});
