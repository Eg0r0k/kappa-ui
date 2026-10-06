import { CalendarDate, CalendarDateTime, isWeekend } from "@internationalized/date";
import { CalendarDays } from "@lucide/vue";
import { mount } from "@vue/test-utils";
import { ConfigProvider, type DateValue } from "reka-ui";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, shallowRef } from "vue";

import { Button } from "@/ui/button";
import { ButtonGroup } from "@/ui/button-group";
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { InputDate } from "@/ui/input-date";
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/ui/input-group";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

afterEach(() => {
  document.body.innerHTML = "";
});

const colors =
  "--input: rgb(0, 0, 255); --primary: rgb(0, 128, 0); --destructive: rgb(255, 0, 0); --disabled-opacity: 38%";

const render = (node: VNode) => mount({ render: () => node }, { attachTo: document.body });
const root = () => document.querySelector<HTMLElement>("[data-slot=input-date]")!;
const segments = () => [...document.querySelectorAll<HTMLElement>("[data-slot=input-date-segment]")];
const editable = () => segments().filter((segment) => segment.getAttribute("role") === "spinbutton");
const texts = () => editable().map((segment) => segment.textContent);
const hidden = () => document.querySelector<HTMLInputElement>("input[tabindex='-1']")!;
const settle = () => new Promise((resolve) => setTimeout(resolve, 250));
const date = new CalendarDate(2024, 3, 15);

const bound = (initial: DateValue | undefined, props: Record<string, unknown> = {}) => {
  const value = shallowRef<DateValue | null | undefined>(initial);
  mount(
    defineComponent(
      () => () =>
        h(InputDate, {
          locale: "en-US",
          ...props,
          modelValue: value.value,
          "onUpdate:modelValue": (next?: DateValue) => (value.value = next),
        }),
    ),
    { attachTo: document.body },
  );
  return value;
};

const paste = (target: HTMLElement, text: string) => {
  const data = new DataTransfer();
  data.setData("text", text);
  const event = new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
};

it("renders month, day and year spinbuttons around literals inside a group frame", () => {
  render(h(InputDate, { style: colors, locale: "en-US", defaultValue: date }));
  expect(root().getAttribute("role")).toBe("group");
  expect(root().dataset.variant).toBe("outline");
  expect(root().dataset.size).toBe("md");
  expect(root().offsetHeight).toBe(36);
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(0, 0, 255)");
  expect(segments().map((segment) => segment.dataset.rekaDateFieldSegment)).toEqual([
    "month",
    "literal",
    "day",
    "literal",
    "year",
  ]);
  expect(texts()).toEqual(["3", "15", "2024"]);
});

it("takes Input's heights", () => {
  const heights = (["xs", "sm", "md", "lg", "xl"] as const).map((size) => {
    const wrapper = render(h(InputDate, { size }));
    const height = root().offsetHeight;
    wrapper.unmount();
    return height;
  });
  expect(heights).toEqual([28, 32, 36, 40, 48]);
});

it("follows the locale's order and literals, from the prop or a ConfigProvider", () => {
  render(h(InputDate, { locale: "de-DE", defaultValue: date }));
  expect(root().textContent).toBe("15.3.2024");
  document.body.innerHTML = "";

  render(h(ConfigProvider, { locale: "ja-JP" }, () => h(InputDate, { defaultValue: date })));
  expect(editable().map((segment) => segment.dataset.rekaDateFieldSegment)).toEqual(["year", "month", "day"]);
  expect(root().textContent).toBe("2024/3/15");
});

it("types every day of the month in a day-first locale (reka-ui#1828)", async () => {
  const value = bound(undefined, { locale: "de-DE" });
  await userEvent.click(editable()[0]!);
  await userEvent.keyboard("31122024");
  expect(value.value?.toString()).toBe("2024-12-31");
});

it("updates the model from typed digits and arrow keys, moving to the next segment when one is full", async () => {
  const value = bound(undefined);
  await userEvent.click(editable()[0]!);
  await userEvent.keyboard("03");
  expect(document.activeElement).toBe(editable()[1]);
  await userEvent.keyboard("152024");
  expect(value.value?.toString()).toBe("2024-03-15");
  await userEvent.click(editable()[1]!);
  await userEvent.keyboard("{ArrowUp}");
  expect(value.value?.toString()).toBe("2024-03-16");
});

it("writes nothing but the formatted value into a segment (nuxt/ui#6168)", async () => {
  bound(undefined);
  await userEvent.click(editable()[0]!);
  await userEvent.keyboard("1");
  expect(editable()[0]!.innerHTML).toBe("1");
  await userEvent.keyboard("{ArrowUp}");
  expect(editable()[0]!.innerHTML).toBe("2");
});

