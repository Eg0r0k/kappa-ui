import { CalendarDate, type DateValue, getLocalTimeZone, isWeekend, today } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { CalendarRoot, ConfigProvider } from "reka-ui";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, shallowRef } from "vue";

import { Calendar, CalendarHeading } from "@/ui/calendar";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

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
  "--success-foreground: rgb(0, 30, 0)",
  "--success-text: rgb(0, 90, 0)",
  "--foreground: rgb(10, 10, 10)",
  "--background: rgb(250, 250, 250)",
  "--destructive: rgb(255, 0, 0)",
  "--muted-foreground: rgb(120, 120, 120)",
  "--disabled-opacity: 38%",
  "--disabled-container-opacity: 12%",
].join("; ");

const render = (node: () => VNode, warnings?: string[]) => {
  const wrapper = mount(defineComponent({ setup: () => () => h("div", { style: palette }, [node()]) }), {
    attachTo: document.body,
    global: warnings ? { config: { warnHandler: (message) => warnings.push(message) } } : undefined,
  });
  unmount = () => wrapper.unmount();
  return wrapper;
};

const oct6 = new CalendarDate(2026, 10, 6);

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const root = () => q("[data-slot=calendar]");
const heading = () => q("[data-slot=calendar-heading]").textContent!.trim();
const day = (value: string) => q(`[data-slot=calendar-cell-trigger][data-value="${value}"]:not([data-outside-view])`);
const outsideDay = (value: string) => q(`[data-slot=calendar-cell-trigger][data-value="${value}"][data-outside-view]`);
const prev = () => q("[data-slot=calendar-prev-button]") as HTMLButtonElement;
const next = () => q("[data-slot=calendar-next-button]") as HTMLButtonElement;
const style = (element: Element) => getComputedStyle(element);

describe("markup", () => {
  it("renders a labelled group with the month heading, weekdays and a single-root grid", () => {
    render(() => h(Calendar, { defaultPlaceholder: oct6, locale: "en-US" }));
    expect(root().getAttribute("role")).toBe("group");
    expect(root().dataset.size).toBe("md");
    expect(root().dataset.color).toBe("primary");
    expect(root().dataset.months).toBeUndefined();
    expect(root().getAttribute("aria-label")).toBe("Event Date, October 2026");
    expect(heading()).toBe("October 2026");
    expect(all("[data-slot=calendar-head-cell]").map((cell) => cell.textContent)).toEqual([
      "S",
      "M",
      "T",
      "W",
      "T",
      "F",
      "S",
    ]);
    // reka-ui#2504: the class and data-slot must reach the <table> itself.
    const grid = q("[data-slot=calendar-grid]");
    expect(grid.tagName).toBe("TABLE");
    expect(grid.getAttribute("role")).toBe("application");
    expect(style(grid).tableLayout).toBe("fixed");
    expect(grid.closest("thead")).toBeNull();
    expect(q("thead").getAttribute("aria-hidden")).toBe("true");
  });

  it("keeps six rows, so the height doesn't change between months", async () => {
    const placeholder = shallowRef<DateValue>(new CalendarDate(2026, 2, 1));
    render(() => h(Calendar, { placeholder: placeholder.value, locale: "en-US" }));
    const rows = () => all("[data-slot=calendar-grid-body] [data-slot=calendar-grid-row]").length;
    expect(rows()).toBe(6);
    const february = root().offsetHeight;
    placeholder.value = new CalendarDate(2026, 8, 1);
    await nextTick();
    expect(heading()).toBe("August 2026");
    expect(rows()).toBe(6);
    expect(root().offsetHeight).toBe(february);
  });

  it("lays out one grid per month, side by side from sm", () => {
    render(() => h(Calendar, { defaultPlaceholder: oct6, numberOfMonths: 2, locale: "en-US" }));
    expect(all("[data-slot=calendar-grid]")).toHaveLength(2);
    expect(root().dataset.months).toBe("true");
    expect(heading()).toBe("October - November 2026");
  });

  it("renders the default slot instead of the built-in layout", () => {
    render(() =>
      h(
        Calendar,
        { defaultPlaceholder: oct6, locale: "en-US" },
        { default: ({ grid }: { grid: unknown[] }) => `${grid.length} month` },
      ),
    );
    expect(root().textContent).toContain("1 month");
    expect(all("[data-slot=calendar-grid]")).toHaveLength(0);
  });

  it("passes the day slot the day and its state, with the locale's digits by default", () => {
    render(() =>
      h(
        Calendar,
        { defaultPlaceholder: oct6, defaultValue: oct6, locale: "en-US" },
        { day: ({ day, selected }: { day: DateValue; selected: boolean }) => `${day.day}${selected ? "*" : ""}` },
      ),
    );
    expect(day("2026-10-06").textContent).toBe("6*");
    expect(day("2026-10-07").textContent).toBe("7");
    unmount?.();
    render(() => h(Calendar, { defaultPlaceholder: oct6, locale: "ar-EG" }));
    expect(day("2026-10-06").textContent).toBe("٦");
  });
});

