import { CalendarDate, type DateValue } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import type { DateRange } from "reka-ui";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, shallowRef } from "vue";

import { Field, FieldLabel } from "@/ui/field";
import { RangeCalendar } from "@/ui/range-calendar";

import { overrideControlTokens, sentinel } from "./control-tokens";

let unmount: (() => void) | undefined;
afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
});

const palette = [
  "--primary: rgb(0, 0, 255)",
  "--primary-foreground: rgb(255, 255, 255)",
  "--success: rgb(0, 128, 0)",
  "--destructive: rgb(255, 0, 0)",
].join("; ");

const render = (node: () => VNode) => {
  const wrapper = mount(defineComponent({ setup: () => () => h("div", { style: palette }, [node()]) }), {
    attachTo: document.body,
  });
  unmount = () => wrapper.unmount();
  return wrapper;
};

const oct = new CalendarDate(2026, 10, 1);
const d = (day: number, month = 10) => new CalendarDate(2026, month, day);

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const root = () => q("[data-slot=range-calendar]");
const heading = () => q("[data-slot=range-calendar-heading]").textContent!.trim();
const day = (value: string) =>
  q(`[data-slot=range-calendar-cell-trigger][data-value="${value}"]:not([data-outside-view])`);
const cell = (value: string) => day(value).closest<HTMLElement>("[data-slot=range-calendar-cell]")!;
const style = (element: Element) => getComputedStyle(element);
// The band is --tone-soft: the tone at 12%.
const band = / \/ 0\.12\)$/;
const range = (value?: DateRange | null) => (value ? `${value.start ?? "-"}/${value.end ?? "-"}` : String(value));

const controlled = (props: Record<string, unknown> = {}, initial: DateRange | null = null) => {
  const value = shallowRef<DateRange | null>(initial);
  const events = { model: [] as string[], valid: [] as string[], start: [] as string[] };
  render(() =>
    h(RangeCalendar, {
      defaultPlaceholder: oct,
      locale: "en-US",
      ...props,
      modelValue: value.value,
      "onUpdate:modelValue": (next: DateRange) => {
        events.model.push(range(next));
        value.value = next;
      },
      "onUpdate:validModelValue": (next: DateRange) => events.valid.push(range(next)),
      "onUpdate:startValue": (next?: DateValue) => events.start.push(String(next)),
    }),
  );
  return { value, events };
};

describe("markup", () => {
  it("renders a group with the calendar's size and colour data", () => {
    render(() => h(RangeCalendar, { defaultPlaceholder: oct, locale: "en-US", color: "success", size: "lg" }));
    expect(root().getAttribute("role")).toBe("group");
    expect(root().dataset.size).toBe("lg");
    expect(root().dataset.color).toBe("success");
    expect(heading()).toBe("October 2026");
    expect(q("[data-slot=range-calendar-grid]").tagName).toBe("TABLE");
    expect(all("[data-slot=range-calendar-grid-body] [data-slot=range-calendar-grid-row]")).toHaveLength(6);
  });

  describe("with sentinel tokens", () => {
    overrideControlTokens();

    it("sizes its days from the control tokens", () => {
      render(() => h(RangeCalendar, { defaultPlaceholder: oct, size: "xl" }));
      expect(day("2026-10-06").getBoundingClientRect().width).toBe(sentinel.height.xl);
      expect(q("[data-slot=range-calendar-prev-button]").getBoundingClientRect().height).toBe(sentinel.height.xl);
    });
  });
});