it("gives undefined when a segment is cleared (reka-ui#1904)", async () => {
  const value = bound(date);
  await userEvent.click(editable()[1]!);
  await userEvent.keyboard("{Backspace}{Backspace}");
  expect(value.value).toBeUndefined();
  expect(editable()[1]!.hasAttribute("data-placeholder")).toBe(true);
});

it("empties every segment when the model is cleared", async () => {
  const value = bound(date);
  value.value = undefined;
  await nextTick();
  for (const segment of editable()) expect(segment.hasAttribute("data-placeholder")).toBe(true);
  value.value = new CalendarDate(2025, 1, 2);
  await nextTick();
  expect(texts()).toEqual(["1", "2", "2025"]);
  value.value = null;
  await nextTick();
  for (const segment of editable()) expect(segment.hasAttribute("data-placeholder")).toBe(true);
});

it("shows date and time segments for a CalendarDateTime", () => {
  render(
    h(InputDate, {
      locale: "en-US",
      granularity: "minute",
      hourCycle: 24,
      defaultValue: new CalendarDateTime(2024, 3, 15, 9, 5),
    }),
  );
  expect(texts()).toEqual(["3", "15", "2024", "09", "05"]);
});

it("reads 15:30 as PM in a locale whose day period isn't PM (reka-ui#2956)", () => {
  render(
    h(InputDate, {
      locale: "es-ES",
      granularity: "minute",
      hourCycle: 12,
      defaultValue: new CalendarDateTime(2024, 3, 15, 15, 30),
    }),
  );
  expect(editable().at(-1)!.dataset.rekaDateFieldSegment).toBe("dayPeriod");
  expect(editable().at(-1)!.textContent).toBe("PM");
});

it("remounts when the granularity or the hour cycle changes (reka-ui#1127)", async () => {
  const granularity = shallowRef<"day" | "minute">("day");
  const hourCycle = shallowRef<12 | 24>(24);
  mount(
    defineComponent(
      () => () =>
        h(InputDate, {
          locale: "en-US",
          granularity: granularity.value,
          hourCycle: hourCycle.value,
          defaultPlaceholder: new CalendarDateTime(2024, 3, 15, 15, 0),
          defaultValue: new CalendarDateTime(2024, 3, 15, 15, 30),
        }),
    ),
    { attachTo: document.body },
  );
  expect(texts()).toEqual(["3", "15", "2024"]);
  granularity.value = "minute";
  await nextTick();
  await nextTick();
  expect(texts()).toEqual(["3", "15", "2024", "15", "30"]);
  await userEvent.click(editable()[2]!);
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(editable()[3]);
  hourCycle.value = 12;
  await nextTick();
  await nextTick();
  expect(texts()).toEqual(["3", "15", "2024", "3", "30", "PM"]);
});

it("auto-advances and mirrors the arrow keys in RTL (reka-ui#2812)", async () => {
  render(h(ConfigProvider, { dir: "rtl" }, () => h(InputDate, { locale: "en-US" })));
  await userEvent.click(editable()[0]!);
  await userEvent.keyboard("03");
  expect(document.activeElement).toBe(editable()[1]);
  await userEvent.keyboard("{ArrowLeft}");
  expect(document.activeElement).toBe(editable()[2]);
  await userEvent.keyboard("{ArrowRight}{ArrowRight}");
  expect(document.activeElement).toBe(editable()[0]);
});

it("rings the frame and highlights the segment that has focus", async () => {
  render(h(InputDate, { style: colors, defaultValue: date }));
  editable()[1]!.focus();
  await settle();
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(0, 128, 0)");
  expect(getComputedStyle(editable()[1]!).backgroundColor).toBe("rgb(0, 128, 0)");
});

it("marks the segments and the frame invalid outside min and max", () => {
  render(h(InputDate, { style: colors, defaultValue: date, maxValue: new CalendarDate(2024, 3, 1) }));
  expect(root().dataset.invalid).toBe("");
  for (const segment of editable()) expect(segment.getAttribute("aria-invalid")).toBe("true");
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(255, 0, 0)");
});

it("marks an unavailable date invalid", () => {
  render(
    h(InputDate, {
      locale: "en-US",
      defaultValue: new CalendarDate(2024, 3, 16),
      isDateUnavailable: (value: DateValue) => isWeekend(value, "en-US"),
    }),
  );
  expect(root().dataset.invalid).toBe("");
  for (const segment of editable()) expect(segment.getAttribute("aria-invalid")).toBe("true");
});

