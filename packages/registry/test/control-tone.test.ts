import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { type VNode, defineComponent, h, nextTick } from "vue";

import { Checkbox } from "@/ui/checkbox";
import { Radio, RadioGroup } from "@/ui/radio-group";
import { Slider } from "@/ui/slider";
import { Switch } from "@/ui/switch";

const BLUE = "rgb(0, 0, 255)";
const GREEN = "rgb(0, 128, 0)";
const GREY = "rgb(128, 128, 128)";
const RED = "rgb(255, 0, 0)";
const palette = `--primary: ${BLUE}; --foreground: ${GREEN}; --input: ${GREY}; --destructive: ${RED}`;

afterEach(() => {
  document.body.innerHTML = "";
});

const render = async (node: () => VNode | VNode[]) => {
  mount(defineComponent({ setup: () => () => h("div", { style: palette }, node()) }), { attachTo: document.body });
  await nextTick();
};

const part = (slot: string) => document.querySelector(`[data-slot=${slot}]`)!;
const edge = (slot: string) => getComputedStyle(part(slot)).borderTopColor;
const fill = (slot: string) => getComputedStyle(part(slot)).backgroundColor;
const halo = (slot: string) => getComputedStyle(part(slot), "::before").backgroundColor;

it("draws an unchecked control with the input edge and a foreground halo", async () => {
  await render(() => [h(Switch), h(Checkbox)]);

  expect(edge("switch")).toBe(GREY);
  expect(halo("switch-thumb")).toBe(GREEN);
  expect(edge("checkbox")).toBe(GREY);
  expect(halo("checkbox")).toBe(GREEN);
});

it("fills a checked control and its halo with the primary tone", async () => {
  await render(() => [h(Switch, { defaultValue: true }), h(Checkbox, { defaultValue: true })]);

  expect(fill("switch")).toBe(BLUE);
  expect(halo("switch-thumb")).toBe(BLUE);
  expect(fill("checkbox")).toBe(BLUE);
  expect(halo("checkbox")).toBe(BLUE);
});

it("takes a tone of its own from the class", async () => {
  const tone = "[--tone:rgb(1,2,3)] [--tone-border:rgb(4,5,6)]";
  await render(() => [h(Switch, { class: tone }), h(Checkbox, { defaultValue: true, class: tone })]);

  expect(edge("switch")).toBe("rgb(4, 5, 6)");
  expect(fill("checkbox")).toBe("rgb(1, 2, 3)");
});

it("turns the edge and the halo destructive on an invalid control", async () => {
  await render(() => [h(Switch, { "aria-invalid": "true" }), h(Checkbox, { "aria-invalid": "true" })]);

  expect(edge("switch")).toBe(RED);
  expect(halo("switch-thumb")).toBe(RED);
  expect(edge("checkbox")).toBe(RED);
  expect(halo("checkbox")).toBe(RED);
});

it("turns a radio destructive inside an invalid group", async () => {
  await render(() => h(RadioGroup, { "aria-invalid": "true" }, () => h(Radio, { value: "a" })));

  expect(edge("radio")).toBe(RED);
  expect(halo("radio")).toBe(RED);
});

it("draws the slider in the primary tone, and destructive when a thumb is invalid", async () => {
  await render(() => h(Slider, { defaultValue: [50] }));
  expect(fill("slider-range")).toBe(BLUE);
  expect(halo("slider-thumb")).toBe(BLUE);
  document.body.innerHTML = "";

  await render(() => h(Slider, { defaultValue: [50], "aria-invalid": "true" }));
  expect(fill("slider-range")).toBe(RED);
  expect(halo("slider-thumb")).toBe(RED);
});

// Copies made before the `color` prop render no data-color and lean on tone-control and tone-invalid alone.
const legacyClass = `
  border-2 border-tone-border tone-control
  aria-invalid:tone-invalid in-aria-invalid:tone-invalid
  data-[state=checked]:border-tone data-[state=checked]:bg-tone
`;
const legacy = (state: string, attrs: Record<string, unknown> = {}) =>
  h("button", { "data-slot": "checkbox", "data-state": state, class: legacyClass, ...attrs });
const legacyParts = () => [...document.querySelectorAll("[data-slot=checkbox]")];

it("keeps a copy without data-color primary with the input edge, even inside a colored element", async () => {
  await render(() =>
    h("div", { "data-slot": "alert", "data-color": "destructive" }, [legacy("checked"), legacy("unchecked")]),
  );
  const [checked, unchecked] = legacyParts();

  expect(getComputedStyle(checked!).backgroundColor).toBe(BLUE);
  expect(getComputedStyle(unchecked!).borderTopColor).toBe(GREY);
});

it("still turns a copy without data-color destructive, and still lets a class set its tone", async () => {
  await render(() => [
    legacy("checked", { "aria-invalid": "true" }),
    h("div", { "aria-invalid": "true" }, legacy("unchecked")),
    legacy("checked", { class: `${legacyClass} [--tone:rgb(1,2,3)]` }),
  ]);
  const [invalid, inInvalid, toned] = legacyParts();

  expect(getComputedStyle(invalid!).backgroundColor).toBe(RED);
  expect(getComputedStyle(inInvalid!).borderTopColor).toBe(RED);
  expect(getComputedStyle(toned!).backgroundColor).toBe("rgb(1, 2, 3)");
});

it("keeps primary on an element whose data-color has no data-slot to define it", async () => {
  await render(() =>
    h("button", {
      "data-color": "success",
      "data-state": "checked",
      class: "tone-control data-[state=checked]:bg-tone",
    }),
  );

  expect(getComputedStyle(document.querySelector("button")!).backgroundColor).toBe(BLUE);
});