describe("selection", () => {
  it("picks a start, then an end, emitting the partial range in between and the valid range once", async () => {
    const { value, events } = controlled();
    await userEvent.click(day("2026-10-12"));
    expect(events.model).toEqual(["2026-10-12/-"]);
    expect(events.valid).toEqual([]);
    await userEvent.click(day("2026-10-16"));
    expect(range(value.value)).toBe("2026-10-12/2026-10-16");
    expect(events.valid).toEqual(["2026-10-12/2026-10-16"]);
    expect(events.start[0]).toBe("2026-10-12");
  });

  it("orders a range picked backwards", async () => {
    const { value } = controlled();
    await userEvent.click(day("2026-10-20"));
    await userEvent.click(day("2026-10-14"));
    expect(range(value.value)).toBe("2026-10-14/2026-10-20");
  });

  it("selects with the keyboard", async () => {
    const { value } = controlled({}, { start: d(5), end: d(5) });
    day("2026-10-05").focus();
    await userEvent.keyboard("{ArrowRight}{Enter}{ArrowRight}{ArrowRight}{Enter}");
    expect(range(value.value)).toBe("2026-10-06/2026-10-08");
  });

  it("draws solid ends and a soft band, rounded at the ends", () => {
    controlled({}, { start: d(13), end: d(15) });
    expect(style(day("2026-10-13")).backgroundColor).toBe("rgb(0, 0, 255)");
    expect(style(day("2026-10-15")).backgroundColor).toBe("rgb(0, 0, 255)");
    expect(style(day("2026-10-14")).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(style(day("2026-10-14")).color).toBe("rgb(0, 0, 255)");
    expect(style(cell("2026-10-14")).backgroundColor).toMatch(band);
    expect(style(cell("2026-10-13")).borderStartStartRadius).not.toBe("0px");
    expect(style(cell("2026-10-13")).borderStartEndRadius).toBe("0px");
    expect(style(cell("2026-10-14")).borderStartStartRadius).toBe("0px");
    expect(style(cell("2026-10-15")).borderStartEndRadius).not.toBe("0px");
    expect(style(cell("2026-10-16")).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("previews the range under the pointer, and rounds a lone start on both sides", async () => {
    controlled();
    await userEvent.click(day("2026-10-12"));
    await userEvent.hover(day("2026-10-12"));
    expect(style(cell("2026-10-12")).borderStartEndRadius).not.toBe("0px");
    await userEvent.hover(day("2026-10-14"));
    expect(day("2026-10-13").hasAttribute("data-highlighted")).toBe(true);
    expect(style(cell("2026-10-13")).backgroundColor).toMatch(band);
    expect(style(cell("2026-10-14")).borderStartEndRadius).not.toBe("0px");
  });

  it("restores the last complete range on Escape mid-selection", async () => {
    const { value } = controlled({}, { start: d(5), end: d(7) });
    await userEvent.click(day("2026-10-20"));
    expect(range(value.value)).toBe("2026-10-20/-");
    await userEvent.keyboard("{Escape}");
    await nextTick();
    expect(range(value.value)).toBe("2026-10-05/2026-10-07");
  });

  it("caps the preview and the reachable days with maximum-days", async () => {
    controlled({ maximumDays: 3 });
    await userEvent.click(day("2026-10-10"));
    await userEvent.hover(day("2026-10-11"));
    expect(all("[data-highlighted]:not([data-outside-view])").map((element) => element.dataset.value)).toEqual([
      "2026-10-10",
      "2026-10-11",
      "2026-10-12",
    ]);
    expect(day("2026-10-14").hasAttribute("data-disabled")).toBe(true);
  });

  // reka-ui#1611: clearing from outside must clear the band.
  it.each([null, { start: undefined, end: undefined }])("clears the band when set to %o", async (cleared) => {
    const { value } = controlled({}, { start: d(13), end: d(15) });
    value.value = cleared as DateRange | null;
    await nextTick();
    await nextTick();
    expect(all("[data-slot=range-calendar-cell-trigger][data-selected]")).toEqual([]);
    expect(style(cell("2026-10-14")).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("hides outside days and their band across two months", () => {
    controlled({ numberOfMonths: 2 }, { start: d(28), end: d(3, 11) });
    const copy = q('[data-slot=range-calendar-cell-trigger][data-value="2026-11-02"][data-outside-view]');
    expect(style(copy).visibility).toBe("hidden");
    expect(style(copy.closest("td")!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(style(cell("2026-11-02")).backgroundColor).toMatch(band);
  });
});

describe("matchers", () => {
  it("follows a swapped is-date-unavailable function", async () => {
    const booked = shallowRef<number[]>([]);
    render(() =>
      h(RangeCalendar, {
        defaultPlaceholder: oct,
        isDateUnavailable: (
          (list: number[]) => (date: DateValue) =>
            list.includes(date.day)
        )(booked.value),
      }),
    );
    booked.value = [12];
    await nextTick();
    expect(day("2026-10-12").hasAttribute("data-unavailable")).toBe(true);
  });

  it("follows a swapped is-date-highlightable function", async () => {
    const lenient = shallowRef(false);
    render(() =>
      h(RangeCalendar, {
        defaultPlaceholder: oct,
        isDateUnavailable: (date: DateValue) => date.day === 12,
        isDateHighlightable: lenient.value ? () => true : () => false,
      }),
    );
    await userEvent.click(day("2026-10-10"));
    await userEvent.hover(day("2026-10-14"));
    expect(day("2026-10-11").hasAttribute("data-highlighted")).toBe(false);
    lenient.value = true;
    await nextTick();
    await userEvent.hover(day("2026-10-13"));
    await userEvent.hover(day("2026-10-14"));
    expect(day("2026-10-11").hasAttribute("data-highlighted")).toBe(true);
  });
});

describe("focus and forms", () => {
  it("focuses the first visible selected day on mount, not a hidden or outside copy", async () => {
    render(() =>
      h(RangeCalendar, {
        defaultValue: { start: d(28, 9), end: d(5) },
        defaultPlaceholder: oct,
        initialFocus: true,
      }),
    );
    await nextTick();
    expect(document.activeElement).toBe(day("2026-10-01"));
  });

  it("never submits a form on a day, previous or next click", async () => {
    let submits = 0;
    render(() =>
      h(
        "form",
        {
          onSubmit: (event: Event) => {
            event.preventDefault();
            submits++;
          },
        },
        [h(RangeCalendar, { defaultPlaceholder: oct })],
      ),
    );
    await userEvent.click(day("2026-10-06"));
    await userEvent.click(day("2026-10-08"));
    await userEvent.click(q("[data-slot=range-calendar-next-button]"));
    await userEvent.click(q("[data-slot=range-calendar-prev-button]"));
    expect(submits).toBe(0);
  });

  it("is labelled by the field label and the month", async () => {
    render(() =>
      h(Field, { invalid: true }, () => [h(FieldLabel, () => "Stay"), h(RangeCalendar, { defaultPlaceholder: oct })]),
    );
    await nextTick();
    expect(root().getAttribute("aria-labelledby")).toBe(
      `${q("[data-slot=field-label]").id} ${q("[data-slot=range-calendar-heading]").id}`,
    );
    expect(root().getAttribute("aria-invalid")).toBe("true");
  });

  it("marks ends pressed for assistive tech and leaves aria-selected to the cell", () => {
    controlled({}, { start: d(13), end: d(15) });
    expect(day("2026-10-14").getAttribute("aria-pressed")).toBe("true");
    expect(cell("2026-10-14").getAttribute("aria-selected")).toBe("true");
    expect(day("2026-10-14").hasAttribute("aria-selected")).toBe(false);
  });
});
