import { CalendarDate, CalendarDateTime, isWeekend } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { ConfigProvider, type DateValue } from "reka-ui";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, shallowRef } from "vue";

import { Button } from "@/ui/button";
import {
  DatePicker,
  DatePickerCalendar,
  DatePickerContent,
  DatePickerInput,
  DatePickerTrigger,
  DatePickerValue,
} from "@/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { InputGroup, InputGroupAddon, InputGroupText } from "@/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { controlSizes, overrideControlTokens, sentinel } from "./control-tokens";

let unmount: (() => void) | undefined;
afterEach(() => {
  unmount?.();
  unmount = undefined;
});

const palette = [
  "--input: rgb(0, 0, 255)",
  "--primary: rgb(0, 128, 0)",
  "--destructive: rgb(255, 0, 0)",
  "--disabled-opacity: 38%",
].join("; ");

const render = (node: () => VNode) => {
  const wrapper = mount(defineComponent({ setup: () => () => h("div", { style: palette }, [node()]) }), {
    attachTo: document.body,
  });
  unmount = () => wrapper.unmount();
  return wrapper;
};

const oct6 = new CalendarDate(2026, 10, 6);

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const frame = () => q("[data-slot=date-picker-input]");
const segments = () => all("[data-slot=input-date-segment][role=spinbutton]");
const texts = () => segments().map((segment) => segment.textContent);
const trigger = () => q("[data-slot=date-picker-trigger]");
const content = () => document.querySelector<HTMLElement>("[data-slot=date-picker-content]");
const heading = () => q("[data-slot=calendar-heading]").textContent!.trim();
const day = (value: string) => q(`[data-slot=calendar-cell-trigger][data-value^="${value}"]:not([data-outside-view])`);
const next = () => q("[data-slot=calendar-next-button]");
const style = (element: Element) => getComputedStyle(element);
const settle = () => new Promise((resolve) => setTimeout(resolve, 250));
const closed = () => expect.poll(() => content()).toBeNull();

const open = async () => {
  await userEvent.click(trigger());
  await expect.poll(() => content()).not.toBeNull();
};

const bound = (initial: DateValue | undefined, props: Record<string, unknown> = {}, slot?: () => VNode[]) => {
  const value = shallowRef<DateValue | undefined>(initial);
  render(() =>
    h(
      DatePicker,
      {
        locale: "en-US",
        ...props,
        modelValue: value.value,
        "onUpdate:modelValue": (next?: DateValue) => (value.value = next),
      },
      slot,
    ),
  );
  return value;
};

