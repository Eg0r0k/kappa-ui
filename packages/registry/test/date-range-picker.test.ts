import { CalendarDate } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import type { DateRange, DateValue } from "reka-ui";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, shallowRef } from "vue";

import { Button } from "@/ui/button";
import {
  DateRangePicker,
  DateRangePickerCalendar,
  DateRangePickerContent,
  DateRangePickerTrigger,
  DateRangePickerValue,
} from "@/ui/date-range-picker";
import { Field, FieldLabel } from "@/ui/field";

let unmount: (() => void) | undefined;
afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
});

const render = (node: () => VNode) => {
  const wrapper = mount(defineComponent({ setup: () => () => h("div", [node()]) }), { attachTo: document.body });
  unmount = () => wrapper.unmount();
  return wrapper;
};

const d = (day: number, month = 10) => new CalendarDate(2026, month, day);

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const frame = () => q("[data-slot=date-range-picker-input]");
const segments = () => all("[data-slot=input-date-segment][role=spinbutton]");
const texts = () => segments().map((segment) => segment.textContent);
const trigger = () => q("[data-slot=date-picker-trigger]");
const content = () => document.querySelector<HTMLElement>("[data-slot=date-picker-content]");
const day = (value: string) =>
  q(`[data-slot=range-calendar-cell-trigger][data-value="${value}"]:not([data-outside-view])`);
const cell = (value: string) => day(value).closest<HTMLElement>("[data-slot=range-calendar-cell]")!;
const style = (element: Element) => getComputedStyle(element);
const settle = () => new Promise((resolve) => setTimeout(resolve, 250));
const closed = () => expect.poll(() => content()).toBeNull();

const open = async () => {
  await userEvent.click(trigger());
  await expect.poll(() => content()).not.toBeNull();
};

const bound = (initial: DateRange | undefined, props: Record<string, unknown> = {}) => {
  const value = shallowRef<DateRange | undefined>(initial);
  const starts: (DateValue | undefined)[] = [];
  render(() =>
    h(DateRangePicker, {
      locale: "en-US",
      ...props,
      modelValue: value.value,
      "onUpdate:modelValue": (next: DateRange) => (value.value = next),
      "onUpdate:startValue": (next?: DateValue) => starts.push(next),
    }),
  );
  return { value, starts };
};

const iso = (range: DateRange | undefined) => `${range?.start?.toString()}/${range?.end?.toString()}`;

describe("field", () => {
  it("puts start and end segments and the trigger in one frame", () => {
    bound({ start: d(6), end: d(12) });
    expect(frame().dataset.variant).toBe("outline");
    expect(frame().offsetHeight).toBe(36);
    expect(texts()).toEqual(["10", "6", "2026", "10", "12", "2026"]);
    expect(q("[data-slot=input-date-range-separator]").getAttribute("aria-hidden")).toBe("true");
    expect(frame().lastElementChild).toBe(trigger());
    expect(trigger().getAttribute("aria-label")).toBe("Open calendar");
  });

  it("updates the range from typed digits", async () => {
    const { value } = bound(undefined);
    await userEvent.click(segments()[0]!);
    await userEvent.keyboard("10062026");
    await userEvent.click(segments()[3]!);
    await userEvent.keyboard("10122026");
    expect(iso(value.value)).toBe("2026-10-06/2026-10-12");
  });
});