it("takes id, label, error, required and invalid from a Field", async () => {
  render(
    h(Field, { invalid: true, required: true }, () => [
      h(FieldLabel, () => "Date of birth"),
      h(InputDate, { style: colors }),
      h(FieldError, { errors: "Enter your date of birth." }),
    ]),
  );
  await nextTick();
  const label = document.querySelector<HTMLElement>("[data-slot=field-label]")!;
  const error = document.querySelector<HTMLElement>("[data-slot=field-error]")!;
  expect(root().getAttribute("aria-labelledby")).toBe(label.id);
  expect(root().getAttribute("aria-describedby")).toBe(error.id);
  expect(hidden().id).toBe(label.getAttribute("for"));
  expect(hidden().required).toBe(true);
  expect(hidden().getAttribute("aria-hidden")).toBe("true");
  for (const segment of editable()) expect(segment.getAttribute("aria-invalid")).toBe("true");
  expect(getComputedStyle(root()).borderTopColor).toBe("rgb(255, 0, 0)");
  await userEvent.click(label);
  expect(document.activeElement).toBe(editable()[0]);
});

it("is disabled by the prop or by a disabled field", async () => {
  render(h(InputDate, { style: colors, disabled: true }));
  expect(root().dataset.disabled).toBe("");
  expect(hidden().disabled).toBe(true);
  for (const segment of editable()) expect(segment.getAttribute("contenteditable")).toBe("false");
  expect(getComputedStyle(root()).borderTopColor).not.toBe("rgb(0, 0, 255)");
  document.body.innerHTML = "";

  render(h(Field, { disabled: true }, () => [h(FieldLabel, () => "Date"), h(InputDate)]));
  await nextTick();
  expect(root().dataset.disabled).toBe("");
});

it("keeps a readonly field focusable but not editable (reka-ui#2007)", async () => {
  const value = bound(date, { readonly: true });
  await userEvent.click(editable()[1]!);
  expect(document.activeElement).toBe(editable()[1]);
  expect(editable()[1]!.getAttribute("contenteditable")).toBe("false");
  await userEvent.keyboard("2{ArrowUp}");
  expect(value.value?.toString()).toBe("2024-03-15");
});

it("shows a spinner at the end and marks the field busy while loading", () => {
  render(h(InputDate, { loading: true, defaultValue: date }));
  expect(root().getAttribute("aria-busy")).toBe("true");
  const spinner = root().querySelector<HTMLElement>("[data-slot=spinner]")!;
  expect(spinner.getBoundingClientRect().left).toBeGreaterThan(editable()[2]!.getBoundingClientRect().right + 40);
});

it("keeps every segment on one line in a narrow container (nuxt/ui#6338)", () => {
  for (const size of ["xs", "sm"] as const) {
    render(
      h("div", { style: "width: 320px" }, [
        h(InputDate, { size, granularity: "minute", defaultValue: new CalendarDateTime(2024, 3, 15, 9, 30) }),
      ]),
    );
    const lineHeight = editable()[0]!.offsetHeight;
    for (const segment of editable()) expect(segment.offsetHeight).toBe(lineHeight);
    const tops = new Set(editable().map((segment) => segment.getBoundingClientRect().top));
    expect(tops.size).toBe(1);
    document.body.innerHTML = "";
  }
});