describe("field", () => {
  it("puts the segments and an icon trigger in one text control frame", () => {
    bound(oct6);
    expect(frame().dataset.variant).toBe("outline");
    expect(frame().dataset.size).toBe("md");
    expect(frame().dataset.state).toBe("closed");
    expect(frame().offsetHeight).toBe(36);
    expect(style(frame()).borderTopColor).toBe("rgb(0, 0, 255)");
    const group = frame().querySelector("[role=group]")!;
    expect(group.getAttribute("data-slot")).toBe("input-group-control");
    expect(texts()).toEqual(["10", "6", "2026"]);
    expect(trigger().tagName).toBe("BUTTON");
    expect(trigger().getAttribute("type")).toBe("button");
    expect(trigger().getAttribute("aria-label")).toBe("Open calendar");
    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(frame().lastElementChild).toBe(trigger());
  });

  it("takes size and variant from the root, and a part's own over them", () => {
    render(() => h(DatePicker, { size: "lg", variant: "soft" }));
    expect([frame().dataset.size, frame().dataset.variant, frame().offsetHeight]).toEqual(["lg", "soft", 40]);
    unmount?.();
    render(() =>
      h(DatePicker, { size: "lg" }, () => [
        h(DatePickerInput, { size: "xs", variant: "filled" }),
        h(DatePickerContent, () => h(DatePickerCalendar)),
      ]),
    );
    expect([frame().dataset.size, frame().dataset.variant, frame().offsetHeight]).toEqual(["xs", "filled", 28]);
  });

  it("keeps the xs field on one line in a narrow column (nuxt/ui#6338)", () => {
    render(() => h("div", { style: "width: 200px" }, h(DatePicker, { size: "xs", defaultValue: oct6 })));
    expect(frame().offsetHeight).toBe(28);
    const tops = new Set(segments().map((segment) => segment.getBoundingClientRect().top));
    expect(tops.size).toBe(1);
  });

  it("updates the model from typed digits, then tabs to the trigger", async () => {
    const value = bound(undefined);
    await userEvent.click(segments()[0]!);
    await userEvent.keyboard("10062026");
    expect(value.value?.toString()).toBe("2026-10-06");
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(trigger());
  });

  it("opens the calendar on Alt+ArrowDown in a segment, leaving the segment alone", async () => {
    const value = bound(oct6);
    await userEvent.click(segments()[1]!);
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await expect.poll(() => content()).not.toBeNull();
    expect(value.value?.toString()).toBe("2026-10-06");
    expect(frame().dataset.state).toBe("open");
  });

  it("marks a typed day the calendar won't offer as invalid", async () => {
    bound(undefined, { isDateDisabled: (date: DateValue) => isWeekend(date, "en-US") });
    await userEvent.click(segments()[0]!);
    await userEvent.keyboard("10032026");
    expect(segments()[0]!.getAttribute("aria-invalid")).toBe("true");
    await expect.poll(() => style(frame()).borderTopColor).toBe("rgb(255, 0, 0)");
  });

  it("follows the locale, from the prop or a ConfigProvider", () => {
    render(() => h(DatePicker, { locale: "de-DE", defaultValue: oct6 }));
    expect(texts()).toEqual(["6", "10", "2026"]);
    unmount?.();
    render(() => h(ConfigProvider, { locale: "ja-JP" }, () => h(DatePicker, { defaultValue: oct6 })));
    expect(texts()).toEqual(["2026", "10", "6"]);
  });

  it("sits in an input group, taking its frame and size", async () => {
    render(() =>
      h(InputGroup, { size: "sm" }, () => [
        h(InputGroupAddon, () => h(InputGroupText, () => "Due")),
        h(DatePicker, { defaultValue: oct6, locale: "en-US" }),
      ]),
    );
    expect(document.querySelector("[data-slot=date-picker-input]")).toBeNull();
    const group = q("[data-slot=input-group]");
    expect(group.offsetHeight).toBe(32);
    expect(group.querySelector("[data-slot=input-group-control]")).not.toBeNull();
    expect(trigger().parentElement).toBe(group);
    expect(trigger().getBoundingClientRect().height).toBe(24);
    await open();
    expect(q("[data-slot=calendar]").dataset.size).toBe("sm");
  });
});

describe("sizes", () => {
  overrideControlTokens();

  it.each(controlSizes)("draws the field and its trigger from the control tokens at %s", (size) => {
    render(() => h(DatePicker, { size }));
    const height = sentinel.height[size];
    expect(frame().offsetHeight).toBe(height);
    const box = trigger().getBoundingClientRect();
    expect([box.width, box.height]).toEqual([height - 8, height - 8]);
    expect(trigger().querySelector("svg")!.getBoundingClientRect().width).toBe(sentinel.icon[size]);
  });

  it("gives the calendar the field's size unless it has its own", async () => {
    render(() =>
      h(DatePicker, { defaultValue: oct6 }, () => [
        h(DatePickerInput, { size: "xl" }),
        h(DatePickerContent, () => h(DatePickerCalendar)),
      ]),
    );
    await open();
    expect(q("[data-slot=calendar]").dataset.size).toBe("xl");
    expect(style(q("[data-slot=calendar]")).getPropertyValue("--calendar-cell")).toBe(`${sentinel.height.xl}px`);
    unmount?.();

    render(() =>
      h(DatePicker, { defaultValue: oct6, size: "xl" }, () => [
        h(DatePickerInput),
        h(DatePickerContent, () => h(DatePickerCalendar, { size: "sm" })),
      ]),
    );
    await open();
    expect(q("[data-slot=calendar]").dataset.size).toBe("sm");
  });
});