describe("calendar", () => {
  it("picks a start and an end, then closes back on the trigger", async () => {
    const { value, starts } = bound(undefined, { defaultPlaceholder: d(1) });
    await open();
    expect(content()!.contains(document.activeElement)).toBe(true);
    await userEvent.click(day("2026-10-06"));
    expect(value.value?.start?.toString()).toBe("2026-10-06");
    expect(value.value?.end).toBeUndefined();
    expect(starts.at(-1)?.toString()).toBe("2026-10-06");
    expect(content()).not.toBeNull();
    await userEvent.click(day("2026-10-12"));
    expect(iso(value.value)).toBe("2026-10-06/2026-10-12");
    await closed();
    await expect.poll(() => document.activeElement).toBe(trigger());
    expect(texts()).toEqual(["10", "6", "2026", "10", "12", "2026"]);
  });

  it("bands the days between the ends", async () => {
    render(() =>
      h("div", { style: "--tone-soft: rgb(0, 0, 255)" }, [
        h(DateRangePicker, { defaultValue: { start: d(6), end: d(9) }, locale: "en-US" }),
      ]),
    );
    await open();
    expect(day("2026-10-07").hasAttribute("data-selected")).toBe(true);
    expect(style(cell("2026-10-07")).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(style(cell("2026-10-12")).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("draws a range once with two months, hiding the neighbours' days (reka-ui#2730)", async () => {
    bound({ start: d(28), end: d(3, 11) }, { numberOfMonths: 2 });
    await open();
    expect(all("[data-slot=range-calendar-grid]")).toHaveLength(2);
    const copy = q('[data-slot=range-calendar-cell-trigger][data-value="2026-11-01"][data-outside-view]');
    expect(style(copy).visibility).toBe("hidden");
    expect(style(copy.closest("[data-slot=range-calendar-cell]")!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("restores the last range when Escape interrupts a pick", async () => {
    const { value } = bound({ start: d(6), end: d(12) });
    await open();
    await userEvent.click(day("2026-10-20"));
    await userEvent.keyboard("{Escape}");
    await closed();
    expect(iso(value.value)).toBe("2026-10-06/2026-10-12");
  });

  it("caps the length with maximumDays and reads a swapped matcher", async () => {
    const unavailable = shallowRef((date: DateValue) => date.day === 15);
    render(() =>
      h(DateRangePicker, {
        defaultPlaceholder: d(1),
        maximumDays: 5,
        isDateUnavailable: unavailable.value,
        locale: "en-US",
      }),
    );
    await open();
    expect(day("2026-10-15").hasAttribute("data-unavailable")).toBe(true);
    unavailable.value = (date: DateValue) => date.day === 16;
    await nextTick();
    expect(day("2026-10-15").hasAttribute("data-unavailable")).toBe(false);
    expect(day("2026-10-16").hasAttribute("data-unavailable")).toBe(true);
    await userEvent.click(day("2026-10-06"));
    expect(day("2026-10-12").hasAttribute("data-disabled")).toBe(true);
  });
});

describe("forms", () => {
  const form = (child: () => VNode) => {
    const submits: FormData[] = [];
    render(() =>
      h(
        "form",
        {
          onSubmit: (event: SubmitEvent) => {
            event.preventDefault();
            submits.push(new FormData(event.target as HTMLFormElement));
          },
        },
        [child()],
      ),
    );
    return { submits, element: q("form") as HTMLFormElement };
  };

  it("submits name[start] and name[end], empty while unset, never Reka's 'undefined - undefined'", async () => {
    const value = shallowRef<DateRange | undefined>({ start: d(6), end: undefined });
    const { submits, element } = form(() =>
      h(DateRangePicker, {
        name: "stay",
        modelValue: value.value,
        "onUpdate:modelValue": (next: DateRange) => (value.value = next),
      }),
    );
    element.requestSubmit();
    expect([...submits[0]!.entries()]).toEqual([
      ["stay[start]", "2026-10-06"],
      ["stay[end]", ""],
    ]);
    value.value = { start: d(6), end: d(12) };
    await nextTick();
    element.requestSubmit();
    expect([...submits[1]!.entries()]).toEqual([
      ["stay[start]", "2026-10-06"],
      ["stay[end]", "2026-10-12"],
    ]);
  });

  it("fails required until both ends are set", async () => {
    const value = shallowRef<DateRange | undefined>({ start: d(6), end: undefined });
    const { element } = form(() =>
      h(DateRangePicker, {
        name: "stay",
        required: true,
        modelValue: value.value,
        "onUpdate:modelValue": (next: DateRange) => (value.value = next),
      }),
    );
    expect(element.checkValidity()).toBe(false);
    value.value = { start: d(6), end: d(12) };
    await nextTick();
    expect(element.checkValidity()).toBe(true);
  });

  it("never submits from the trigger or the days", async () => {
    const { submits } = form(() => h(DateRangePicker, { name: "stay", defaultPlaceholder: d(1), locale: "en-US" }));
    await open();
    await userEvent.click(day("2026-10-06"));
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await closed();
    await settle();
    expect(submits).toHaveLength(0);
  });
});

describe("with a button trigger", () => {
  const picker = (props: Record<string, unknown> = {}) =>
    h(DateRangePicker, { locale: "en-US", ...props }, () => [
      h(DateRangePickerTrigger, { asChild: true }, () =>
        h(Button, { variant: "outline", color: "neutral" }, () =>
          h(DateRangePickerValue, { placeholder: "Pick dates" }),
        ),
      ),
      h(DateRangePickerContent, () => h(DateRangePickerCalendar, { numberOfMonths: 2 })),
    ]);

  it("formats the range as one, sharing what both ends have in common", async () => {
    const value = shallowRef<DateRange | undefined>();
    render(() => picker({ modelValue: value.value, "onUpdate:modelValue": (next: DateRange) => (value.value = next) }));
    const label = q("[data-slot=date-range-picker-value]");
    expect(label.textContent).toBe("Pick dates");
    expect(label.hasAttribute("data-placeholder")).toBe(true);
    value.value = { start: d(6), end: undefined };
    await nextTick();
    expect(label.textContent).toBe("Oct 6, 2026 –");
    value.value = { start: d(6), end: d(12) };
    await nextTick();
    expect(label.textContent).toMatch(/^Oct 6\s–\s12, 2026$/);
  });

  it("takes the field's id and submits through hidden inputs", async () => {
    const submits: FormData[] = [];
    render(() =>
      h(
        "form",
        {
          onSubmit: (event: SubmitEvent) => {
            event.preventDefault();
            submits.push(new FormData(event.target as HTMLFormElement));
          },
        },
        [
          h(Field, () => [
            h(FieldLabel, () => "Stay"),
            picker({ name: "stay", defaultValue: { start: d(6), end: d(12) } }),
          ]),
        ],
      ),
    );
    await nextTick();
    expect(trigger().id).toBe(q("[data-slot=field-label]").getAttribute("for"));
    (q("form") as HTMLFormElement).requestSubmit();
    expect([...submits[0]!.entries()]).toEqual([
      ["stay[start]", "2026-10-06"],
      ["stay[end]", "2026-10-12"],
    ]);
    await open();
    expect(all("[data-slot=range-calendar-grid]")).toHaveLength(2);
  });
});
