import { Time } from "@internationalized/date";
import { Clock } from "@lucide/vue";
import { mount } from "@vue/test-utils";
import type { TimeValue } from "reka-ui";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, type VNode, defineComponent, h, nextTick, shallowRef } from "vue";

import { Field, FieldError, FieldLabel } from "@/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/ui/input-group";
import { InputTime, InputTimeRange } from "@/ui/input-time";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

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

const range = () => document.querySelector<HTMLElement>("[data-slot=input-time-range]")!;

it("renders start and end segments around a hidden separator", () => {
  render(
    h(InputTimeRange, {
      style: colors,
      hourCycle: 24,
      defaultValue: { start: new Time(9, 0), end: new Time(17, 30) },
    }),
  );
  expect(range().getAttribute("role")).toBe("group");
  expect(range().offsetHeight).toBe(36);
  expect(editable().map((segment) => segment.textContent)).toEqual(["09", "00", "17", "30"]);
  const separator = range().querySelector<HTMLElement>("[data-slot=input-time-range-separator]")!;
  expect(separator.getAttribute("aria-hidden")).toBe("true");
  expect(separator.getBoundingClientRect().left).toBeGreaterThan(editable()[1]!.getBoundingClientRect().right - 1);
  expect(separator.getBoundingClientRect().right).toBeLessThan(editable()[2]!.getBoundingClientRect().left + 1);
});

it("emits the range once both ends are typed", async () => {
  const updates: string[] = [];
  render(
    h(InputTimeRange, {
      hourCycle: 24,
      "onUpdate:modelValue": (value: { start?: TimeValue; end?: TimeValue }) =>
        updates.push(`${String(value.start)}-${String(value.end)}`),
    }),
  );
  await userEvent.click(editable()[0]!);
  await userEvent.keyboard("09001730");
  expect(updates.at(-1)).toBe("09:00:00-17:30:00");
});

it("submits each end of a range under name[start] and name[end], empty while unset", async () => {
  const value = shallowRef<{ start: TimeValue | undefined; end: TimeValue | undefined } | undefined>(undefined);
  mount(
    defineComponent(
      () => () =>
        h("form", [
          h(InputTimeRange, {
            name: "hours",
            required: true,
            modelValue: value.value,
            "onUpdate:modelValue": (next: { start: TimeValue | undefined; end: TimeValue | undefined }) =>
              (value.value = next),
          }),
        ]),
    ),
    { attachTo: document.body },
  );
  const form = document.querySelector("form")!;
  expect([...new FormData(form).entries()]).toEqual([
    ["hours[start]", ""],
    ["hours[end]", ""],
  ]);
  expect(form.checkValidity()).toBe(false);
  value.value = { start: new Time(9, 0), end: new Time(17, 30) };
  await nextTick();
  expect([...new FormData(form).entries()]).toEqual([
    ["hours[start]", "09:00:00"],
    ["hours[end]", "17:30:00"],
  ]);
  expect(form.checkValidity()).toBe(true);
});

it("points a Field's label at the range's start input", async () => {
  render(h(Field, () => [h(FieldLabel, () => "Opening hours"), h(InputTimeRange, { hourCycle: 24 })]));
  await nextTick();
  const label = document.querySelector<HTMLElement>("[data-slot=field-label]")!;
  const native = document.getElementById(label.getAttribute("for")!) as HTMLInputElement;
  expect(native.getAttribute("aria-hidden")).toBe("true");
  await userEvent.click(label);
  expect(document.activeElement).toBe(editable()[0]);
});

it.each([
  ["InputTime", InputTime as Component],
  ["InputTimeRange", InputTimeRange as Component],
])("%s emits focus and blur once per field and submits the form on Enter", async (_, component) => {
  const events: string[] = [];
  let submitted = 0;
  render(
    h(
      "form",
      {
        onSubmit: (event: SubmitEvent) => {
          event.preventDefault();
          submitted++;
        },
      },
      [
        h(component, {
          hourCycle: 24,
          onFocus: () => events.push("focus"),
          onBlur: () => events.push("blur"),
        }),
        h("button", { type: "button" }, "after"),
      ],
    ),
  );
  await userEvent.click(editable()[0]!);
  await userEvent.keyboard("{Tab}");
  expect(document.activeElement).toBe(editable()[1]);
  expect(events).toEqual(["focus"]);
  await userEvent.keyboard("{Enter}");
  expect(submitted).toBe(1);
  editable().at(-1)!.focus();
  await userEvent.keyboard("{Tab}");
  expect(events).toEqual(["focus", "blur"]);
});

