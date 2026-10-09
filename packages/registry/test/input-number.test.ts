import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, ref } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from "@/ui/input-number";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

const colors =
  "--input: rgb(0, 0, 255); --primary: rgb(0, 128, 0); --destructive: rgb(255, 0, 0); --disabled-opacity: 38%";

const field = (props: Record<string, unknown> = {}, inputProps: Record<string, unknown> = {}) =>
  h(InputNumber, { style: colors, ...props }, () => [
    h(InputNumberDecrement),
    h(InputNumberInput, inputProps),
    h(InputNumberIncrement),
  ]);

const render = (node: VNode) => mount({ render: () => node }, { attachTo: document.body });

const root = () => document.querySelector<HTMLElement>("[data-slot=input-number]")!;
const input = () => document.querySelector<HTMLInputElement>("[data-slot=input-number-input]")!;
const increment = () => document.querySelector<HTMLButtonElement>("[data-slot=input-number-increment]")!;
const decrement = () => document.querySelector<HTMLButtonElement>("[data-slot=input-number-decrement]")!;

it("renders a spinbutton inside a group frame with two stepper buttons", () => {
  render(field({ name: "qty", defaultValue: 3 }));
  expect(root().getAttribute("role")).toBe("group");
  expect(root().dataset.variant).toBe("outline");
  expect(root().dataset.size).toBe("md");
  expect(root().dataset.orientation).toBe("horizontal");
  expect(input().getAttribute("role")).toBe("spinbutton");
  expect(input().value).toBe("3");
  expect(increment().tagName).toBe("BUTTON");
  expect(increment().getAttribute("aria-label")).toBe("Increase");
  expect(decrement().getAttribute("aria-label")).toBe("Decrease");
  expect(increment().dataset.slot).toBe("input-number-increment");
  expect(increment().dataset.variant).toBe("ghost");
  expect(increment().dataset.color).toBe("neutral");
  expect(increment().querySelector("svg.lucide-plus")).not.toBeNull();
  expect(decrement().querySelector("svg.lucide-minus")).not.toBeNull();
});

it("steps the value with the buttons and the arrow keys", async () => {
  const updates: unknown[] = [];
  render(field({ defaultValue: 4, step: 2, "onUpdate:modelValue": (value: unknown) => updates.push(value) }));
  await userEvent.click(increment());
  expect(input().value).toBe("6");
  await userEvent.click(decrement());
  await userEvent.click(decrement());
  expect(input().value).toBe("2");
  input().focus();
  await userEvent.keyboard("{ArrowUp}");
  expect(input().value).toBe("4");
  expect(updates).toEqual([6, 4, 2, 4]);
});

it("commits typed text on blur and gives undefined when cleared", async () => {
  const value = ref<number | undefined>(1);
  const updates: unknown[] = [];
  mount(
    defineComponent(
      () => () =>
        field({
          modelValue: value.value,
          "onUpdate:modelValue": (next: unknown) => {
            value.value = next as number | undefined;
            updates.push(next);
          },
        }),
    ),
    { attachTo: document.body },
  );
  await userEvent.click(input());
  await userEvent.keyboard("{Control>}a{/Control}42");
  await userEvent.tab();
  expect(input().value).toBe("42");
  expect(updates.at(-1)).toBe(42);
  await userEvent.click(input());
  await userEvent.keyboard("{Control>}a{/Control}{Backspace}");
  await userEvent.tab();
  expect(input().value).toBe("");
  expect(updates.at(-1)).toBeUndefined();
});

it("disables the button that would leave the range", async () => {
  render(field({ defaultValue: 10, min: 0, max: 10 }));
  expect(increment().disabled).toBe(true);
  expect(decrement().disabled).toBe(false);
  await userEvent.click(decrement());
  expect(increment().disabled).toBe(false);
});

it("formats the value through formatOptions and locale", () => {
  render(field({ defaultValue: 10, formatOptions: { style: "currency", currency: "EUR" }, locale: "en-US" }));
  expect(input().value).toBe("€10.00");
  expect(input().getAttribute("inputmode")).toBe("decimal");
});

it.each([
  ["xs", 28, 24, 14],
  ["sm", 32, 24, 14],
  ["md", 36, 28, 16],
  ["lg", 40, 32, 16],
  ["xl", 48, 40, 20],
] as const)("at %s the frame is %ipx tall with inset %ipx square buttons and %ipx icons", (size, frame, side, icon) => {
  render(field({ size }));
  expect(root().offsetHeight).toBe(frame);
  const box = decrement().getBoundingClientRect();
  expect([box.width, box.height]).toEqual([side, side]);
  expect(decrement().querySelector("svg")!.getBoundingClientRect().width).toBe(icon);
  const inset = (frame - side) / 2;
  const frameBox = root().getBoundingClientRect();
  expect(box.left - frameBox.left).toBeCloseTo(inset, 1);
  expect(frameBox.right - increment().getBoundingClientRect().right).toBeCloseTo(inset, 1);
  const outer = Number.parseFloat(getComputedStyle(root()).borderTopLeftRadius);
  expect(Number.parseFloat(getComputedStyle(decrement()).borderTopLeftRadius)).toBeCloseTo(
    Math.max(outer - inset, outer / 2),
    1,
  );
});