describe("forms", () => {
  it("submits the date, or the date and time, under its name", () => {
    render(
      h("form", [
        h(InputDate, { name: "day", defaultValue: date }),
        h(InputDate, { name: "at", granularity: "minute", defaultValue: new CalendarDateTime(2024, 3, 15, 10, 30) }),
      ]),
    );
    const data = new FormData(document.querySelector("form")!);
    expect(data.get("day")).toBe("2024-03-15");
    expect(data.get("at")).toBe("2024-03-15T10:30");
  });

  it("fails native validation when required and empty, or outside min and max (reka-ui#2275)", () => {
    render(h("form", [h(InputDate, { name: "day", required: true })]));
    expect(document.querySelector("form")!.checkValidity()).toBe(false);
    document.body.innerHTML = "";

    render(h("form", [h(InputDate, { name: "day", defaultValue: date, minValue: new CalendarDate(2024, 4, 1) })]));
    expect(document.querySelector("form")!.checkValidity()).toBe(false);
    document.body.innerHTML = "";

    render(
      h("form", [
        h(InputDate, {
          name: "at",
          granularity: "second",
          defaultValue: new CalendarDateTime(2024, 3, 15, 10, 30, 15),
        }),
      ]),
    );
    expect(document.querySelector("form")!.checkValidity()).toBe(true);
  });

  it("submits the enclosing form on Enter, like a native date input (reka-ui#1993)", async () => {
    const submitted: string[] = [];
    render(
      h(
        "form",
        {
          onSubmit: (event: SubmitEvent) => {
            event.preventDefault();
            submitted.push(String(new FormData(event.target as HTMLFormElement).get("day")));
          },
        },
        [h(InputDate, { name: "day", defaultValue: date })],
      ),
    );
    await userEvent.click(editable()[1]!);
    await userEvent.keyboard("{Enter}");
    expect(submitted).toEqual(["2024-03-15"]);
    expect(texts()).toEqual(["3", "15", "2024"]);
  });

  it("leaves a form without a submit button alone on Enter when it has another text field, like a native input", async () => {
    const submitted: string[] = [];
    render(
      h(
        "form",
        {
          onSubmit: (event: SubmitEvent) => {
            event.preventDefault();
            submitted.push("submit");
          },
        },
        [h(InputDate, { name: "day", defaultValue: date }), h("input", { name: "note", type: "text" })],
      ),
    );
    await userEvent.click(editable()[1]!);
    await userEvent.keyboard("{Enter}");
    expect(submitted).toEqual([]);
  });

  it("clicks the form's default button on Enter, and does nothing while it is disabled", async () => {
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
              h(InputDate, { defaultValue: date }),
              h("button", { type: "submit", disabled: disabled.value, onClick: () => events.push("click") }, "Save"),
            ],
          ),
      ),
      { attachTo: document.body },
    );
    await userEvent.click(editable()[1]!);
    await userEvent.keyboard("{Enter}");
    expect(events).toEqual([]);
    disabled.value = false;
    await nextTick();
    editable()[1]!.focus();
    await userEvent.keyboard("{Enter}");
    expect(events).toEqual(["click", "submit"]);
  });

  it("lets any time on the max day pass the hidden input's max", () => {
    const maxValue = new CalendarDate(2024, 3, 15);
    render(
      h("form", [
        h(InputDate, { name: "at", maxValue, defaultValue: new CalendarDateTime(2024, 3, 15, 23, 30) }),
        h(InputDate, { name: "day", maxValue, defaultValue: date }),
      ]),
    );
    const form = document.querySelector("form")!;
    expect(form.querySelector<HTMLInputElement>("[name=at]")!.max).toBe("2024-03-15T23:59");
    expect(form.querySelector<HTMLInputElement>("[name=day]")!.max).toBe("2024-03-15");
    expect(form.checkValidity()).toBe(true);
    expect(root().hasAttribute("data-invalid")).toBe(false);
    document.body.innerHTML = "";

    render(h("form", [h(InputDate, { name: "at", maxValue, defaultValue: new CalendarDateTime(2024, 3, 16, 0, 0) })]));
    expect(document.querySelector("form")!.checkValidity()).toBe(false);
    expect(root().hasAttribute("data-invalid")).toBe(true);
  });
});

