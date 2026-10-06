import { CalendarDate, CalendarDateTime } from "@internationalized/date";
import { CalendarDays } from "@lucide/vue";
import { mount } from "@vue/test-utils";
import type { DateRange } from "reka-ui";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, shallowRef } from "vue";

import { Field, FieldLabel } from "@/ui/field";
import { InputDateRange } from "@/ui/input-date";
import { InputGroup, InputGroupAddon } from "@/ui/input-group";

afterEach(() => {
  document.body.innerHTML = "";
});

const colors = "--input: rgb(0, 0, 255); --primary: rgb(0, 128, 0); --destructive: rgb(255, 0, 0)";

const render = (node: VNode) => mount({ render: () => node }, { attachTo: document.body });
const range = () => document.querySelector<HTMLElement>("[data-slot=input-date-range]")!;
const editable = () =>
  [...document.querySelectorAll<HTMLElement>("[data-slot=input-date-segment]")].filter(
    (segment) => segment.getAttribute("role") === "spinbutton",
  );
const texts = () => editable().map((segment) => segment.textContent);
const form = () => document.querySelector("form")!;
const march = { start: new CalendarDate(2024, 3, 1), end: new CalendarDate(2024, 3, 7) };
const show = (value: DateRange | null | undefined) => `${String(value?.start)} ${String(value?.end)}`;

const bound = (initial: DateRange | null | undefined, props: Record<string, unknown> = {}) => {
  const value = shallowRef<DateRange | null | undefined>(initial);
  mount(
    defineComponent(
      () => () =>
        h("form", [
          h(InputDateRange, {
            locale: "en-US",
            name: "trip",
            ...props,
            modelValue: value.value,
            "onUpdate:modelValue": (next: DateRange) => (value.value = next),
          }),
        ]),
    ),
    { attachTo: document.body },
  );
  return value;
};

const paste = (target: HTMLElement, text: string) => {
  const data = new DataTransfer();
  data.setData("text", text);
  target.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
};

it("renders start and end segments around a hidden separator", () => {
  render(h(InputDateRange, { style: colors, locale: "en-US", defaultValue: march }));
  expect(range().getAttribute("role")).toBe("group");
  expect(range().dataset.variant).toBe("outline");
  expect(range().offsetHeight).toBe(36);
  expect(texts()).toEqual(["3", "1", "2024", "3", "7", "2024"]);
  const separator = range().querySelector<HTMLElement>("[data-slot=input-date-range-separator]")!;
  expect(separator.getAttribute("aria-hidden")).toBe("true");
  expect(separator.getBoundingClientRect().left).toBeGreaterThan(editable()[2]!.getBoundingClientRect().right - 1);
  expect(separator.getBoundingClientRect().right).toBeLessThan(editable()[3]!.getBoundingClientRect().left + 1);
});

it("emits the range once both ends are typed", async () => {
  const value = bound(undefined);
  await userEvent.click(editable()[0]!);
  await userEvent.keyboard("030120240307");
  expect(value.value?.start?.toString()).toBe("2024-03-01");
  expect(value.value?.end).toBeUndefined();
  await userEvent.keyboard("2024");
  expect(show(value.value)).toBe("2024-03-01 2024-03-07");
});

it("marks the range invalid when the end comes before the start", () => {
  render(
    h(InputDateRange, {
      style: colors,
      defaultValue: { start: new CalendarDate(2024, 3, 7), end: new CalendarDate(2024, 3, 1) },
    }),
  );
  expect(range().dataset.invalid).toBe("");
  for (const segment of editable()) expect(segment.getAttribute("aria-invalid")).toBe("true");
  expect(getComputedStyle(range()).borderTopColor).toBe("rgb(255, 0, 0)");
});

it("renders empty without a model, with null and with an empty range (shadcn-vue#504)", async () => {
  for (const value of [undefined, null, { start: undefined, end: undefined }]) {
    render(h(InputDateRange, { locale: "en-US", modelValue: value }));
    expect(editable()).toHaveLength(6);
    for (const segment of editable()) expect(segment.hasAttribute("data-placeholder")).toBe(true);
    document.body.innerHTML = "";
  }
});

it("empties both ends when the model is cleared (reka-ui#1939)", async () => {
  const value = bound(march);
  value.value = { start: undefined, end: undefined };
  await nextTick();
  for (const segment of editable()) expect(segment.hasAttribute("data-placeholder")).toBe(true);
  value.value = march;
  await nextTick();
  value.value = null;
  await nextTick();
  for (const segment of editable()) expect(segment.hasAttribute("data-placeholder")).toBe(true);
});

it("submits each end under name[start] and name[end], empty while unset", async () => {
  const value = bound(undefined);
  expect([...new FormData(form()).entries()]).toEqual([
    ["trip[start]", ""],
    ["trip[end]", ""],
  ]);
  value.value = { start: march.start, end: undefined };
  await nextTick();
  expect(new FormData(form()).get("trip[start]")).toBe("2024-03-01");
  expect(new FormData(form()).get("trip[end]")).toBe("");
  value.value = march;
  await nextTick();
  expect(new FormData(form()).get("trip[end]")).toBe("2024-03-07");
  expect(new FormData(form()).has("trip")).toBe(false);
});

