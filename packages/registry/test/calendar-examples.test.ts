import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { Component } from "vue";

import CalendarDatePicker from "@/examples/calendar/CalendarDatePicker.vue";
import CalendarForm from "@/examples/calendar/CalendarForm.vue";
import CalendarMonthYearSelect from "@/examples/calendar/CalendarMonthYearSelect.vue";
import RangeCalendarDatePicker from "@/examples/range-calendar/RangeCalendarDatePicker.vue";
import RangeCalendarForm from "@/examples/range-calendar/RangeCalendarForm.vue";

let unmount: (() => void) | undefined;
afterEach(() => {
  unmount?.();
  unmount = undefined;
  vi.useRealTimers();
});

const render = (component: Component) => {
  const wrapper = mount(component, { attachTo: document.body });
  unmount = () => wrapper.unmount();
  return wrapper;
};

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const day = (slot: string, value: string) =>
  q(`[data-slot=${slot}-cell-trigger][data-value="${value}"]:not([data-outside-view])`);
// Intl puts thin and narrow no-break spaces around range dashes.
const text = (element: Element) => element.textContent!.replace(/\s+/g, " ").trim();
const errors = () => [...document.querySelectorAll("[data-slot=field-error]")].map((error) => error.textContent);
const submit = () => q("button[type=submit]").click();
const focusedValue = () => (document.activeElement as HTMLElement | null)?.dataset.value;

describe("date pickers", () => {
  it("focuses today when the popover opens and closes on a pick", async () => {
    vi.useFakeTimers({ toFake: ["Date"], shouldAdvanceTime: true, advanceTimeDelta: 1 });
    vi.setSystemTime(new Date("2026-10-07T12:00:00Z"));
    render(CalendarDatePicker);
    const trigger = q("button");
    await userEvent.click(trigger);
    await expect.poll(focusedValue).toBe("2026-10-07");
    expect(document.activeElement).toBe(day("calendar", "2026-10-07"));
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.querySelector("[data-slot=calendar]")).toBeNull();
    expect(text(trigger)).toBe("Oct 7, 2026");
  });

  it("focuses the range's start and closes only on a complete range", async () => {
    render(RangeCalendarDatePicker);
    const trigger = q("button");
    expect(text(trigger)).toBe("Oct 6 – 12, 2026");
    await userEvent.click(trigger);
    await expect.poll(focusedValue).toBe("2026-10-06");
    expect(document.activeElement).toBe(day("range-calendar", "2026-10-06"));
    await userEvent.click(day("range-calendar", "2026-10-20"));
    expect(document.querySelector("[data-slot=range-calendar]")).not.toBeNull();
    await userEvent.click(day("range-calendar", "2026-10-23"));
    await expect.poll(() => document.querySelector("[data-slot=range-calendar]")).toBeNull();
    expect(text(trigger)).toBe("Oct 20 – 23, 2026");
  });
});

describe("forms", () => {
  it("asks for a date of birth on submit, then sends the picked one", async () => {
    render(CalendarForm);
    submit();
    await expect.poll(errors).toEqual(["Pick your date of birth."]);
    expect(q("[data-slot=calendar]").getAttribute("aria-invalid")).toBe("true");

    await userEvent.click(day("calendar", "2000-01-15"));
    await expect.poll(errors).toEqual([]);
    submit();
    await expect.poll(() => document.body.textContent).toContain("Born January 15, 2000.");
  });

  // reka-ui#2960: the form re-parses its ISO string on every render; paging must survive that.
  it("keeps the month the user paged to while the form re-renders", async () => {
    render(CalendarForm);
    await userEvent.click(day("calendar", "2000-01-15"));
    await userEvent.click(q("[data-slot=calendar-next-button]"));
    submit();
    await expect.poll(() => document.body.textContent).toContain("Born January 15, 2000.");
    expect(q("[data-slot=calendar-heading]").textContent).toContain("February 2000");
  });

  it("wants a check-out after the check-in", async () => {
    render(RangeCalendarForm);
    submit();
    await expect.poll(errors).toEqual(["Pick a check-in date."]);
    await userEvent.click(day("range-calendar", "2026-10-12"));
    await expect.poll(errors).toEqual(["Pick a check-out date."]);
    await userEvent.click(day("range-calendar", "2026-10-12"));
    await expect.poll(errors).toEqual(["Stay at least one night."]);
    await userEvent.click(day("range-calendar", "2026-10-14"));
    await userEvent.click(day("range-calendar", "2026-10-16"));
    await expect.poll(errors).toEqual([]);
    submit();
    await expect.poll(() => text(document.body)).toContain("Booked Oct 14 – 16.");
  });
});

describe("month and year select", () => {
  it("moves the view from the heading without selecting", async () => {
    render(CalendarMonthYearSelect);
    const heading = () => q("[data-slot=calendar-heading]");
    expect(day("calendar", "1990-05-17").hasAttribute("data-selected")).toBe(true);
    const year = () =>
      [...document.querySelectorAll<HTMLElement>("[data-slot=select-item]")].find(
        (item) => item.textContent?.trim() === "1985",
      );
    await userEvent.click(heading().querySelector<HTMLElement>("[aria-label=Year]")!);
    await expect.poll(() => year()?.textContent?.trim()).toBe("1985");
    await userEvent.click(year()!);
    await expect
      .poll(() => document.querySelector('[data-slot=calendar-cell-trigger][data-value="1985-05-17"]'))
      .not.toBeNull();
    expect(document.body.textContent).toContain("May 17, 1990");
    expect(heading().querySelector("[aria-label=Year]")!.textContent).toContain("1985");
  });
});
