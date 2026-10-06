import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick } from "vue";

import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { Radio, RadioGroup } from "@/ui/radio-group";
import { Slider } from "@/ui/slider";
import { Switch } from "@/ui/switch";

const BLUE = "rgb(0, 0, 255)";
const GREEN = "rgb(0, 128, 0)";
const GREY = "rgb(128, 128, 128)";
const RED = "rgb(255, 0, 0)";
const LIME = "rgb(0, 200, 0)";
const FOREST = "rgb(0, 90, 0)";
const AMBER = "rgb(255, 190, 0)";
const PINK = "rgb(255, 0, 200)";
const palette = [
  `--primary: ${BLUE}`,
  `--foreground: ${GREEN}`,
  `--input: ${GREY}`,
  `--destructive: ${RED}`,
  `--success: ${LIME}`,
  `--success-foreground: rgb(0, 30, 0)`,
  `--success-text: ${FOREST}`,
  `--warning: ${AMBER}`,
].join("; ");

afterEach(() => {
  document.body.innerHTML = "";
});

const render = async (node: () => VNode | VNode[]) => {
  mount(defineComponent({ setup: () => () => h("div", { style: palette }, node()) }), { attachTo: document.body });
  await nextTick();
};

const parts = (slot: string) => [...document.querySelectorAll<HTMLElement>(`[data-slot=${slot}]`)];
const part = (slot: string) => parts(slot)[0]!;
const edge = (element: Element) => getComputedStyle(element).borderTopColor;
const fill = (element: Element) => getComputedStyle(element).backgroundColor;
const halo = (element: Element) => getComputedStyle(element, "::before").backgroundColor;

it("sets data-color and data-size on every control, primary and md by default", async () => {
  await render(() => [
    h(Switch),
    h(Checkbox),
    h(RadioGroup, () => h(Radio, { value: "a" })),
    h(Slider, { defaultValue: 50 }),
    h(Switch, { color: "success", size: "lg" }),
  ]);

  for (const slot of ["switch", "checkbox", "radio", "slider"]) {
    expect(part(slot).dataset.color, slot).toBe("primary");
    expect(part(slot).dataset.size, slot).toBe("md");
  }
  expect(parts("switch")[1]!.dataset.color).toBe("success");
  expect(parts("switch")[1]!.dataset.size).toBe("lg");
});

it("fills a checked control and its halo with its color, and keeps the input edge while unchecked", async () => {
  await render(() => [
    h(Switch, { color: "success", defaultValue: true }),
    h(Checkbox, { color: "success", defaultValue: true }),
    h(Switch, { color: "success" }),
    h(Checkbox, { color: "success" }),
  ]);
  const [onSwitch, offSwitch] = parts("switch");
  const [onBox, offBox] = parts("checkbox");

  expect(fill(onSwitch!)).toBe(LIME);
  expect(halo(part("switch-thumb"))).toBe(LIME);
  expect(fill(onBox!)).toBe(LIME);
  expect(halo(onBox!)).toBe(LIME);
  expect(edge(offSwitch!)).toBe(GREY);
  expect(edge(offBox!)).toBe(GREY);
  expect(halo(offBox!)).toBe(GREEN);
});

it("draws a radio and a slider in their color", async () => {
  await render(() => [
    h(RadioGroup, { defaultValue: "a" }, () => h(Radio, { value: "a", color: "success" })),
    h(Slider, { defaultValue: 50, color: "success" }),
  ]);

  expect(edge(part("radio"))).toBe(LIME);
  expect(fill(part("radio").querySelector("span > span")!)).toBe(LIME);
  expect(fill(part("slider-range"))).toBe(LIME);
  expect(fill(part("slider-handle"))).toBe(LIME);
  expect(halo(part("slider-thumb"))).toBe(LIME);
});

it("takes a custom tone from a [data-slot][data-color] rule", async () => {
  const style = document.createElement("style");
  style.textContent = `[data-slot][data-color="brand"] { --tone: ${PINK}; --tone-foreground: white; --tone-text: ${PINK}; }`;
  document.head.append(style);
  try {
    await render(() => [
      h(Switch, { color: "brand", defaultValue: true }),
      h(Checkbox, { color: "brand", defaultValue: true }),
      h(Slider, { color: "brand", defaultValue: 50 }),
      h(Switch, { color: "brand" }),
    ]);

    expect(fill(part("switch"))).toBe(PINK);
    expect(fill(part("checkbox"))).toBe(PINK);
    expect(fill(part("slider-range"))).toBe(PINK);
    expect(edge(parts("switch")[1]!)).toBe(GREY);
  } finally {
    style.remove();
  }
});

it("turns a colored control destructive when it is invalid", async () => {
  await render(() => [
    h(Switch, { color: "success", "aria-invalid": "true" }),
    h(Checkbox, { color: "success", defaultValue: true, "aria-invalid": "true" }),
    h(Slider, { color: "success", defaultValue: 50, "aria-invalid": "true" }),
    h(RadioGroup, { "aria-invalid": "true", color: "success" }, () => h(Radio, { value: "a" })),
  ]);

  expect(edge(part("switch"))).toBe(RED);
  expect(halo(part("switch-thumb"))).toBe(RED);
  expect(fill(part("checkbox"))).toBe(RED);
  expect(fill(part("slider-range"))).toBe(RED);
  expect(edge(part("radio"))).toBe(RED);
});

it("passes a group's color to the checkboxes and radios that don't set their own", async () => {
  await render(() => [
    h(CheckboxGroup, { color: "success", defaultValue: ["a", "b"] }, () => [
      h(Checkbox, { value: "a" }),
      h(Checkbox, { value: "b", color: "warning" }),
    ]),
    h(RadioGroup, { color: "success", defaultValue: "a" }, () => [
      h(Radio, { value: "a" }),
      h(Radio, { value: "b", color: "warning" }),
    ]),
  ]);
  const [inherited, own] = parts("checkbox");
  const [radio, ownRadio] = parts("radio");

  expect(part("checkbox-group").dataset.color).toBe("success");
  expect(inherited!.dataset.color).toBe("success");
  expect(fill(inherited!)).toBe(LIME);
  expect(own!.dataset.color).toBe("warning");
  expect(fill(own!)).toBe(AMBER);
  expect(part("radio-group").dataset.color).toBe("success");
  expect(radio!.dataset.color).toBe("success");
  expect(edge(radio!)).toBe(LIME);
  expect(ownRadio!.dataset.color).toBe("warning");
});

it("rings a control in its tone's text colour, and a primary one in --ring", async () => {
  await render(() => [
    h(Switch, { color: "success" }),
    h(Switch),
    h("div", { "data-probe": "success", class: "focus-ring", style: `--color-ring: ${FOREST}` }),
    h("div", { "data-probe": "ring", class: "focus-ring" }),
  ]);
  const outline = (element: Element) => getComputedStyle(element).outlineColor;
  const probe = (name: string) => document.querySelector(`[data-probe=${name}]`)!;
  const [colored, primary] = parts("switch");

  await userEvent.tab();
  expect(document.activeElement).toBe(colored);
  expect(outline(colored!)).toBe(outline(probe("success")));
  await userEvent.tab();
  expect(document.activeElement).toBe(primary);
  expect(outline(primary!)).toBe(outline(probe("ring")));
  expect(outline(primary!)).not.toBe(outline(colored!));
});
