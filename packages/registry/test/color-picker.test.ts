import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, ref } from "vue";

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerField,
  ColorPickerPreview,
  ColorPickerSlider,
  ColorPickerSwatch,
  ColorPickerSwatches,
} from "@/ui/color-picker";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";

import { controlSizes, overrideControlTokens, sentinel } from "./control-tokens";

let unmount: (() => void) | undefined;

const reset = () => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
};

afterEach(reset);

const parts = () => [
  h(ColorPickerArea),
  h(ColorPickerSlider, { channel: "hue" }),
  h(ColorPickerSlider, { channel: "alpha" }),
  h(ColorPickerPreview),
  h(ColorPickerField),
  h(ColorPickerSwatches, () => [
    h(ColorPickerSwatch, { value: "#ef4444" }),
    h(ColorPickerSwatch, { value: "#22C55E" }),
    h(ColorPickerSwatch, { value: "#fef08a" }),
  ]),
];

const render = async (
  props: Record<string, unknown> = {},
  children: () => VNode[] = parts,
  wrap?: (node: VNode) => VNode,
) => {
  const node = h(ColorPicker, { modelValue: "#3b82f6", class: "w-64", ...props }, children);
  const wrapper = mount({ render: () => (wrap ? wrap(node) : node) }, { attachTo: document.body });
  unmount = () => wrapper.unmount();
  await nextTick();
  return wrapper;
};

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const root = () => q("[data-slot=color-picker]");
const areaThumb = () => q("[data-slot=color-picker-area-thumb]");
const sliderThumb = (channel: string) => q(`[data-slot=color-picker-slider][data-channel=${channel}] [role=slider]`);
const input = () => q("[data-slot=color-picker-field-input]") as HTMLInputElement;
const swatches = () => all("[data-slot=color-picker-swatch]");

const collect = async () => {
  const updates: string[] = [];
  await render({ "onUpdate:modelValue": (value: string) => updates.push(value) });
  return updates;
};
const valueNow = (element: HTMLElement) => Math.round(Number(element.getAttribute("aria-valuenow")));

it("renders a group of parts bound to one colour", async () => {
  await render({ name: "accent" });
  expect(root().getAttribute("role")).toBe("group");
  expect(root().dataset.size).toBe("md");
  expect(areaThumb().getAttribute("role")).toBe("slider");
  expect(areaThumb().getAttribute("aria-valuetext")).toContain("Saturation");
  expect(valueNow(sliderThumb("hue"))).toBe(217);
  expect(valueNow(sliderThumb("alpha"))).toBe(100);
  expect(input().value).toBe("#3b82f6");
  expect(q("[data-slot=color-picker-preview]").style.getPropertyValue("--reka-color-swatch-color")).toBe("#3b82f6");
  expect(swatches().map((element) => element.dataset.color)).toEqual(["#ef4444", "#22c55e", "#fef08a"]);
  const hidden = q("input[type=hidden]") as HTMLInputElement;
  expect(hidden.name).toBe("accent");
  expect(hidden.value).toBe("#3b82f6");
});

it("renders no hidden input without a name", async () => {
  await render();
  expect(document.querySelector("input[type=hidden]")).toBeNull();
});

it("starts from default-value and reports it", async () => {
  const updates: string[] = [];
  await render({
    modelValue: undefined,
    defaultValue: "#ff0000",
    "onUpdate:modelValue": (value: string) => updates.push(value),
  });
  await nextTick();
  expect(input().value).toBe("#ff0000");
  expect(updates).toEqual(["#ff0000"]);
});