describe("outside days", () => {
  it("mutes them with one month", () => {
    render(() => h(Calendar, { defaultPlaceholder: oct6, locale: "en-US" }));
    const outside = outsideDay("2026-09-30");
    expect(style(outside).color).toBe("rgb(120, 120, 120)");
    expect(style(outside).visibility).toBe("visible");
    expect(outside.hasAttribute("tabindex")).toBe(false);
  });

  // reka-ui#2730, nuxt/ui#5961: the next grid draws the same days again.
  it("hides them, selection included, when more than one month shows", async () => {
    const value = shallowRef<DateValue | undefined>(new CalendarDate(2026, 11, 1));
    const updates: unknown[] = [];
    render(() =>
      h(Calendar, {
        modelValue: value.value,
        defaultPlaceholder: new CalendarDate(2026, 10, 1),
        numberOfMonths: 2,
        locale: "en-US",
        "onUpdate:modelValue": (next: DateValue | undefined) => updates.push(next),
      }),
    );
    const copy = outsideDay("2026-11-01");
    expect(copy.hasAttribute("data-selected")).toBe(true);
    expect(style(copy).visibility).toBe("hidden");
    expect(style(copy).pointerEvents).toBe("none");
    expect(style(day("2026-11-01")).visibility).toBe("visible");
  });
});

describe("sizes", () => {
  overrideControlTokens();

  it.each(controlSizes)("sizes days, weekdays, buttons and gaps from the control tokens at %s", (size) => {
    render(() => h(Calendar, { size, defaultPlaceholder: oct6, weekNumbers: true, locale: "en-US" }));
    const cell = sentinel.height[size];
    const trigger = day("2026-10-06").getBoundingClientRect();
    expect([trigger.width, trigger.height]).toEqual([cell, cell]);
    expect(q("[data-slot=calendar-head-cell]").getBoundingClientRect().width).toBe(cell);
    expect(q("[data-slot=calendar-week-number]").getBoundingClientRect().width).toBe(cell);
    expect(prev().getBoundingClientRect().width).toBe(cell);
    expect(next().getBoundingClientRect().height).toBe(cell);
    expect(prev().querySelector("svg")!.getBoundingClientRect().width).toBe(sentinel.icon[size]);
    expect(px(style(q("[data-slot=calendar-header]")).columnGap)).toBe(sentinel.gap[size]);
    expect(px(style(root()).rowGap)).toBe(sentinel.gap[size]);
  });

  // shadcn-vue#714: weekday labels must line up with the day columns.
  it("lines each weekday up with its column", () => {
    render(() => h(Calendar, { defaultPlaceholder: oct6, size: "lg" }));
    const heads = all("[data-slot=calendar-head-cell]");
    const firstRow = all("[data-slot=calendar-grid-body] [data-slot=calendar-grid-row]")[0]!;
    const cells = [...firstRow.querySelectorAll("[data-slot=calendar-cell]")];
    expect(heads.map((cell) => cell.getBoundingClientRect().left)).toEqual(
      cells.map((cell) => cell.getBoundingClientRect().left),
    );
  });

  it("sets the text steps per size", () => {
    const sizes = controlSizes.map((size) => {
      render(() => h(Calendar, { size, defaultPlaceholder: oct6 }));
      const result = [
        style(day("2026-10-06")).fontSize,
        style(q("[data-slot=calendar-head-cell]")).fontSize,
        style(q("[data-slot=calendar-heading]")).fontSize,
      ];
      unmount?.();
      return result;
    });
    expect(new Set(sizes.map((entry) => entry.join())).size).toBeGreaterThan(2);
    expect(sizes[0]).toEqual(sizes[1]);
    expect(sizes[3]).toEqual(sizes[4]);
  });
});

