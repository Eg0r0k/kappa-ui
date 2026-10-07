import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import InputDateForm from "@/examples/input-date/InputDateForm.vue";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], shouldAdvanceTime: true, advanceTimeDelta: 1 });
  vi.setSystemTime(new Date("2026-10-07T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

const errors = () => [...document.querySelectorAll("[data-slot=field-error]")].map((error) => error.textContent);
const segments = () => [...document.querySelectorAll<HTMLElement>("[role=spinbutton]")];
const submit = () => document.querySelector<HTMLButtonElement>("button[type=submit]")!.click();

it("shows every error on submit and focuses the first segment of the first invalid field", async () => {
  mount(InputDateForm, { attachTo: document.body });
  submit();
  await expect.poll(errors).toEqual(["Enter your arrival and departure dates.", "Enter your date of birth."]);
  await expect.poll(() => document.activeElement).toBe(segments()[0]);
});

it("checks the order of the stay and the guest's age, then books", async () => {
  mount(InputDateForm, { attachTo: document.body });

  await userEvent.click(segments()[0]!);
  await userEvent.keyboard("1012202710072027");
  await userEvent.click(segments()[6]!);
  await userEvent.keyboard("10072016");
  submit();
  await expect.poll(errors).toEqual(["Departure must come after arrival.", "The lead guest must be 18 or older."]);

  await userEvent.click(segments()[0]!);
  await userEvent.keyboard("1007202710122027");
  await userEvent.click(segments()[6]!);
  await userEvent.keyboard("06211990");
  submit();
  await expect
    .poll(() => document.querySelector("[aria-live=polite]")!.textContent)
    .toBe("Booked 2027-10-07 to 2027-10-12.");
  expect(errors()).toEqual([]);
});
