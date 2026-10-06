import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import type { Component } from "vue";

import DatePickerBirthday from "@/examples/date-picker/DatePickerBirthday.vue";
import DatePickerForm from "@/examples/date-picker/DatePickerForm.vue";
import DatePickerPresets from "@/examples/date-picker/DatePickerPresets.vue";
import DateRangePickerButton from "@/examples/date-picker/DateRangePickerButton.vue";
import DateRangePickerForm from "@/examples/date-picker/DateRangePickerForm.vue";

const settle = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

let unmount: (() => void) | undefined;
afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
});

const render = (component: Component) => {
  const wrapper = mount(component, { attachTo: document.body });
  unmount = () => wrapper.unmount();
  return wrapper;
};

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const content = () => document.querySelector("[data-slot=date-picker-content]");
const day = (slot: string, value: string) =>
  q(`[data-slot=${slot}-cell-trigger][data-value="${value}"]:not([data-outside-view])`);
const segments = () => all("[data-slot=input-date-segment][role=spinbutton]");
// Intl puts thin and narrow no-break spaces around range dashes.
const text = (element: Element) => element.textContent!.replace(/\s+/g, " ").trim();
const errors = () => all("[data-slot=field-error]").map((error) => error.textContent);
const open = async () => {
  await userEvent.click(q("[data-slot=date-picker-trigger]"));
  await expect.poll(() => content()).not.toBeNull();
};

describe("birthday", () => {
  it("jumps to a year from the heading's select without closing the picker", async () => {
    render(DatePickerBirthday);
    await open();
    expect(q("[data-slot=calendar-heading]").textContent).toContain("1990");
    await userEvent.click(q("[data-slot=calendar-heading] [aria-label=Year]"));
    await userEvent.click(all("[data-slot=select-item]").find((item) => item.textContent?.trim() === "1985")!);
    await settle();
    expect(content()).not.toBeNull();
    expect(q("[data-slot=calendar-heading] [aria-label=Year]").textContent).toContain("1985");
    await userEvent.click(day("calendar", "1985-01-15"));
    await expect.poll(() => content()).toBeNull();
    expect(segments().map((segment) => segment.textContent)).toEqual(["1", "15", "1985"]);
  });
});

describe("form", () => {
  it("validates on blur, not while the calendar has focus, and again on a calendar pick (nuxt/ui#6854, #5920)", async () => {
    render(DatePickerForm);
    await userEvent.click(segments()[0]!);
    await userEvent.keyboard("{Tab}{Tab}{Tab}{Enter}");
    await expect.poll(() => content()).not.toBeNull();
    await settle();
    expect(errors()).toEqual([]);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => content()).toBeNull();
    q("button[type=submit]").focus();
    await settle();
    expect(errors()).toEqual(["Pick a delivery date."]);

    await open();
    await userEvent.click(day("calendar", "2026-10-09"));
    await settle();
    expect(errors()).toEqual([]);
    q("button[type=submit]").click();
    await settle();
    expect(document.body.textContent).toContain("Booked for Friday, October 9, 2026.");
  });

  it("flags a typed weekend and focuses the field after a failed submit", async () => {
    render(DatePickerForm);
    q("button[type=submit]").click();
    await settle();
    expect(errors()).toEqual(["Pick a delivery date."]);
    expect(document.activeElement).toBe(segments()[0]);
    await userEvent.keyboard("10102026");
    await settle();
    expect(errors()).toEqual(["We don't deliver at weekends."]);
  });
});

describe("presets", () => {
  it("sets the date from a quick pick and closes", async () => {
    render(DatePickerPresets);
    await open();
    await userEvent.click(all("button").find((button) => button.textContent?.trim() === "Next Monday")!);
    await expect.poll(() => content()).toBeNull();
    expect(segments().map((segment) => segment.textContent)).toEqual(["10", "12", "2026"]);
  });
});

describe("range", () => {
  it("shows the period on the button and applies a preset", async () => {
    render(DateRangePickerButton);
    const trigger = q("[data-slot=date-picker-trigger]");
    expect(text(trigger)).toBe("Sep 30 – Oct 6, 2026");
    await open();
    await userEvent.click(all("button").find((button) => button.textContent?.trim() === "Last month")!);
    await expect.poll(() => content()).toBeNull();
    expect(text(trigger)).toBe("Sep 1 – 30, 2026");
  });

  it("submits the stay as two ISO dates", async () => {
    render(DateRangePickerForm);
    await open();
    await userEvent.click(day("range-calendar", "2026-10-20"));
    await userEvent.click(day("range-calendar", "2026-10-24"));
    await expect.poll(() => content()).toBeNull();
    q("button[type=submit]").click();
    await settle();
    expect(document.body.textContent).toContain("Checking 2026-10-20 to 2026-10-24…");
  });
});