describe("tones", () => {
  const selectedFill = (props: Record<string, unknown> = {}) => {
    render(() => h(Calendar, { defaultValue: oct6, locale: "en-US", ...props }));
    return style(day("2026-10-06")).backgroundColor;
  };

  it("fills the selected day with the tone", () => {
    expect(selectedFill()).toBe("rgb(0, 0, 255)");
    expect(style(day("2026-10-06")).color).toBe("rgb(255, 255, 255)");
  });

  it("follows color", () => {
    expect(selectedFill({ color: "success" })).toBe("rgb(0, 128, 0)");
    unmount?.();
    expect(selectedFill({ color: "neutral" })).toBe("rgb(10, 10, 10)");
  });

  it("outlines today in the tone's text colour", () => {
    const now = today(getLocalTimeZone());
    render(() => h(Calendar, { defaultPlaceholder: now, color: "success" }));
    const element = day(now.toString());
    expect(element.hasAttribute("data-today")).toBe(true);
    expect(style(element).color).toBe("rgb(0, 90, 0)");
    expect(style(element).boxShadow).toContain("rgb(0, 90, 0)");
    expect(style(element).boxShadow).toContain("inset");
  });

  it("turns destructive in an invalid field", () => {
    render(() =>
      h(Field, { invalid: true }, () => [
        h(FieldLabel, () => "Date"),
        h(Calendar, { defaultValue: oct6, locale: "en-US" }),
      ]),
    );
    expect(root().getAttribute("aria-invalid")).toBe("true");
    expect(style(day("2026-10-06")).backgroundColor).toBe("rgb(255, 0, 0)");
  });

  it("turns destructive when the selected day is disabled", () => {
    render(() => h(Calendar, { defaultValue: oct6, isDateDisabled: (date: DateValue) => date.day === 6 }));
    expect(root().hasAttribute("data-invalid")).toBe(true);
    expect(style(root()).getPropertyValue("--tone")).toBe("rgb(255, 0, 0)");
  });

  it("fades disabled days and strikes unavailable ones", () => {
    render(() =>
      h(Calendar, {
        defaultPlaceholder: oct6,
        isDateDisabled: (date: DateValue) => date.day === 7,
        isDateUnavailable: (date: DateValue) => date.day === 8,
      }),
    );
    expect(style(day("2026-10-07")).color).toMatch(/ \/ 0\.38\)$/);
    expect(style(day("2026-10-08")).textDecorationLine).toBe("line-through");
    expect(day("2026-10-08").getAttribute("aria-disabled")).toBe("true");
  });
});

