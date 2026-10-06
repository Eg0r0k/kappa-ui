import { parseDate, parseTime, toCalendar, toCalendarDate, toCalendarDateTime } from "@internationalized/date";
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
      (event.currentTarget as HTMLElement).closest("form")?.requestSubmit();
    },
    // Reka prevents every key but Tab on a segment, the paste shortcut included (reka-ui#1897).
    onKeydownCapture: (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "v") {
        event.stopPropagation();
      }
    },
  };
};
