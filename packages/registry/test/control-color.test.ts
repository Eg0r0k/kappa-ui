import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick } from "vue";

import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { Field, FieldLabel } from "@/ui/field";
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
const PLUM = "rgb(120, 0, 90)";
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

const render = async (node: () => VNode | VNode[]) => {
  mount(defineComponent({ setup: () => () => h("div", { style: palette }, node()) }), { attachTo: document.body });
  await nextTick();
};

const parts = (slot: string) => [...document.querySelectorAll<HTMLElement>(`[data-slot=${slot}]`)];
const part = (slot: string) => parts(slot)[0]!;
const edge = (element: Element) => getComputedStyle(element).borderTopColor;
const fill = (element: Element) => getComputedStyle(element).backgroundColor;
const halo = (element: Element) => getComputedStyle(element, "::before").backgroundColor;

const dot = (radio: Element) => radio.querySelector("span > span")!;
const outline = (element: Element) => getComputedStyle(element).outlineColor;
// The selected row's tint: the tone over transparent at --state-selected.
const tint = (color: string) => {
  const probe = document.createElement("div");
  probe.style.backgroundColor = `color-mix(in oklab, ${color} 8%, transparent)`;
  document.body.append(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
};
// What focus-ring draws for a given --color-ring, or for the page's own without one.
const ring = (color?: string) => {
  const probe = document.createElement("div");
  probe.className = "focus-ring";
  if (color) probe.style.setProperty("--color-ring", color);
  document.body.append(probe);
  const value = outline(probe);
  probe.remove();
  return value;
};
const option = (control: VNode, props: Record<string, unknown> = {}) =>
  h(Field, { orientation: "horizontal", ...props }, () => [control, h(FieldLabel, () => "Option")]);

// A custom tone declared the way the theming page shows it: in the base layer, where utilities can override it.
const withBrand = async (body: () => Promise<void>) => {
  const style = document.createElement("style");
  style.textContent = `@layer base {
    [data-slot][data-color="brand"] { --tone: ${PINK}; --tone-foreground: white; --tone-text: ${PLUM}; }
  }`;
  document.head.append(style);
  try {
    await body();
  } finally {
    style.remove();
  }
};

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

it("fills a checked control with its color, edges it in the text shade, and keeps the input edge while unchecked", async () => {
  await render(() => [
    h(Switch, { color: "success", defaultValue: true }),
    h(Checkbox, { color: "success", defaultValue: true }),
    h(Checkbox, { color: "success", defaultValue: "indeterminate" }),
    h(Switch, { color: "success" }),
    h(Checkbox, { color: "success" }),
  ]);
  const [onSwitch, offSwitch] = parts("switch");
  const [onBox, mixedBox, offBox] = parts("checkbox");

  expect(fill(onSwitch!)).toBe(LIME);
  expect(edge(onSwitch!)).toBe(FOREST);
  expect(halo(part("switch-thumb"))).toBe(LIME);
  expect(fill(onBox!)).toBe(LIME);
  expect(edge(onBox!)).toBe(FOREST);
  expect(halo(onBox!)).toBe(LIME);
  expect(fill(mixedBox!)).toBe(LIME);
  expect(edge(mixedBox!)).toBe(FOREST);
  expect(edge(offSwitch!)).toBe(GREY);
  expect(edge(offBox!)).toBe(GREY);
  expect(halo(offBox!)).toBe(GREEN);
});

it("draws a radio and a slider on the page in their color's text shade", async () => {
  await render(() => [
    h(RadioGroup, { defaultValue: "a" }, () => h(Radio, { value: "a", color: "success" })),
    h(Slider, { defaultValue: 50, color: "success" }),
    h(Slider, { defaultValue: 50, color: "success", variant: "inset" }),
  ]);
  const [range, insetRange] = parts("slider-range");
  const [thumb, insetThumb] = parts("slider-thumb");

  expect(edge(part("radio"))).toBe(FOREST);
  expect(fill(dot(part("radio")))).toBe(FOREST);
  expect(halo(part("radio"))).toBe(LIME);
  expect(fill(range!)).toBe(FOREST);
  expect(fill(part("slider-handle"))).toBe(FOREST);
  expect(halo(thumb!)).toBe(LIME);
  // The inset thumb carries a handle in --tone-foreground, so it and its range keep the fill.
  expect(fill(insetRange!)).toBe(LIME);
  expect(fill(insetThumb!)).toBe(LIME);
});

it("takes a custom tone from a [data-slot][data-color] rule", async () => {
  await withBrand(async () => {
    await render(() => [
      h(Switch, { color: "brand", defaultValue: true }),
      h(Checkbox, { color: "brand", defaultValue: true }),
      h(RadioGroup, { color: "brand", defaultValue: "a" }, () => h(Radio, { value: "a" })),
      h(Slider, { color: "brand", defaultValue: 50 }),
      h(Switch, { color: "brand" }),
      h(CheckboxGroup, { variant: "card", color: "brand", defaultValue: ["a"] }, () => [
        option(h(Checkbox, { value: "a" })),
      ]),
      h(CheckboxGroup, { variant: "list", color: "brand", defaultValue: ["a"] }, () => [
        option(h(Checkbox, { value: "a" })),
      ]),
    ]);
    const [onSwitch, offSwitch] = parts("switch");
    const [box, cardBox, rowBox] = parts("checkbox");
    const [card, row] = parts("field");

    expect(fill(onSwitch!)).toBe(PINK);
    expect(edge(onSwitch!)).toBe(PLUM);
    expect(edge(offSwitch!)).toBe(GREY);
    expect(fill(box!)).toBe(PINK);
    expect(edge(box!)).toBe(PLUM);
    expect(edge(part("radio"))).toBe(PLUM);
    expect(fill(dot(part("radio")))).toBe(PLUM);
    expect(fill(part("slider-range"))).toBe(PLUM);
    expect(fill(cardBox!)).toBe(PINK);
    expect(edge(card!)).toBe(PLUM);
    expect(fill(rowBox!)).toBe(PINK);
    expect(fill(row!)).toBe(tint(PINK));
  });
});

it("turns a colored control destructive when it is invalid", async () => {
  await render(() => [
    h(Switch, { color: "success", "aria-invalid": "true" }),
    h(Switch, { color: "success", defaultValue: true, "aria-invalid": "true" }),
    h(Checkbox, { color: "success", defaultValue: true, "aria-invalid": "true" }),
    h(Slider, { color: "success", defaultValue: 50, "aria-invalid": "true" }),
    h(RadioGroup, { "aria-invalid": "true", color: "success", defaultValue: "a" }, () => h(Radio, { value: "a" })),
  ]);
  const [offSwitch, onSwitch] = parts("switch");

  expect(edge(offSwitch!)).toBe(RED);
  expect(halo(part("switch-thumb"))).toBe(RED);
  expect(fill(onSwitch!)).toBe(RED);
  expect(edge(onSwitch!)).toBe(RED);
  expect(fill(part("checkbox"))).toBe(RED);
  expect(edge(part("checkbox"))).toBe(RED);
  expect(fill(part("slider-range"))).toBe(RED);
  expect(fill(part("slider-handle"))).toBe(RED);
  expect(edge(part("radio"))).toBe(RED);
  expect(fill(dot(part("radio")))).toBe(RED);
});

it("turns a control in a custom color destructive when it is invalid", async () => {
  await withBrand(async () => {
    await render(() => [
      h(Switch, { color: "brand", defaultValue: true, "aria-invalid": "true" }),
      h(Checkbox, { color: "brand", defaultValue: true, "aria-invalid": "true" }),
      h(Slider, { color: "brand", defaultValue: 50, "aria-invalid": "true" }),
      h(RadioGroup, { "aria-invalid": "true", color: "brand", defaultValue: "a" }, () => h(Radio, { value: "a" })),
    ]);

    expect(fill(part("switch"))).toBe(RED);
    expect(edge(part("switch"))).toBe(RED);
    expect(halo(part("switch-thumb"))).toBe(RED);
    expect(fill(part("checkbox"))).toBe(RED);
    expect(edge(part("checkbox"))).toBe(RED);
    expect(fill(part("slider-range"))).toBe(RED);
    expect(fill(part("slider-handle"))).toBe(RED);
    expect(edge(part("radio"))).toBe(RED);
    expect(fill(dot(part("radio")))).toBe(RED);
  });
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
  expect(edge(radio!)).toBe(FOREST);
  expect(ownRadio!.dataset.color).toBe("warning");
});

it("rings a control in its tone's text colour, destructive's once invalid, and a primary one in --ring", async () => {
  await render(() => [
    h(Switch, { color: "success" }),
    h(Switch),
    h(Switch, { color: "success", "aria-invalid": "true" }),
    h(Switch, { "aria-invalid": "true" }),
  ]);
  const [colored, primary, invalid, invalidPrimary] = parts("switch");
  const focus = async (element: Element) => {
    await userEvent.tab();
    expect(document.activeElement).toBe(element);
    return outline(element);
  };
  const base = ring();

  expect(await focus(colored!)).toBe(ring(FOREST));
  expect(await focus(primary!)).toBe(base);
  expect(base).not.toBe(ring(FOREST));
  expect(await focus(invalid!)).toBe(ring(RED));
  expect(await focus(invalidPrimary!)).toBe(base);
});

it("rings a focused card like the control in it, in the group's color", async () => {
  await render(() => [
    h(CheckboxGroup, { variant: "card", color: "success" }, () => [option(h(Checkbox, { value: "a" }))]),
    h(CheckboxGroup, { variant: "card", color: "success" }, () => [
      option(h(Checkbox, { value: "a" }), { invalid: true }),
    ]),
    h(CheckboxGroup, { variant: "card", color: "success", "aria-invalid": "true" }, () => [
      option(h(Checkbox, { value: "a" })),
    ]),
    h(CheckboxGroup, { variant: "card" }, () => [option(h(Checkbox, { value: "a" }))]),
  ]);
  const expected = [ring(FOREST), ring(RED), ring(RED), ring()];

  for (const [index, checkbox] of parts("checkbox").entries()) {
    await userEvent.tab();
    expect(document.activeElement).toBe(checkbox);
    expect(outline(checkbox), `control ${index}`).toBe(expected[index]);
    expect(outline(checkbox.closest("[data-slot=field]")!), `card ${index}`).toBe(expected[index]);
  }
});

// Copies made before the `color` prop render the same markup without data-color, so the two must draw alike.
const drawn = ["color", "background-color", "border-top-color", "border-left-color", "outline-color", "box-shadow"];
const looks = (root: Element) =>
  [root, ...root.querySelectorAll("*")].flatMap((element) =>
    [null, "::before", "::after"].flatMap((pseudo) => {
      const style = getComputedStyle(element, pseudo);
      return drawn.map((property) => style.getPropertyValue(property));
    }),
  );

it("draws a primary control exactly like a copy without data-color", async () => {
  await render(() => [
    h(Switch),
    h(Switch, { defaultValue: true }),
    h(Checkbox),
    h(Checkbox, { defaultValue: true }),
    h(Checkbox, { defaultValue: "indeterminate" }),
    h(RadioGroup, { defaultValue: "a" }, () => [h(Radio, { value: "a" }), h(Radio, { value: "b" })]),
    h(Slider, { defaultValue: 50 }),
    h(Slider, { defaultValue: 50, variant: "inset" }),
  ]);
  const controls = ["switch", "checkbox", "radio", "slider"].flatMap(parts);
  expect(controls).toHaveLength(9);

  for (const control of controls) {
    const copy = control.cloneNode(true) as HTMLElement;
    copy.removeAttribute("data-color");
    control.after(copy);
    expect(looks(copy), control.dataset.slot).toEqual(looks(control));
  }
});