describe("paste (reka-ui#1897)", () => {
  it("lets the paste shortcut through to the segments", async () => {
    render(h(InputDate, { defaultValue: date }));
    // Vue skips a listener for events dispatched in the millisecond it was attached
    await settle();
    const event = new KeyboardEvent("keydown", { key: "v", ctrlKey: true, bubbles: true, cancelable: true });
    editable()[0]!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    // Ctrl+V on a Russian layout reports the Cyrillic letter as its key.
    const cyrillic = new KeyboardEvent("keydown", {
      key: "м",
      code: "KeyV",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    editable()[0]!.dispatchEvent(cyrillic);
    expect(cyrillic.defaultPrevented).toBe(false);
    const digit = new KeyboardEvent("keydown", { key: "1", bubbles: true, cancelable: true });
    editable()[0]!.dispatchEvent(digit);
    expect(digit.defaultPrevented).toBe(true);
  });

  it("reads a pasted ISO date into the model", async () => {
    const value = bound(undefined);
    const event = paste(editable()[1]!, " 2024-03-15 ");
    await nextTick();
    expect(event.defaultPrevented).toBe(true);
    expect(value.value?.toString()).toBe("2024-03-15");
    expect(texts()).toEqual(["3", "15", "2024"]);
  });

  it("keeps the time of a date and time field unless the text has one", async () => {
    const value = bound(new CalendarDateTime(2024, 1, 1, 9, 30), { granularity: "minute" });
    paste(editable()[0]!, "2024-03-15");
    await nextTick();
    expect(value.value?.toString()).toBe("2024-03-15T09:30:00");
    paste(editable()[0]!, "2024-03-16T18:45");
    await nextTick();
    expect(value.value?.toString()).toBe("2024-03-16T18:45:00");
  });

  it("builds a date and time from the text when the field is empty", async () => {
    const value = bound(undefined, { granularity: "minute" });
    paste(editable()[0]!, "2024-03-15T18:45");
    await nextTick();
    expect(value.value?.toString()).toBe("2024-03-15T18:45:00");
  });

  it("ignores text that isn't an ISO date, and a readonly field", async () => {
    const value = bound(date);
    for (const text of ["15/03/2024", "2024-02-31", "tomorrow"]) {
      const event = paste(editable()[0]!, text);
      expect(event.defaultPrevented).toBe(true);
    }
    await nextTick();
    expect(value.value?.toString()).toBe("2024-03-15");
    document.body.innerHTML = "";

    const readonly = bound(date, { readonly: true });
    paste(editable()[0]!, "2025-01-01");
    await nextTick();
    expect(readonly.value?.toString()).toBe("2024-03-15");
  });
});

describe("focus and blur (nuxt/ui#6854)", () => {
  it("fires once when focus enters and once when it leaves the field", async () => {
    const events: string[] = [];
    render(
      h("div", [
        h(InputDate, {
          defaultValue: date,
          onFocus: () => events.push("focus"),
          onBlur: () => events.push("blur"),
        }),
        h("button", "after"),
      ]),
    );
    await userEvent.click(editable()[0]!);
    await userEvent.keyboard("{Tab}{Tab}");
    expect(document.activeElement).toBe(editable()[2]);
    expect(events).toEqual(["focus"]);
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(document.querySelector("button"));
    expect(events).toEqual(["focus", "blur"]);
  });

  it("keeps the listeners off the root", () => {
    render(h(InputDate, { onFocus: () => {}, onBlur: () => {} }));
    expect(root().onfocus).toBeNull();
  });
});

it("focuses the first segment when the frame's padding is clicked (reka-ui#1541)", async () => {
  render(h(InputDate, { class: "w-80", defaultValue: date }));
  const box = root().getBoundingClientRect();
  await userEvent.click(root(), { position: { x: box.width - 8, y: box.height / 2 } });
  expect(document.activeElement).toBe(editable()[0]);
});

const groupFrame = () => document.querySelector<HTMLElement>("[data-slot=input-group]")!;
const groupControl = () => document.querySelector<HTMLElement>("[data-slot=input-group-control]")!;

it("becomes the frameless control of an InputGroup at the group's size", async () => {
  render(
    h(InputGroup, { size: "sm", style: colors }, () => [
      h(InputGroupAddon, () => h(CalendarDays)),
      h(InputDate, { defaultValue: date }),
      h(InputGroupAddon, { align: "inline-end" }, () => h(InputGroupButton, () => "Today")),
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
  render(h(InputGroup, () => [h(InputGroupAddon, () => h(CalendarDays)), h(InputDate)]));
  document.querySelector<HTMLElement>("[data-slot=input-group-addon]")!.click();
  await nextTick();
  expect(document.activeElement).toBe(editable()[0]);
});

it("fades the group when disabled inside it", () => {
  render(
    h(InputGroup, { style: colors }, () => [
      h(InputGroupAddon, () => h(CalendarDays)),
      h(InputDate, { disabled: true }),
    ]),
  );
  const addon = document.querySelector<HTMLElement>("[data-slot=input-group-addon]")!;
  expect(Number(getComputedStyle(addon).opacity)).toBeLessThan(1);
  expect(getComputedStyle(groupFrame()).borderTopColor).not.toBe("rgb(0, 0, 255)");
});

it("joins the buttons of a ButtonGroup (nuxt/ui#5595)", () => {
  render(
    h(ButtonGroup, () => [
      h(Button, { variant: "outline" }, () => "Earlier"),
      h(InputDate, { defaultValue: date, class: "w-40" }),
      h(Button, { variant: "outline" }, () => "Later"),
    ]),
  );
  const style = getComputedStyle(root());
  expect(style.marginInlineStart).toBe("-1px");
  expect(style.borderStartStartRadius).toBe("0px");
  expect(style.borderEndEndRadius).toBe("0px");
});

describe("InputDate control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("%s reads its height and padding tokens", (size) => {
    render(h(InputDate, { size }));
    const style = getComputedStyle(root());

    expect(px(style.height)).toBe(sentinel.height[size]);
    expect(px(style.paddingInlineStart)).toBe(sentinel.padding[size]);
  });
});