it("moves the area thumb with the arrow keys and writes the colour", async () => {
  const updates = await collect();
  areaThumb().focus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(areaThumb().getAttribute("aria-valuenow")).toBe("75");
  expect(updates).toHaveLength(1);
  expect(updates[0]).toMatch(/^#[0-9a-f]{6}$/);
  expect(updates[0]).not.toBe("#3b82f6");
});

it("turns the hue with the hue slider", async () => {
  const updates = await collect();
  sliderThumb("hue").focus();
  await userEvent.keyboard("{End}");
  expect(valueNow(sliderThumb("hue"))).toBe(360);
  expect(updates.at(-1)).toBe("#f63b3b");
});

it("keeps the hue slider where it is on an achromatic colour", async () => {
  const updates: string[] = [];
  await render({ modelValue: "#ffffff", "onUpdate:modelValue": (value: string) => updates.push(value) });
  sliderThumb("hue").focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(valueNow(sliderThumb("hue"))).toBe(1);
  expect(updates.filter((value) => value !== "#ffffff")).toEqual([]);
});

it("adds alpha through the alpha slider and writes an eight-digit hex", async () => {
  const updates = await collect();
  sliderThumb("alpha").focus();
  await userEvent.keyboard("{Home}");
  expect(updates.at(-1)).toBe("#3b82f600");
  expect(input().value).toBe("#3b82f600");
});

it("writes the model in the chosen format", async () => {
  for (const [format, pattern] of [
    ["rgb", /^rgba?\(59, 130, 246/],
    ["hsl", /^hsla?\(217/],
    ["hsb", /^hsba?\(217/],
  ] as const) {
    const updates: string[] = [];
    await render({ format, "onUpdate:modelValue": (value: string) => updates.push(value) });
    sliderThumb("alpha").focus();
    await userEvent.keyboard("{Home}");
    expect(updates.at(-1), format).toMatch(pattern);
    reset();
  }
});

it("commits a typed colour on Enter and reverts an invalid one on blur", async () => {
  const updates = await collect();
  await userEvent.tripleClick(input());
  await userEvent.keyboard("#00ff00{Enter}");
  expect(updates.at(-1)).toBe("#00ff00");
  expect(valueNow(sliderThumb("hue"))).toBe(120);
  await userEvent.tripleClick(input());
  await userEvent.keyboard("nope");
  await userEvent.tab();
  expect(input().value).toBe("#00ff00");
  expect(updates.at(-1)).toBe("#00ff00");
});

it("selects a swatch and marks the one matching the colour", async () => {
  const updates = await collect();
  expect(swatches().map((element) => element.getAttribute("aria-selected"))).toEqual(["false", "false", "false"]);
  await userEvent.click(swatches()[1]!);
  expect(updates.at(-1)).toBe("#22c55e");
  expect(swatches()[1]!.getAttribute("aria-selected")).toBe("true");
  expect(swatches()[1]!.querySelector("[data-slot=color-picker-swatch-indicator]")).not.toBeNull();
  expect(q("[data-slot=color-picker-preview]").style.getPropertyValue("--reka-color-swatch-color")).toBe("#22c55e");
});

it("draws round swatches with a check in the contrasting colour and an optional border", async () => {
  await render();
  const [red, , yellow] = swatches();
  expect(parseFloat(getComputedStyle(red!).borderRadius)).toBeGreaterThan(1000);
  await userEvent.click(red!);
  expect(getComputedStyle(red!.querySelector("[data-slot=color-picker-swatch-indicator]")!).color).toBe(
    "rgb(255, 255, 255)",
  );
  await userEvent.click(yellow!);
  expect(getComputedStyle(yellow!.querySelector("[data-slot=color-picker-swatch-indicator]")!).color).toBe(
    "rgb(0, 0, 0)",
  );
  const swatchColor = yellow!.querySelector("[data-slot=color-picker-swatch-color]")!;
  expect(getComputedStyle(swatchColor).borderRadius).toBe(getComputedStyle(yellow!).borderRadius);
  expect(swatchColor.className).toContain("inset-ring-surface-border");
  const preview = q("[data-slot=color-picker-preview]");
  const previewColor = preview.querySelector("span")!;
  expect(getComputedStyle(previewColor).borderRadius).toBe(getComputedStyle(preview).borderRadius);
  expect(getComputedStyle(preview).borderRadius).not.toBe("0px");
  expect(previewColor.className).toContain("inset-ring-surface-border");
});

it("follows a controlled model from outside", async () => {
  const value = ref("#3b82f6");
  const wrapper = mount(
    defineComponent({
      setup: () => () => h(ColorPicker, { modelValue: value.value, class: "w-64" }, parts),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  await nextTick();
  value.value = "#22c55e";
  await nextTick();
  await nextTick();
  expect(input().value).toBe("#22c55e");
  expect(valueNow(sliderThumb("hue"))).toBe(142);
  expect(swatches()[1]!.getAttribute("aria-selected")).toBe("true");
});

it("disables every part", async () => {
  await render({ disabled: true });
  expect(root().dataset.disabled).toBe("");
  expect(q("[data-slot=color-picker-area]").getAttribute("aria-disabled")).toBe("true");
  expect(areaThumb().hasAttribute("tabindex")).toBe(false);
  expect(sliderThumb("hue").dataset.disabled).toBe("");
  expect(input().disabled).toBe(true);
  expect(q("[data-slot=color-picker-swatches]").dataset.disabled).toBe("");
});

it("takes its label, description, error and state from Field", async () => {
  await render({}, parts, (node) =>
    h(Field, { invalid: true, disabled: true, required: true }, () => [
      h(FieldLabel, () => "Accent"),
      node,
      h(FieldDescription, () => "Used for links."),
      h(FieldError, { errors: "Too light." }),
    ]),
  );
  await nextTick();
  const label = q("label");
  expect(label.getAttribute("for")).toBe(root().id);
  expect(root().getAttribute("aria-labelledby")).toBe(label.id);
  expect(root().getAttribute("aria-required")).toBe("true");
  const describedBy = `${q("[data-slot=field-description]").id} ${q("[data-slot=field-error]").id}`;
  expect(areaThumb().getAttribute("aria-describedby")).toBe(describedBy);
  expect(sliderThumb("hue").getAttribute("aria-describedby")).toBe(describedBy);
  expect(input().getAttribute("aria-describedby")).toBe(describedBy);
  expect(input().getAttribute("aria-invalid")).toBe("true");
  expect(areaThumb().getAttribute("aria-invalid")).toBe("true");
  expect(input().disabled).toBe(true);
  expect(root().dataset.disabled).toBe("");
});

it("draws the sliders like Slider, with its variants and sizes", async () => {
  await render({}, () => [
    h(ColorPickerSlider, { channel: "hue" }),
    h(ColorPickerSlider, { channel: "alpha", variant: "inset", touchTarget: "expand" }),
  ]);
  const plain = q("[data-slot=color-picker-slider][data-channel=hue]");
  expect(plain.dataset.variant).toBe("default");
  expect(sliderThumb("hue").className).toContain("state-halo");
  expect(q("[data-slot=color-picker-slider-track]").getBoundingClientRect().height).toBe(6);
  expect(sliderThumb("hue").getBoundingClientRect().width).toBe(16);
  expect(getComputedStyle(q("[data-slot=color-picker-slider-handle]")).backgroundColor).toBe("rgb(0, 97, 255)");

  const inset = q("[data-slot=color-picker-slider][data-channel=alpha]");
  expect(inset.dataset.variant).toBe("inset");
  expect(inset.dataset.touchTarget).toBe("expand");
  expect(inset.querySelector("[data-slot=color-picker-slider-track]")!.getBoundingClientRect().height).toBe(20);
  expect(sliderThumb("alpha").getBoundingClientRect().width).toBe(20);
  expect(getComputedStyle(sliderThumb("alpha")).backgroundColor).toBe("rgb(59, 130, 246)");
  expect(getComputedStyle(inset.querySelector("[data-slot=color-picker-slider-handle]")!).backgroundColor).toBe(
    "rgb(255, 255, 255)",
  );
});

it("scales the area, the sliders and the field from size", async () => {
  await render();
  expect(q("[data-slot=color-picker-area]").getBoundingClientRect().height).toBe(160);
  expect(sliderThumb("hue").getBoundingClientRect().width).toBe(16);
  expect(areaThumb().getBoundingClientRect().width).toBe(16);
  expect(areaThumb().className).toContain("state-halo");
  expect(getComputedStyle(q("[data-slot=color-picker-area-handle]")).backgroundColor).toBe("rgb(59, 130, 246)");
  expect(input().getBoundingClientRect().height).toBe(36);
  reset();

  await render({ size: "xs" });
  expect(root().dataset.size).toBe("xs");
  expect(q("[data-slot=color-picker-area]").getBoundingClientRect().height).toBe(96);
  expect(sliderThumb("hue").getBoundingClientRect().width).toBe(12);
  expect(input().getBoundingClientRect().height).toBe(28);
  reset();

  await render({ size: "xl" });
  expect(q("[data-slot=color-picker-area]").getBoundingClientRect().height).toBe(224);
  expect(sliderThumb("hue").getBoundingClientRect().width).toBe(24);
  expect(input().getBoundingClientRect().height).toBe(48);
});

it("merges class onto every part", async () => {
  await render({ class: "picker-x" }, () => [
    h(ColorPickerArea, { class: "area-x" }),
    h(ColorPickerSlider, { channel: "hue", class: "slider-x" }),
    h(ColorPickerPreview, { class: "preview-x" }),
    h(ColorPickerField, { class: "field-x" }),
    h(ColorPickerSwatches, { class: "swatches-x" }, () => [
      h(ColorPickerSwatch, { value: "#ef4444", class: "swatch-x" }),
    ]),
  ]);
  for (const [slot, name] of [
    ["color-picker", "picker"],
    ["color-picker-area", "area"],
    ["color-picker-slider", "slider"],
    ["color-picker-preview", "preview"],
    ["color-picker-field", "field"],
    ["color-picker-swatches", "swatches"],
    ["color-picker-swatch", "swatch"],
  ]) {
    expect(q(`[data-slot=${slot}]`).classList.contains(`${name}-x`), slot).toBe(true);
  }
});

describe("ColorPicker control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("the %s preview is a square of the height token", async (size) => {
    await render({ size });
    const box = document.querySelector("[data-slot=color-picker-preview]")!.getBoundingClientRect();

    expect([box.width, box.height]).toEqual([sentinel.height[size], sentinel.height[size]]);
  });
});
