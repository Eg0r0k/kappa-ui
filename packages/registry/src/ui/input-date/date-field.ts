import { Time, parseDate, parseTime, toCalendar, toCalendarDate, toCalendarDateTime } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import type { Ref } from "vue";

export type InputGranularity = "day" | "minute" | "second";

/** The precision a native `date` or `datetime-local` input needs for the segments shown. */
export const inputGranularity = (parts: { part: string }[]): InputGranularity => {
  if (parts.some(({ part }) => part === "second")) return "second";
  return parts.some(({ part }) => part === "hour") ? "minute" : "day";
};

/** The value as a native `date` or `datetime-local` input writes it, in the Gregorian calendar. */
export const toInputValue = (value: DateValue | undefined, granularity: InputGranularity) => {
  if (!value) return "";
  if (granularity === "day") return toCalendarDate(value).toString();
  return toCalendarDateTime(value)
    .toString()
    .slice(0, granularity === "second" ? 19 : 16);
};

/**
 * A date-only `maxValue` as the last moment of that day. Reka already counts the whole day as valid,
 * but a native `datetime-local` input reads a bare date as midnight, so a later time on that day
 * failed the hidden input's `max` and blocked the form.
 */
export const inclusiveMax = (max: DateValue | undefined) =>
  max && !("hour" in max) ? toCalendarDateTime(max, new Time(23, 59, 59, 999)) : max;

const isoDate = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?))?$/;

/**
 * Reads pasted ISO text (`2024-03-15` or `2024-03-15T10:30`) into a value shaped like `base`:
 * its type, calendar and time zone, keeping its time when the text has none.
 */
export const parseDateText = (text: string, base: DateValue | undefined, withTime: boolean) => {
  const match = isoDate.exec(text.trim());
  if (!match) return undefined;
  try {
    const date = parseDate(match[1]!);
    const time = match[2] ? parseTime(match[2]) : undefined;
    if (!base) return withTime ? toCalendarDateTime(date, time) : date;
    const local = toCalendar(date, base.calendar);
    const day = { era: local.era, year: local.year, month: local.month, day: local.day };
    if (!time || !("hour" in base)) return base.set(day);
    return base.set({ ...day, hour: time.hour, minute: time.minute, second: time.second, millisecond: 0 });
  } catch {
    return undefined;
  }
};

/**
 * Enter as implicit submission works on a native input: it clicks the form's default button, does
 * nothing while that button is disabled, and submits a form that has none.
 */
const submitForm = (form: HTMLFormElement | null) => {
  if (!form) return;
  const button = [...form.elements].find(
    (element): element is HTMLButtonElement | HTMLInputElement =>
      (element instanceof HTMLButtonElement && element.type === "submit") ||
      (element instanceof HTMLInputElement && (element.type === "submit" || element.type === "image")),
  );
  if (!button) form.requestSubmit();
  else if (!button.disabled) button.click();
};

/**
 * Root listeners shared by InputDate and InputDateRange: `focus` and `blur` once per field rather than
 * per segment, a click on the frame focusing the first segment, Enter submitting the form, and the
 * paste shortcut let through to the segments.
 */
export const useSegmentedField = (
  emit: { (event: "focus", value: FocusEvent): void; (event: "blur", value: FocusEvent): void },
  disabled: Ref<boolean | undefined>,
) => {
  const outside = (event: FocusEvent) =>
    !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null);

  return {
    onFocusin: (event: FocusEvent) => {
      if (outside(event)) emit("focus", event);
    },
    onFocusout: (event: FocusEvent) => {
      if (outside(event)) emit("blur", event);
    },
    onMousedown: (event: MouseEvent) => {
      if (event.target !== event.currentTarget || disabled.value) return;
      event.preventDefault();
      (event.currentTarget as HTMLElement).querySelector<HTMLElement>("[role=spinbutton]")?.focus();
    },
    onKeydown: (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.isComposing) return;
      submitForm((event.currentTarget as HTMLElement).closest("form"));
    },
    // Reka prevents every key but Tab on a segment, the paste shortcut included (reka-ui#1897). The
    // code covers layouts where V types another letter, such as Russian.
    onKeydownCapture: (event: KeyboardEvent) => {
      const v = event.key.toLowerCase() === "v" || event.code === "KeyV";
      if ((event.ctrlKey || event.metaKey) && !event.altKey && v) {
        event.stopPropagation();
      }
    },
  };
};