describe("calendar", () => {
  it("opens on the trigger with the selected day focused, and closes on a pick, back on the trigger", async () => {
    const value = bound(oct6);
    await open();
    expect(content()!.getAttribute("role")).toBe("dialog");
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(frame().dataset.state).toBe("open");
    expect(document.activeElement).toBe(day("2026-10-06"));
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(day("2026-10-07"));
    await userEvent.keyboard("{Enter}");
    expect(value.value?.toString()).toBe("2026-10-07");
    await closed();
    await expect.poll(() => document.activeElement).toBe(trigger());
    expect(texts()).toEqual(["10", "7", "2026"]);
  });

  it("focuses today when there is no value", async () => {
    bound(undefined);
    await open();
    expect(document.activeElement?.hasAttribute("data-today")).toBe(true);
    expect(content()!.contains(document.activeElement)).toBe(true);
  });

  it("keeps the value when the selected day is clicked again, and Escape closes without a change", async () => {
    const value = bound(oct6);
    await open();
    await userEvent.click(day("2026-10-06"));
    expect(value.value?.toString()).toBe("2026-10-06");
    await userEvent.keyboard("{ArrowDown}{Escape}");
    await closed();
    expect(value.value?.toString()).toBe("2026-10-06");
  });

  it("focuses the day in view when it also shows as a neighbouring month's day", async () => {
    bound(new CalendarDate(2026, 11, 2), { numberOfMonths: 2, placeholder: new CalendarDate(2026, 10, 1) });
    await open();
    const focused = document.activeElement as HTMLElement;
    expect(focused.dataset.value).toBe("2026-11-02");
    expect(focused.hasAttribute("data-outside-view")).toBe(false);
    expect(content()!.contains(focused)).toBe(true);
  });

  it("opens on the value's month again after paging away", async () => {
    bound(oct6);
    await open();
    await userEvent.click(next());
    await userEvent.click(next());
    expect(heading()).toBe("December 2026");
    await userEvent.keyboard("{Escape}");
    await closed();
    await open();
    expect(heading()).toBe("October 2026");
    expect(document.activeElement).toBe(day("2026-10-06"));
  });

  it("keeps the page when the parent passes an equal date as a new object (reka-ui#2960)", async () => {
    const value = bound(oct6);
    await open();
    await userEvent.click(next());
    expect(heading()).toBe("November 2026");
    value.value = new CalendarDate(2026, 10, 6);
    await nextTick();
    await settle();
    expect(heading()).toBe("November 2026");
    expect(content()).not.toBeNull();
  });

  it("pages by month from the keyboard (reka-ui 2.11)", async () => {
    bound(oct6);
    await open();
    await userEvent.keyboard("{PageDown}");
    expect(document.activeElement).toBe(day("2026-11-06"));
    await userEvent.keyboard("{End}");
    expect((document.activeElement as HTMLElement).dataset.value).toBe("2026-11-07");
  });

  it("keeps six rows whatever the month, so the panel doesn't jump (shadcn-vue#1550)", async () => {
    bound(new CalendarDate(2026, 2, 10));
    await open();
    const february = content()!.offsetHeight;
    await userEvent.click(next());
    await userEvent.click(next());
    expect(heading()).toBe("April 2026");
    expect(content()!.offsetHeight).toBe(february);
  });

  it("disables days from min, max and isDateDisabled, strikes unavailable ones, and reads swapped matchers", async () => {
    const disabled = shallowRef((date: DateValue) => date.day === 20);
    render(() =>
      h(DatePicker, {
        defaultValue: oct6,
        minValue: new CalendarDate(2026, 10, 3),
        isDateDisabled: disabled.value,
        isDateUnavailable: (date: DateValue) => date.day === 21,
      }),
    );
    await open();
    expect(day("2026-10-02").hasAttribute("data-disabled")).toBe(true);
    expect(day("2026-10-20").hasAttribute("data-disabled")).toBe(true);
    expect(day("2026-10-21").hasAttribute("data-unavailable")).toBe(true);
    disabled.value = (date: DateValue) => date.day === 22;
    await nextTick();
    expect(day("2026-10-20").hasAttribute("data-disabled")).toBe(false);
    expect(day("2026-10-22").hasAttribute("data-disabled")).toBe(true);
  });

  it("keeps the typed time when a day is picked, and stays open for it", async () => {
    const value = bound(new CalendarDateTime(2026, 10, 6, 9, 30), { granularity: "minute", hourCycle: 24 });
    await open();
    await userEvent.click(day("2026-10-14"));
    expect(value.value?.toString()).toBe("2026-10-14T09:30:00");
    await settle();
    expect(content()).not.toBeNull();
  });

  it("closes or stays open as closeOnSelect says", async () => {
    bound(oct6, { closeOnSelect: false });
    await open();
    await userEvent.click(day("2026-10-14"));
    await settle();
    expect(content()).not.toBeNull();
  });

  it("flips the arrows and the grid's arrow keys in right-to-left", async () => {
    render(() => h(ConfigProvider, { dir: "rtl" }, () => h(DatePicker, { defaultValue: oct6, locale: "en-US" })));
    await open();
    expect(style(next().querySelector("svg")!).rotate).toBe("180deg");
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(day("2026-10-07"));
  });

  it("mirrors the frame and the panel from the root's dir, without a ConfigProvider", async () => {
    render(() => h(DatePicker, { defaultValue: oct6, dir: "rtl", locale: "en-US", "aria-label": "Date" }));
    expect(frame().getAttribute("dir")).toBe("rtl");
    expect(trigger().getBoundingClientRect().right).toBeLessThan(segments()[0]!.getBoundingClientRect().left);
    await open();
    expect(content()!.getAttribute("dir")).toBe("rtl");
  });
});