describe("v-model", () => {
  const controlled = (props: Record<string, unknown> = {}, initial?: DateValue | DateValue[]) => {
    const value = shallowRef<DateValue | DateValue[] | undefined>(initial);
    const updates: unknown[] = [];
    render(() =>
      h(Calendar, {
        defaultPlaceholder: oct6,
        locale: "en-US",
        ...props,
        modelValue: value.value,
        "onUpdate:modelValue": (next: DateValue | DateValue[] | undefined) => {
          updates.push(next);
          value.value = next;
        },
      }),
    );
    return { value, updates };
  };

  it("selects a day, and clears it on a second click", async () => {
    const { value, updates } = controlled();
    await userEvent.click(day("2026-10-14"));
    expect(value.value?.toString()).toBe("2026-10-14");
    expect(day("2026-10-14").hasAttribute("data-selected")).toBe(true);
    await userEvent.click(day("2026-10-14"));
    expect(value.value).toBeUndefined();
    expect(updates).toHaveLength(2);
  });

  it("keeps the day with prevent-deselect", async () => {
    const { value } = controlled({ preventDeselect: true }, oct6);
    await userEvent.click(day("2026-10-06"));
    expect(value.value?.toString()).toBe("2026-10-06");
  });

  it("keeps days focusable but unpickable, and drops the pointer cursor, when readonly", async () => {
    const { value, updates } = controlled({ readonly: true }, oct6);
    expect(style(day("2026-10-14")).cursor).toBe("default");
    await userEvent.click(day("2026-10-14"));
    expect(updates).toEqual([]);
    expect(value.value?.toString()).toBe("2026-10-06");
    expect(document.activeElement).toBe(day("2026-10-14"));
  });

  it("toggles days with multiple", async () => {
    const { value } = controlled({ multiple: true });
    await userEvent.click(day("2026-10-01"));
    await userEvent.click(day("2026-10-03"));
    expect((value.value as DateValue[]).map(String)).toEqual(["2026-10-01", "2026-10-03"]);
    await userEvent.click(day("2026-10-01"));
    expect((value.value as DateValue[]).map(String)).toEqual(["2026-10-03"]);
  });

  it("moves the view when the value is set from outside", async () => {
    const { value } = controlled({}, oct6);
    value.value = new CalendarDate(2027, 3, 9);
    await nextTick();
    await nextTick();
    expect(heading()).toBe("March 2027");
    expect(day("2027-03-09").hasAttribute("data-selected")).toBe(true);
  });

  // reka-ui#2960: on reka-ui 2.10 a new object for the same day moved the view back to it.
  it("hands Reka the same object while the day is unchanged, so paging survives a re-parsed v-model", async () => {
    const iso = shallowRef("2026-07-01");
    const wrapper = render(() =>
      h(Calendar, {
        locale: "en-US",
        modelValue: new CalendarDate(...(iso.value.split("-").map(Number) as [number, number, number])),
        "onUpdate:modelValue": (next?: DateValue) => (iso.value = next?.toString() ?? ""),
      }),
    );
    const rekaValue = () => wrapper.findComponent(CalendarRoot).props("modelValue");
    const first = rekaValue();
    await userEvent.click(next());
    expect(heading()).toBe("August 2026");
    wrapper.vm.$forceUpdate();
    await nextTick();
    expect(rekaValue()).toBe(first);
    expect(heading()).toBe("August 2026");

    iso.value = "2026-07-02";
    await nextTick();
    expect(rekaValue()).not.toBe(first);
    expect(heading()).toBe("July 2026");
  });

  it("still resyncs Reka when it holds another day than the new same-day value", async () => {
    // Clicking the selected day clears Reka's copy; the parent refuses and re-sends the same day.
    const value = shallowRef<DateValue | undefined>(oct6);
    render(() =>
      h(Calendar, {
        locale: "en-US",
        modelValue: value.value,
        "onUpdate:modelValue": () => (value.value = new CalendarDate(2026, 10, 6)),
      }),
    );
    await userEvent.click(day("2026-10-06"));
    await nextTick();
    expect(day("2026-10-06").hasAttribute("data-selected")).toBe(true);
  });

  // Upstream: Reka moves the view to the last remaining date (CalendarRoot's modelValue watch).
  it.todo("keeps the view when a day is deselected in multiple mode");
});

