import { Time } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import type { TimeValue } from "reka-ui";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, shallowRef } from "vue";

import { Field, FieldError, FieldLabel } from "@/ui/field";
import { InputTime } from "@/ui/input-time";

afterEach(() => {
  document.body.innerHTML = "";
});

const colors =
  "--input: rgb(0, 0, 255); --primary: rgb(0, 128, 0); --destructive: rgb(255, 0, 0); --disabled-opacity: 38%";

const render = (node: VNode) => mount({ render: () => node }, { attachTo: document.body });
const root = () => document.querySelector<HTMLElement>("[data-slot=input-time]")!;
const segments = () => [...document.querySelectorAll<HTMLElement>("[data-slot=input-time-segment]")];
const editable = () => segments().filter((segment) => segment.getAttribute("role") === "spinbutton");
const hidden = () => document.querySelector<HTMLInputElement>("input[tabindex='-1']")!;
const settle = () => new Promise((resolve) => setTimeout(resolve, 250));

it("renders hour and minute spinbuttons around a literal inside a group frame", () => {
  render(h(InputTime, { style: colors, hourCycle: 24, defaultValue: new Time(14, 30) }));
  expect(root().getAttribute("role")).toBe("group");
  expect(root().dataset.variant).toBe("outline");
  expect(root().dataset.size).toBe("md");
  expect(root().offsetHeight).toBe(36);
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(0, 0, 255)");
  expect(segments().map((segment) => segment.dataset.rekaTimeFieldSegment)).toEqual([
    "hour",
    "literal",
    "minute",
    "literal",
  ]);
  expect(editable().map((segment) => segment.textContent)).toEqual(["14", "30"]);
  expect(segments().at(-1)!.getBoundingClientRect().width).toBe(0);
});

it("takes Input's heights", () => {
  const heights = (["xs", "sm", "md", "lg", "xl"] as const).map((size) => {
    const wrapper = render(h(InputTime, { size }));
    const height = root().offsetHeight;
    wrapper.unmount();
    return height;
  });
  expect(heights).toEqual([28, 32, 36, 40, 48]);
});

it("updates the model from typed digits and arrow keys", async () => {
  const updates: string[] = [];
  render(h(InputTime, { hourCycle: 24, "onUpdate:modelValue": (value?: TimeValue) => updates.push(String(value)) }));
  await userEvent.click(editable()[0]!);
  await userEvent.keyboard("0945");
  expect(updates.at(-1)).toBe("09:45:00");
  await userEvent.keyboard("{ArrowUp}");
  expect(updates.at(-1)).toBe("09:46:00");
});

it("gives undefined when a segment is cleared", async () => {
  const value = shallowRef<TimeValue | undefined>(new Time(9, 5));
  mount(
    defineComponent(
      () => () =>
        h(InputTime, {
          hourCycle: 24,
          modelValue: value.value,
          "onUpdate:modelValue": (next?: TimeValue) => (value.value = next),
        }),
    ),
    { attachTo: document.body },
  );
  await userEvent.click(editable()[1]!);
  await userEvent.keyboard("{Backspace}");
  expect(value.value).toBeUndefined();
  expect(editable()[1]!.hasAttribute("data-placeholder")).toBe(true);
});

it("adds an AM/PM segment in the 12-hour cycle", () => {
  render(h(InputTime, { hourCycle: 12, defaultValue: new Time(14, 30) }));
  expect(editable().map((segment) => segment.textContent)).toEqual(["2", "30", "PM"]);
});

it("rings the frame and highlights the segment that has focus", async () => {
  render(h(InputTime, { style: colors, hourCycle: 24, defaultValue: new Time(9, 30) }));
  editable()[1]!.focus();
  await settle();
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(0, 128, 0)");
  expect(getComputedStyle(editable()[1]!).backgroundColor).toBe("rgb(0, 128, 0)");
});

it("marks the segments and the frame invalid outside min and max", () => {
  render(h(InputTime, { style: colors, hourCycle: 24, defaultValue: new Time(20, 0), maxValue: new Time(18, 0) }));
  expect(root().dataset.invalid).toBe("");
  for (const segment of editable()) expect(segment.getAttribute("aria-invalid")).toBe("true");
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(255, 0, 0)");
});

it("takes id, label, error, required and invalid from a Field", async () => {
  render(
    h(Field, { invalid: true, required: true }, () => [
      h(FieldLabel, () => "Start"),
      h(InputTime, { style: colors }),
      h(FieldError, { errors: "Pick a start time." }),
    ]),
  );
  await nextTick();
  const label = document.querySelector<HTMLElement>("[data-slot=field-label]")!;
  const error = document.querySelector<HTMLElement>("[data-slot=field-error]")!;
  expect(root().getAttribute("aria-labelledby")).toBe(label.id);
  expect(root().getAttribute("aria-describedby")).toBe(error.id);
  expect(hidden().id).toBe(label.getAttribute("for"));
  expect(hidden().required).toBe(true);
  for (const segment of editable()) expect(segment.getAttribute("aria-invalid")).toBe("true");
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(255, 0, 0)");
  await userEvent.click(label);
  expect(document.activeElement).toBe(editable()[0]);
});

it("is disabled by the prop or by a disabled field", async () => {
  render(h(InputTime, { style: colors, disabled: true }));
  expect(root().dataset.disabled).toBe("");
  expect(hidden().disabled).toBe(true);
  for (const segment of editable()) expect(segment.getAttribute("contenteditable")).toBe("false");
  expect(getComputedStyle(root()).borderTopColor).not.toBe("rgb(0, 0, 255)");
  document.body.innerHTML = "";

  render(h(Field, { disabled: true }, () => [h(FieldLabel, () => "Start"), h(InputTime)]));
  await nextTick();
  expect(root().dataset.disabled).toBe("");
});

it("shows a spinner at the end and marks the field busy while loading", () => {
  render(h(InputTime, { loading: true, hourCycle: 24, defaultValue: new Time(9, 30) }));
  expect(root().getAttribute("aria-busy")).toBe("true");
  const spinner = root().querySelector<HTMLElement>("[data-slot=spinner]")!;
  expect(spinner.getBoundingClientRect().left).toBeGreaterThan(editable()[1]!.getBoundingClientRect().right + 40);
});

it("submits the time under its name", () => {
  render(h("form", [h(InputTime, { name: "start", defaultValue: new Time(9, 30) })]));
  expect(new FormData(document.querySelector("form")!).get("start")).toBe("09:30:00");
});