it.each([
  ["InputTime", InputTime as Component],
  ["InputTimeRange", InputTimeRange as Component],
])("%s does nothing on Enter while the form's default button is disabled", async (_, component) => {
  const disabled = shallowRef(true);
  const events: string[] = [];
  mount(
    defineComponent(
      () => () =>
        h(
          "form",
          {
            onSubmit: (event: SubmitEvent) => {
              event.preventDefault();
              events.push("submit");
            },
          },
          [
            h(component, { hourCycle: 24 }),
            h("button", { type: "submit", disabled: disabled.value, onClick: () => events.push("click") }, "Save"),
          ],
        ),
    ),
    { attachTo: document.body },
  );
  await userEvent.click(editable()[0]!);
  await userEvent.keyboard("{Enter}");
  expect(events).toEqual([]);
  disabled.value = false;
  await nextTick();
  editable()[0]!.focus();
  await userEvent.keyboard("{Enter}");
  expect(events).toEqual(["click", "submit"]);
});

it.each([
  ["InputTime", InputTime as Component, 2],
  ["InputTimeRange", InputTimeRange as Component, 4],
])("%s keeps a typed value without v-model when it remounts", async (_, component, count) => {
  const granularity = shallowRef<"minute" | "second">("minute");
  mount(
    defineComponent(() => () => h(component, { granularity: granularity.value, hourCycle: 24 })),
    { attachTo: document.body },
  );
  await userEvent.click(editable()[0]!);
  await userEvent.keyboard(count === 2 ? "0945" : "09451730");
  granularity.value = "second";
  await nextTick();
  await nextTick();
  const shown = editable().map((segment) => segment.textContent);
  expect(shown).toEqual(count === 2 ? ["09", "45", "00"] : ["09", "45", "00", "17", "30", "00"]);
});

it("focuses the first segment when the frame's padding is clicked", async () => {
  render(h(InputTime, { class: "w-60", hourCycle: 24 }));
  const box = root().getBoundingClientRect();
  await userEvent.click(root(), { position: { x: box.width - 8, y: box.height / 2 } });
  expect(document.activeElement).toBe(editable()[0]);
});

it("remounts when the granularity or the hour cycle changes", async () => {
  const granularity = shallowRef<"minute" | "second">("minute");
  const hourCycle = shallowRef<12 | 24>(24);
  mount(
    defineComponent(
      () => () =>
        h(InputTime, {
          granularity: granularity.value,
          hourCycle: hourCycle.value,
          defaultValue: new Time(14, 30, 15),
        }),
    ),
    { attachTo: document.body },
  );
  expect(editable().map((segment) => segment.textContent)).toEqual(["14", "30"]);
  granularity.value = "second";
  await nextTick();
  await nextTick();
  expect(editable().map((segment) => segment.textContent)).toEqual(["14", "30", "15"]);
  await userEvent.click(editable()[1]!);
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(editable()[2]);
  hourCycle.value = 12;
  await nextTick();
  await nextTick();
  expect(editable().map((segment) => segment.textContent)).toEqual(["2", "30", "15", "PM"]);
});

const groupFrame = () => document.querySelector<HTMLElement>("[data-slot=input-group]")!;
const groupControl = () => document.querySelector<HTMLElement>("[data-slot=input-group-control]")!;

it("becomes the frameless control of an InputGroup at the group's size", async () => {
  render(
    h(InputGroup, { size: "sm", style: colors }, () => [
      h(InputGroupAddon, () => h(Clock)),
      h(InputTime, { hourCycle: 24, defaultValue: new Time(9, 30) }),
      h(InputGroupAddon, { align: "inline-end" }, () => h(InputGroupButton, () => "Now")),
    ]),
  );
  expect(groupControl().getAttribute("role")).toBe("group");
  expect(groupControl().dataset.size).toBe("sm");
  expect(getComputedStyle(groupControl()).borderTopWidth).toBe("0px");
  expect(groupFrame().offsetHeight).toBe(32);
  editable()[0]!.focus();
  await settle();
  expect(getComputedStyle(groupFrame()).borderTopColor).toBe("rgb(0, 128, 0)");
  document.querySelector<HTMLElement>("[data-slot=input-group-button]")!.focus();
  await settle();
  expect(getComputedStyle(groupFrame()).borderTopColor).toBe("rgb(0, 0, 255)");
});

it("focuses its first segment when an addon of its group is clicked", async () => {
  render(h(InputGroup, () => [h(InputGroupAddon, () => h(Clock)), h(InputTimeRange, { hourCycle: 24 })]));
  document.querySelector<HTMLElement>("[data-slot=input-group-addon]")!.click();
  await nextTick();
  expect(document.activeElement).toBe(editable()[0]);
});

it("fades the group when disabled inside it", () => {
  render(
    h(InputGroup, { style: colors }, () => [h(InputGroupAddon, () => h(Clock)), h(InputTime, { disabled: true })]),
  );
  const addon = document.querySelector<HTMLElement>("[data-slot=input-group-addon]")!;
  expect(Number(getComputedStyle(addon).opacity)).toBeLessThan(1);
  expect(getComputedStyle(groupFrame()).borderTopColor).not.toBe("rgb(0, 0, 255)");
});

describe("InputTime control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("%s reads its height and padding tokens", (size) => {
    render(h(InputTime, { size }));
    const style = getComputedStyle(root());

    expect(px(style.height)).toBe(sentinel.height[size]);
    expect(px(style.paddingInlineStart)).toBe(sentinel.padding[size]);
  });
});