describe("matchers", () => {
  it("follows a swapped is-date-disabled function", async () => {
    const strict = shallowRef(false);
    const updates: unknown[] = [];
    render(() =>
      h(Calendar, {
        defaultPlaceholder: oct6,
        locale: "en-US",
        isDateDisabled: strict.value ? (date: DateValue) => isWeekend(date, "en-US") : () => false,
        "onUpdate:modelValue": (next: unknown) => updates.push(next),
      }),
    );
    expect(day("2026-10-10").hasAttribute("data-disabled")).toBe(false);
    strict.value = true;
    await nextTick();
    expect(day("2026-10-10").hasAttribute("data-disabled")).toBe(true);
    expect(day("2026-10-10").getAttribute("aria-disabled")).toBe("true");
    day("2026-10-10").click();
    expect(updates).toEqual([]);
  });

  it("follows a swapped is-date-unavailable function", async () => {
    const booked = shallowRef<number[]>([]);
    render(() =>
      h(Calendar, {
        defaultPlaceholder: oct6,
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
});

describe("keyboard", () => {
  it("moves by day and week with the arrows, paging at the month's edge, and selects with Enter", async () => {
    const value = shallowRef<DateValue | undefined>();
    render(() =>
      h(Calendar, {
        defaultPlaceholder: new CalendarDate(2026, 10, 30),
        locale: "en-US",
        modelValue: value.value,
        "onUpdate:modelValue": (next?: DateValue) => (value.value = next),
      }),
    );
    day("2026-10-30").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(day("2026-10-31"));
    await userEvent.keyboard("{ArrowDown}");
    await nextTick();
    expect(heading()).toBe("November 2026");
    expect(document.activeElement).toBe(day("2026-11-07"));
    await userEvent.keyboard("{ArrowLeft}{ArrowUp}");
    expect(document.activeElement).toBe(day("2026-10-30"));
    await userEvent.keyboard("{Enter}");
    expect(value.value?.toString()).toBe("2026-10-30");
  });

  it("mirrors the horizontal arrows in rtl", async () => {
    render(() => h(Calendar, { defaultPlaceholder: oct6, dir: "rtl" }));
    day("2026-10-06").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(day("2026-10-05"));
    expect(style(prev().querySelector("svg")!).rotate).toBe("180deg");
  });

  it("jumps to the week's edges and pages by month and year (reka-ui 2.11)", async () => {
    render(() => h(Calendar, { defaultPlaceholder: oct6, locale: "en-US" }));
    day("2026-10-06").focus();
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(day("2026-10-04"));
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(day("2026-10-10"));
    await userEvent.keyboard("{PageDown}");
    await nextTick();
    expect(heading()).toBe("November 2026");
    expect(document.activeElement).toBe(day("2026-11-10"));
    await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
    await nextTick();
    expect(heading()).toBe("November 2025");
  });

  it("lets Ctrl+Enter on a day reach the form", async () => {
    let submits = 0;
    render(() =>
      h(
        "form",
        {
          onSubmit: (event: Event) => {
            event.preventDefault();
            submits++;
          },
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === "Enter" && event.ctrlKey) (event.currentTarget as HTMLFormElement).requestSubmit();
          },
        },
        [h(Calendar, { defaultPlaceholder: oct6 }), h("button", { type: "submit" }, "Save")],
      ),
    );
    day("2026-10-06").focus();
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(submits).toBe(1);
  });

  it("stops the arrows at min and max", async () => {
    render(() =>
      h(Calendar, {
        defaultPlaceholder: oct6,
        minValue: new CalendarDate(2026, 10, 5),
        maxValue: new CalendarDate(2026, 10, 20),
      }),
    );
    expect(prev().disabled).toBe(true);
    expect(next().disabled).toBe(true);
    expect(day("2026-10-04").hasAttribute("data-disabled")).toBe(true);
    expect(day("2026-10-21").hasAttribute("data-disabled")).toBe(true);
    day("2026-10-05").focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(day("2026-10-05"));
  });
});

describe("in a form", () => {
  it("never submits on a day, previous or next click", async () => {
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
        [h(Calendar, { defaultPlaceholder: oct6 })],
      ),
    );
    await userEvent.click(day("2026-10-06"));
    await userEvent.click(next());
    await userEvent.click(prev());
    expect(submits).toBe(0);
    expect(day("2026-10-06").tagName).toBe("DIV");
    expect(day("2026-10-06").getAttribute("role")).toBe("button");
  });

  it("takes one tab stop: previous, next, one day, out", async () => {
    render(() => h("div", [h(Calendar, { defaultPlaceholder: oct6, defaultValue: oct6 }), h("button", "After")]));
    prev().focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(next());
    await userEvent.tab();
    expect(document.activeElement).toBe(day("2026-10-06"));
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe("After");
  });
});

describe("field", () => {
  it("is labelled by the field label and the month, and described by the field", async () => {
    render(() =>
      h(Field, { invalid: true }, () => [
        h(FieldLabel, () => "Delivery date"),
        h(Calendar, { defaultPlaceholder: oct6, locale: "en-US" }),
        h(FieldDescription, () => "Weekdays only."),
        h(FieldError, { errors: "Pick a date." }),
      ]),
    );
    await nextTick();
    const label = q("[data-slot=field-label]");
    const headingId = q("[data-slot=calendar-heading]").id;
    expect(headingId).toBeTruthy();
    expect(root().getAttribute("aria-labelledby")).toBe(`${label.id} ${headingId}`);
    expect(root().getAttribute("aria-describedby")).toBe(
      `${q("[data-slot=field-description]").id} ${q("[data-slot=field-error]").id}`,
    );
    expect(root().getAttribute("aria-invalid")).toBe("true");
    expect(root().id).toBe(label.getAttribute("for"));
  });

  it("takes disabled from the field", () => {
    render(() => h(Field, { disabled: true }, () => [h(Calendar, { defaultPlaceholder: oct6 })]));
    expect(all("[data-slot=calendar-cell-trigger]").every((element) => element.hasAttribute("data-disabled"))).toBe(
      true,
    );
    expect(prev().disabled).toBe(true);
    expect(next().disabled).toBe(true);
  });

  it("keeps an explicit aria-labelledby", () => {
    render(() =>
      h(Field, () => [
        h(FieldLabel, () => "Date"),
        h(Calendar, { defaultPlaceholder: oct6, "aria-labelledby": "elsewhere" }),
      ]),
    );
    expect(root().getAttribute("aria-labelledby")).toBe("elsewhere");
  });
});

describe("initial focus", () => {
  it("focuses the visible selected day, not the hidden copy before it", async () => {
    render(() =>
      h(Calendar, {
        defaultValue: new CalendarDate(2026, 11, 1),
        defaultPlaceholder: new CalendarDate(2026, 10, 1),
        numberOfMonths: 2,
        initialFocus: true,
      }),
    );
    await nextTick();
    expect(document.activeElement).toBe(day("2026-11-01"));
  });

  it("focuses the placeholder's day when nothing is selected", async () => {
    render(() => h(Calendar, { defaultPlaceholder: oct6, initialFocus: true }));
    await nextTick();
    expect(document.activeElement).toBe(day("2026-10-06"));
  });
});

describe("locale and week start", () => {
  const firstHead = () => q("[data-slot=calendar-head-cell]").textContent;
  const firstDay = () => all("[data-slot=calendar-cell-trigger]")[0]!.dataset.value;

  it("starts the week on the locale's day unless week-starts-on says otherwise", () => {
    render(() => h(Calendar, { defaultPlaceholder: oct6, locale: "de-DE" }));
    expect(firstHead()).toBe("M");
    expect(firstDay()).toBe("2026-09-28");
    unmount?.();
    // reka-ui#2264: 0 is Sunday whatever the locale.
    render(() => h(Calendar, { defaultPlaceholder: oct6, locale: "de-DE", weekStartsOn: 0 }));
    expect(firstHead()).toBe("S");
    expect(firstDay()).toBe("2026-09-27");
  });

  // nuxt/ui#6664: the number must follow the row's start, not the locale's default start.
  it("numbers ISO weeks that line up with the rows", () => {
    render(() => h(Calendar, { defaultPlaceholder: new CalendarDate(2027, 1, 1), locale: "de-DE", weekNumbers: true }));
    const numbers = () =>
      all("[data-slot=calendar-grid-body] [data-slot=calendar-week-number]").map((cell) => cell.textContent!.trim());
    expect(numbers()).toEqual(["53", "1", "2", "3", "4", "5"]);
    expect(q("[data-slot=calendar-week-number]").getAttribute("aria-hidden")).toBe("true");
    unmount?.();
    render(() =>
      h(Calendar, {
        defaultPlaceholder: new CalendarDate(2027, 1, 1),
        locale: "en-US",
        weekStartsOn: 6,
        weekNumbers: true,
      }),
    );
    // The first row runs Saturday Dec 26 to Friday Jan 1: week 1, not the 52 a Sunday-based count gives.
    expect(firstDay()).toBe("2026-12-26");
    expect(numbers()).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("swaps locale and week start at runtime without warnings", async () => {
    const warnings: string[] = [];
    const locale = shallowRef("en-US");
    const weekStartsOn = shallowRef<0 | 1>(0);
    render(
      () =>
        h(ConfigProvider, { locale: locale.value }, () =>
          h(Calendar, { defaultPlaceholder: oct6, weekStartsOn: weekStartsOn.value }),
        ),
      warnings,
    );
    locale.value = "fr-FR";
    weekStartsOn.value = 1;
    await nextTick();
    expect(firstDay()).toBe("2026-09-28");
    expect(warnings).toEqual([]);
  });
});

describe("heading slot", () => {
  it("can move the view without selecting", async () => {
    const updates: unknown[] = [];
    render(() =>
      h(
        Calendar,
        { defaultPlaceholder: oct6, locale: "en-US", "onUpdate:modelValue": (value: unknown) => updates.push(value) },
        {
          heading: ({
            headingValue,
            date,
            setPlaceholder,
          }: {
            headingValue: string;
            date: DateValue;
            setPlaceholder: (date: DateValue) => void;
          }) => h("button", { type: "button", onClick: () => setPlaceholder(date.set({ month: 1 })) }, headingValue),
        },
      ),
    );
    await userEvent.click(q("[data-slot=calendar-heading] button"));
    expect(heading()).toBe("January 2026");
    expect(updates).toEqual([]);
  });

  it("gives a hand-composed heading the root's heading id", () => {
    render(() =>
      h(Field, () => [
        h(FieldLabel, () => "Date"),
        h(Calendar, { defaultPlaceholder: oct6 }, { default: () => h(CalendarHeading) }),
      ]),
    );
    expect(root().getAttribute("aria-labelledby")!.split(" ")[1]).toBe(q("[data-slot=calendar-heading]").id);
  });
});