describe("in a field", () => {
  it("is labelled and described by the field, with one element on the field's id", async () => {
    render(() =>
      h(Field, { invalid: true }, () => [
        h(FieldLabel, () => "Due date"),
        h(DatePicker, { defaultValue: oct6, locale: "en-US" }),
        h(FieldDescription, () => "When the invoice is due."),
        h(FieldError, () => "Pick a weekday."),
      ]),
    );
    await nextTick();
    const label = q("[data-slot=field-label]");
    const group = frame().querySelector<HTMLElement>("[role=group]")!;
    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
    expect(group.getAttribute("aria-describedby")!.split(" ")).toHaveLength(2);
    expect(segments()[0]!.getAttribute("aria-invalid")).toBe("true");

    await userEvent.click(label);
    expect(document.activeElement).toBe(segments()[0]);

    await open();
    const id = label.getAttribute("for")!;
    expect(document.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
    expect(q("[data-slot=calendar]").getAttribute("aria-labelledby")).toContain(label.id);
  });

  it("is disabled and required with the field", () => {
    render(() =>
      h(Field, { disabled: true, required: true }, () => [
        h(FieldLabel, () => "Date"),
        h(DatePicker, { name: "date" }),
      ]),
    );
    expect(segments()[0]!.getAttribute("aria-disabled")).toBe("true");
    expect((trigger() as HTMLButtonElement).disabled).toBe(true);
    expect(q("input[name=date]").hasAttribute("required")).toBe(true);
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

  it("submits the date under its name", () => {
    const { submits, element } = form(() => h(DatePicker, { name: "due", defaultValue: oct6 }));
    element.requestSubmit();
    expect(submits[0]!.getAll("due")).toEqual(["2026-10-06"]);
  });

  it("submits a date with time as datetime-local (reka-ui#2398)", () => {
    const { submits, element } = form(() =>
      h(DatePicker, { name: "at", granularity: "minute", defaultValue: new CalendarDateTime(2026, 10, 6, 9, 30) }),
    );
    expect(element.checkValidity()).toBe(true);
    element.requestSubmit();
    expect(submits[0]!.get("at")).toBe("2026-10-06T09:30");
  });

  it("fails required while empty", () => {
    const { element } = form(() => h(DatePicker, { name: "due", required: true }));
    expect(element.checkValidity()).toBe(false);
  });

  it("never submits from the trigger, the arrows or the days (shadcn-vue#460)", async () => {
    const { submits } = form(() => h(DatePicker, { name: "due", defaultValue: oct6, locale: "en-US" }));
    await open();
    await userEvent.click(next());
    await userEvent.keyboard("{Enter}");
    await userEvent.click(day("2026-12-12"));
    await closed();
    await userEvent.click(trigger());
    await settle();
    expect(submits).toHaveLength(0);
  });
});

describe("with a button trigger", () => {
  const picker = (props: Record<string, unknown> = {}) =>
    h(DatePicker, { locale: "en-US", ...props }, () => [
      h(DatePickerTrigger, { asChild: true }, () =>
        h(Button, { variant: "outline", color: "neutral" }, () => h(DatePickerValue, { placeholder: "Pick a date" })),
      ),
      h(DatePickerContent, () => h(DatePickerCalendar)),
    ]);

  it("shows the placeholder, then the value in the locale's medium format", async () => {
    const value = shallowRef<DateValue | undefined>();
    render(() => picker({ modelValue: value.value, "onUpdate:modelValue": (next: DateValue) => (value.value = next) }));
    const label = q("[data-slot=date-picker-value]");
    expect(label.textContent).toBe("Pick a date");
    expect(label.hasAttribute("data-placeholder")).toBe(true);
    expect(trigger().dataset.slot).toBe("date-picker-trigger");
    value.value = oct6;
    await nextTick();
    expect(label.textContent).toBe("Oct 6, 2026");
    expect(label.hasAttribute("data-placeholder")).toBe(false);
  });

  it("takes the field's id, label, description and invalid state", async () => {
    render(() =>
      h(Field, { invalid: true }, () => [
        h(FieldLabel, () => "Due date"),
        picker({ defaultValue: oct6 }),
        h(FieldDescription, () => "When the invoice is due."),
      ]),
    );
    await nextTick();
    const label = q("[data-slot=field-label]");
    expect(trigger().id).toBe(label.getAttribute("for"));
    expect(trigger().getAttribute("aria-labelledby")).toBe(`${label.id} ${trigger().id}`);
    expect(trigger().getAttribute("aria-describedby")).toBe(q("[data-slot=field-description]").id);
    expect(trigger().getAttribute("aria-invalid")).toBe("true");
    await open();
    expect(content()!.getAttribute("aria-labelledby")).toBe(trigger().id);
  });

  it("submits through a hidden input that hands focus to the trigger", async () => {
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
        [picker({ name: "due", required: true })],
      ),
    );
    const form = q("form") as HTMLFormElement;
    expect(form.checkValidity()).toBe(false);
    q("[data-slot=date-picker-native-input]").focus();
    expect(document.activeElement).toBe(trigger());
    await open();
    await userEvent.keyboard("{Enter}");
    await closed();
    form.requestSubmit();
    expect(submits[0]!.get("due")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("focus and blur", () => {
  it("fire once for the field, the trigger and the calendar together", async () => {
    const events: string[] = [];
    render(() =>
      h("div", [
        h(DatePicker, {
          defaultValue: oct6,
          locale: "en-US",
          onFocus: () => events.push("focus"),
          onBlur: () => events.push("blur"),
        }),
        h("button", { "data-test": "after" }, "After"),
      ]),
    );
    await userEvent.click(segments()[0]!);
    await userEvent.keyboard("{Tab}{Tab}{Tab}");
    expect(document.activeElement).toBe(trigger());
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => content()).not.toBeNull();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await closed();
    await expect.poll(() => document.activeElement).toBe(trigger());
    await settle();
    expect(events).toEqual(["focus"]);
    await userEvent.click(q("[data-test=after]"));
    await settle();
    expect(events).toEqual(["focus", "blur"]);
  });

  it("count a select in the calendar's heading as inside, though its list is portalled out", async () => {
    const events: string[] = [];
    render(() =>
      h("div", [
        h("button", { "data-test": "before" }, "Before"),
        h(
          DatePicker,
          {
            defaultValue: oct6,
            locale: "en-US",
            "aria-label": "Date",
            onFocus: () => events.push("focus"),
            onBlur: () => events.push("blur"),
          },
          () => [
            h(DatePickerInput),
            h(DatePickerContent, () =>
              h(DatePickerCalendar, null, {
                heading: () =>
                  h(Select, { defaultValue: "a" }, () => [
                    h(SelectTrigger, { "data-test": "select", "aria-label": "Year" }, () => h(SelectValue)),
                    h(SelectContent, () => ["a", "b"].map((item) => h(SelectItem, { value: item }, () => item))),
                  ]),
              }),
            ),
          ],
        ),
      ]),
    );
    await open();
    await userEvent.click(q("[data-test=select]"));
    await expect.poll(() => document.querySelector("[data-slot=select-content]")).not.toBeNull();
    await settle();
    expect(events).toEqual(["focus"]);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect.poll(() => document.querySelector("[data-slot=select-content]")).toBeNull();
    await settle();
    expect(events).toEqual(["focus"]);
    expect(content()).not.toBeNull();
    // A click outside closes the panel, and that is leaving the picker.
    await userEvent.click(q("[data-test=before]"));
    await closed();
    await settle();
    expect(events).toEqual(["focus", "blur"]);
  });
});

describe("overlays", () => {
  it("picks a day inside a dialog without closing it (shadcn-vue#498)", async () => {
    const value = shallowRef<DateValue | undefined>();
    render(() =>
      h(Dialog, { defaultOpen: true }, () =>
        h(DialogContent, () => [
          h(DialogHeader, () => h(DialogTitle, () => "Reschedule")),
          h(DatePicker, {
            defaultPlaceholder: oct6,
            locale: "en-US",
            modelValue: value.value,
            "onUpdate:modelValue": (next?: DateValue) => (value.value = next),
          }),
        ]),
      ),
    );
    await expect.poll(() => document.querySelector("[data-slot=date-picker-trigger]")).not.toBeNull();
    await open();
    expect(heading()).toBe("October 2026");
    const target = day("2026-10-14");
    const box = target.getBoundingClientRect();
    expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)).toBe(target);
    await userEvent.click(target);
    expect(value.value?.toString()).toBe("2026-10-14");
    await closed();
    expect(document.querySelector("[data-slot=dialog-content]")).not.toBeNull();
  });

  it("stays open when a select was open just before (nuxt/ui#6114)", async () => {
    render(() =>
      h("div", [
        h(Select, { defaultValue: "a" }, () => [
          h(SelectTrigger, { "data-test": "select", class: "w-40" }, () => h(SelectValue)),
          h(SelectContent, () => ["a", "b"].map((item) => h(SelectItem, { value: item }, () => item))),
        ]),
        h(DatePicker, { defaultValue: oct6 }),
      ]),
    );
    await userEvent.click(q("[data-test=select]"));
    await expect.poll(() => document.querySelector("[data-slot=select-content]")).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector("[data-slot=select-content]")).toBeNull();
    await open();
    await settle();
    expect(content()).not.toBeNull();
  });

  it("covers the page with a scrim when modal", async () => {
    render(() => h(DatePicker, { defaultValue: oct6, modal: true }));
    await open();
    expect(document.querySelector("[data-slot=date-picker-scrim]")).not.toBeNull();
  });
});
