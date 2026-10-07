import { getLocalTimeZone, today } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { nextTick } from "vue";

import InputDateForm from "@/examples/input-date/InputDateForm.vue";

const settle = () => new Promise((resolve) => setTimeout(resolve, 100));
const errors = () => [...document.querySelectorAll("[data-slot=field-error]")].map((error) => error.textContent);
const segments = () => [...document.querySelectorAll<HTMLElement>("[role=spinbutton]")];
const submit = async () => {
  document.querySelector<HTMLButtonElement>("button[type=submit]")!.click();
  await settle();
  await nextTick();
};

it("shows every error on submit and focuses the first segment of the first invalid field", async () => {
  mount(InputDateForm, { attachTo: document.body });
  await submit();
  expect(errors()).toEqual(["Enter your arrival and departure dates.", "Enter your date of birth."]);
  expect(document.activeElement).toBe(segments()[0]);
});

it("checks the order of the stay and the guest's age, then books", async () => {
  mount(InputDateForm, { attachTo: document.body });
  const next = today(getLocalTimeZone()).add({ years: 1 });
  const typed = (date: { month: number; day: number; year: number }) =>
    `${String(date.month).padStart(2, "0")}${String(date.day).padStart(2, "0")}${date.year}`;

  await userEvent.click(segments()[0]!);
  await userEvent.keyboard(typed(next.add({ days: 5 })) + typed(next));
  await userEvent.click(segments()[6]!);
  await userEvent.keyboard(typed(today(getLocalTimeZone()).subtract({ years: 10 })));
  await submit();
  expect(errors()).toEqual(["Departure must come after arrival.", "The lead guest must be 18 or older."]);

  await userEvent.click(segments()[0]!);
  await userEvent.keyboard(typed(next) + typed(next.add({ days: 5 })));
  await userEvent.click(segments()[6]!);
  await userEvent.keyboard("06211990");
  await submit();
  expect(errors()).toEqual([]);
  expect(document.querySelector("[aria-live=polite]")!.textContent).toBe(
    `Booked ${next.toString()} to ${next.add({ days: 5 }).toString()}.`,
  );
});