it("places decrement before the input and increment after it whatever the markup order", () => {
  render(h(InputNumber, {}, () => [h(InputNumberIncrement), h(InputNumberDecrement), h(InputNumberInput)]));
  const [left, middle, right] = [decrement(), input(), increment()].map((el) => el.getBoundingClientRect());
  expect(left!.right).toBeLessThanOrEqual(middle!.left);
  expect(middle!.right).toBeLessThanOrEqual(right!.left);
  expect(getComputedStyle(input()).textAlign).toBe("center");
});

it("stacks the buttons at the end in the vertical orientation", () => {
  render(field({ orientation: "vertical", size: "md" }));
  expect(root().dataset.orientation).toBe("vertical");
  const frame = root().getBoundingClientRect();
  const up = increment().getBoundingClientRect();
  const down = decrement().getBoundingClientRect();
  expect(up.width).toBe(28);
  expect(up.height).toBeCloseTo(17, 0);
  expect(down.height).toBeCloseTo(17, 0);
  expect(up.top).toBeCloseTo(frame.top + 1, 0);
  expect(down.bottom).toBeCloseTo(frame.bottom - 1, 0);
  expect(up.right).toBeCloseTo(frame.right - 1, 0);
  expect(up.bottom).toBeLessThanOrEqual(down.top);
  expect(input().getBoundingClientRect().right).toBeLessThanOrEqual(up.left);
  expect(increment().querySelector("svg.lucide-chevron-up")).not.toBeNull();
  expect(decrement().querySelector("svg.lucide-chevron-down")).not.toBeNull();
  expect(increment().querySelector("svg")!.getBoundingClientRect().width).toBe(14);
  const outer = Number.parseFloat(getComputedStyle(root()).borderTopRightRadius);
  expect(Number.parseFloat(getComputedStyle(increment()).borderTopRightRadius)).toBeCloseTo(outer - 1, 1);
  expect(getComputedStyle(increment()).borderTopLeftRadius).toBe("0px");
  expect(getComputedStyle(input()).textAlign).toBe("start");
});

it("tightens the input padding only on a side with a button", () => {
  render(h(InputNumber, { size: "md" }, () => [h(InputNumberInput), h(InputNumberIncrement)]));
  expect(getComputedStyle(input()).paddingLeft).toBe("12px");
  expect(getComputedStyle(input()).paddingRight).toBe("6px");
});

it("rings the frame while the input has focus and turns it destructive when invalid", async () => {
  render(field());
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(0, 0, 255)");
  input().focus();
  await expect.poll(() => getComputedStyle(root()).borderTopColor).toBe("rgb(0, 128, 0)");
  expect(getComputedStyle(root()).boxShadow).not.toBe("none");
  document.body.innerHTML = "";

  render(field({}, { "aria-invalid": "true" }));
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(255, 0, 0)");
});

it("takes the text control variants", () => {
  render(field({ variant: "soft" }));
  expect(root().dataset.variant).toBe("soft");
  expect(root().className).toContain("bg-muted");
  expect(getComputedStyle(root()).borderTopColor).toBe("rgba(0, 0, 0, 0)");
});

it("disables the input and both buttons, by the prop or by readonly", () => {
  render(field({ disabled: true }));
  expect(input().disabled).toBe(true);
  expect(increment().disabled).toBe(true);
  expect(decrement().disabled).toBe(true);
  expect(getComputedStyle(root()).borderTopColor).not.toBe("rgb(0, 0, 255)");
  document.body.innerHTML = "";

  render(field({ readonly: true, defaultValue: 2 }));
  expect(input().readOnly).toBe(true);
  expect(input().disabled).toBe(false);
  expect(increment().disabled).toBe(true);
  expect(decrement().disabled).toBe(true);
});

it("takes its id, description, error and state from a surrounding field", async () => {
  render(
    h(Field, { invalid: true, required: true }, () => [
      h(FieldLabel, () => "Quantity"),
      field(),
      h(FieldDescription, () => "Whole units."),
      h(FieldError, { errors: "Pick at least one." }),
    ]),
  );
  await nextTick();
  const label = document.querySelector<HTMLElement>("[data-slot=field-label]")!;
  const description = document.querySelector<HTMLElement>("[data-slot=field-description]")!;
  const error = document.querySelector<HTMLElement>("[data-slot=field-error]")!;
  expect(input().id).toBe(label.getAttribute("for"));
  expect(input().getAttribute("aria-describedby")).toBe(`${description.id} ${error.id}`);
  expect(input().getAttribute("aria-invalid")).toBe("true");
  expect(input().required).toBe(true);
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(255, 0, 0)");
  document.body.innerHTML = "";

  render(h(Field, { disabled: true }, () => [h(FieldLabel, () => "Quantity"), field()]));
  await nextTick();
  expect(input().disabled).toBe(true);
  expect(increment().disabled).toBe(true);
});

it("exposes the input element through the part's ref", async () => {
  let exposed: unknown;
  render(
    h(InputNumber, {}, () => [
      h(InputNumberInput, {
        ref: (el: unknown) => {
          exposed = el;
        },
      }),
    ]),
  );
  await nextTick();
  expect((exposed as { $el: HTMLElement }).$el).toBe(input());
});

describe("InputNumber control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("%s reads its height token", (size) => {
    render(field({ size }));
    expect(px(getComputedStyle(root()).height)).toBe(sentinel.height[size]);
  });

  it.each(controlSizes)("a bare %s input reads the padding token", (size) => {
    render(h(InputNumber, { size }, () => h(InputNumberInput)));
    expect(px(getComputedStyle(input()).paddingInlineStart)).toBe(sentinel.padding[size]);
  });
});