it("submits date and time ends as datetime-local values", () => {
  bound(
    { start: new CalendarDateTime(2024, 3, 1, 9, 0), end: new CalendarDateTime(2024, 3, 1, 17, 30) },
    { granularity: "minute", hourCycle: 24 },
  );
  expect(new FormData(form()).get("trip[start]")).toBe("2024-03-01T09:00");
  expect(new FormData(form()).get("trip[end]")).toBe("2024-03-01T17:30");
  expect(form().checkValidity()).toBe(true);
});

it("fails native validation when required and incomplete, or outside min and max", async () => {
  const value = bound(undefined, { required: true });
  expect(form().checkValidity()).toBe(false);
  value.value = { start: march.start, end: undefined };
  await nextTick();
  expect(form().checkValidity()).toBe(false);
  value.value = march;
  await nextTick();
  expect(form().checkValidity()).toBe(true);
  document.body.innerHTML = "";

  bound(march, { maxValue: new CalendarDate(2024, 3, 5) });
  expect(form().checkValidity()).toBe(false);
});

it("lets any time on the max day pass the end's max", async () => {
  const value = bound(
    { start: new CalendarDateTime(2024, 3, 14, 9, 0), end: new CalendarDateTime(2024, 3, 15, 18, 45) },
    { maxValue: new CalendarDate(2024, 3, 15) },
  );
  const end = document.querySelector<HTMLInputElement>("input[name='trip[end]']")!;
  expect(end.max).toBe("2024-03-15T23:59");
  expect(form().checkValidity()).toBe(true);
  expect(range().hasAttribute("data-invalid")).toBe(false);
  value.value = { start: value.value!.start, end: new CalendarDateTime(2024, 3, 16, 0, 0) };
  await nextTick();
  expect(form().checkValidity()).toBe(false);
});

it("takes id, label, required and disabled from a Field", async () => {
  render(h(Field, { required: true }, () => [h(FieldLabel, () => "Trip dates"), h(InputDateRange, { name: "trip" })]));
  await nextTick();
  const label = document.querySelector<HTMLElement>("[data-slot=field-label]")!;
  const native = document.querySelector<HTMLInputElement>("input[name='trip[start]']")!;
  expect(range().getAttribute("aria-labelledby")).toBe(label.id);
  expect(native.id).toBe(label.getAttribute("for"));
  expect(native.getAttribute("aria-hidden")).toBe("true");
  expect(native.tabIndex).toBe(-1);
  expect(native.required).toBe(true);
  expect(document.querySelector<HTMLInputElement>("input[name='trip[end]']")!.required).toBe(true);
  await userEvent.click(label);
  expect(document.activeElement).toBe(editable()[0]);
  document.body.innerHTML = "";

  render(h(Field, { disabled: true }, () => [h(FieldLabel, () => "Trip"), h(InputDateRange, { name: "trip" })]));
  await nextTick();
  expect(range().dataset.disabled).toBe("");
  expect(document.querySelector<HTMLInputElement>("input[name='trip[start]']")!.disabled).toBe(true);
});

it("submits the form on Enter and emits focus and blur once", async () => {
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
        h(InputDateRange, {
          defaultValue: march,
          onFocus: () => events.push("focus"),
          onBlur: () => events.push("blur"),
        }),
        h("button", { type: "button" }, "after"),
      ],
    ),
  );
  await userEvent.click(editable()[0]!);
  await userEvent.keyboard("{Tab}{Tab}{Tab}{Tab}{Tab}");
  expect(document.activeElement).toBe(editable()[5]);
  await userEvent.keyboard("{Enter}");
  expect(submitted).toBe(1);
  await userEvent.keyboard("{Tab}");
  expect(events).toEqual(["focus", "blur"]);
});

it("pastes a date into the end that has focus, or an ISO interval into both", async () => {
  const value = bound(march);
  paste(editable()[4]!, "2024-03-10");
  await nextTick();
  expect(show(value.value)).toBe("2024-03-01 2024-03-10");
  paste(editable()[0]!, "2024-04-01/2024-04-05");
  await nextTick();
  expect(show(value.value)).toBe("2024-04-01 2024-04-05");
  expect(texts()).toEqual(["4", "1", "2024", "4", "5", "2024"]);
});

it("focuses its first segment from a click on the frame or on an addon", async () => {
  render(h(InputDateRange, { class: "w-96" }));
  const box = range().getBoundingClientRect();
  await userEvent.click(range(), { position: { x: box.width - 8, y: box.height / 2 } });
  expect(document.activeElement).toBe(editable()[0]);
  document.body.innerHTML = "";

  render(h(InputGroup, () => [h(InputGroupAddon, () => h(CalendarDays)), h(InputDateRange)]));
  document.querySelector<HTMLElement>("[data-slot=input-group-addon]")!.click();
  await nextTick();
  expect(document.activeElement).toBe(editable()[0]);
});
