import { type DateValue, isEqualDay } from "@internationalized/date";
import { type VariantProps, cva } from "class-variance-authority";
import { createContext, useId } from "reka-ui";
import { computed } from "vue";

import { useFieldControl } from "@/lib/field-context";
import type { ButtonColor } from "@/ui/button";

export { default as Calendar } from "./Calendar.vue";
export { default as CalendarCell } from "./CalendarCell.vue";
export { default as CalendarCellTrigger } from "./CalendarCellTrigger.vue";
export { default as CalendarGrid } from "./CalendarGrid.vue";
export { default as CalendarGridBody } from "./CalendarGridBody.vue";
export { default as CalendarGridHead } from "./CalendarGridHead.vue";
export { default as CalendarGridRow } from "./CalendarGridRow.vue";
export { default as CalendarHeadCell } from "./CalendarHeadCell.vue";
export { default as CalendarHeader } from "./CalendarHeader.vue";
export { default as CalendarHeading } from "./CalendarHeading.vue";
export { default as CalendarNextButton } from "./CalendarNextButton.vue";
export { default as CalendarPrevButton } from "./CalendarPrevButton.vue";

export type CalendarColor = ButtonColor | (string & {});

/** Sizes live in CSS variables on the root, so parts composed by hand pick them up too. */
export const calendarVariants = cva(
  `
    group/calendar flex w-fit flex-col gap-(--calendar-gap) text-foreground tone-control
    aria-invalid:tone-invalid
    data-invalid:tone-invalid
  `,
  {
    variants: {
      size: {
        xs: `
          text-body-sm [--calendar-cell:var(--control-height-xs)] [--calendar-gap:var(--control-gap-xs)]
          [--calendar-icon:var(--control-icon-xs)]
        `,
        sm: `
          text-body-sm [--calendar-cell:var(--control-height-sm)] [--calendar-gap:var(--control-gap-sm)]
          [--calendar-icon:var(--control-icon-sm)]
        `,
        md: `
          text-body-md [--calendar-cell:var(--control-height-md)] [--calendar-gap:var(--control-gap-md)]
          [--calendar-icon:var(--control-icon-md)]
        `,
        lg: `
          text-body-lg [--calendar-cell:var(--control-height-lg)] [--calendar-gap:var(--control-gap-lg)]
          [--calendar-icon:var(--control-icon-lg)]
        `,
        xl: `
          text-body-lg [--calendar-cell:var(--control-height-xl)] [--calendar-gap:var(--control-gap-xl)]
          [--calendar-icon:var(--control-icon-xl)]
        `,
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type CalendarVariants = VariantProps<typeof calendarVariants>;
export type CalendarSize = NonNullable<CalendarVariants["size"]>;

/** Months side by side from `sm` up, stacked below it. */
export const calendarMonths = "flex flex-col gap-[calc(var(--calendar-gap)*2)] sm:flex-row";

export const calendarHeader = "flex items-center gap-(--calendar-gap)";

/** The heading doesn't clip, so controls put in its slot keep their focus ring; its text truncates. */
export const calendarHeading = `
  flex min-w-0 flex-1 items-center gap-(--calendar-gap) text-start text-title-sm
  group-data-[size=lg]/calendar:text-title-md
  group-data-[size=xl]/calendar:text-title-md
  data-disabled:text-foreground/(--disabled-opacity)
`;

export const calendarHeadingText = "min-w-0 truncate ps-2";

export const calendarNavButton = "size-(--calendar-cell) rounded-full p-0 icon-size-(--calendar-icon)";

// Separate borders: collapsed ones ignore the border-radius that rounds the range band.
export const calendarGrid = "table-fixed border-separate border-spacing-0 select-none";

export const calendarHeadCell = `
  size-(--calendar-cell) min-w-(--calendar-cell) p-0 text-center text-label-md font-normal text-muted-foreground
  group-data-[size=lg]/calendar:text-label-lg
  group-data-[size=sm]/calendar:text-label-sm
  group-data-[size=xl]/calendar:text-label-lg
  group-data-[size=xs]/calendar:text-label-sm
`;

export const calendarWeekNumber = `
  w-(--calendar-cell) min-w-(--calendar-cell) p-0 text-center text-label-md font-normal text-muted-foreground
  tabular-nums
  group-data-[size=lg]/calendar:text-label-lg
  group-data-[size=sm]/calendar:text-label-sm
  group-data-[size=xl]/calendar:text-label-lg
  group-data-[size=xs]/calendar:text-label-sm
`;

export const calendarCell = "relative size-(--calendar-cell) p-0 text-center";

/**
 * The day, shared by Calendar and RangeCalendar: a round state-layer target with today's outline,
 * muted outside days, struck-through unavailable days and faded disabled ones. Outside days are
 * hidden when the root shows more than one month, since the next grid draws them again.
 */
export const calendarDay = `
  relative mx-auto flex size-(--calendar-cell) cursor-pointer items-center justify-center rounded-full tabular-nums
  state-layer outline-none transition-[color,background-color,box-shadow] duration-short-3 ease-standard
  focus-visible:z-10 focus-visible:focus-ring
  data-today:not-data-selected:not-data-disabled:text-tone-text
  data-today:not-data-selected:not-data-disabled:inset-ring
  data-today:not-data-selected:not-data-disabled:inset-ring-tone-text
  data-outside-view:not-data-selected:text-muted-foreground
  data-unavailable:text-muted-foreground data-unavailable:line-through
  data-disabled:cursor-default data-disabled:text-foreground/(--disabled-opacity)
  aria-disabled:cursor-default
  group-data-readonly/calendar:cursor-default
  forced-colors:data-today:underline
  group-data-months/calendar:data-outside-view:pointer-events-none
  group-data-months/calendar:data-outside-view:invisible
`;

export const calendarCellTrigger = `${calendarDay}
  data-selected:bg-tone data-selected:text-tone-foreground
  data-disabled:data-selected:bg-foreground/(--disabled-container-opacity)
  data-disabled:data-selected:text-foreground/(--disabled-opacity)
  forced-colors:data-selected:outline-2
`;

/** Gives the root heading's id to `CalendarHeading`, so a field label and the month name label the calendar together. */
export const [injectCalendarLayoutContext, provideCalendarLayoutContext] = createContext<{ headingId: string }>(
  "CalendarLayout",
);

/**
 * Field wiring shared by Calendar and RangeCalendar. Inside a field the root is labelled by the
 * field label and the month heading, which replaces Reka's English "Event Date" label.
 */
export const useCalendarField = (props: { id?: string; disabled?: boolean }, attrs: Record<string, unknown>) => {
  const control = useFieldControl(props, attrs);

  const headingId = [control.id.value ?? useId(undefined, "calendar"), "heading"].join("-");
  provideCalendarLayoutContext({ headingId });

  const labelledBy = computed(() =>
    control.field?.hasLabel.value && control.labelledBy.value === control.field.labelId
      ? `${control.field.labelId} ${headingId}`
      : control.labelledBy.value,
  );

  const rootAttrs = computed(() => {
    const { "aria-invalid": _, "aria-labelledby": __, "aria-describedby": ___, ...rest } = attrs;
    return rest;
  });

  return { control, labelledBy, rootAttrs };
};

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** `getWeekNumber`'s first-day argument for Reka's `weekStartsOn` (0 is Sunday). */
export const firstDayOfWeek = (weekStartsOn: number) => DAYS[weekStartsOn % 7]!;

type Selection = DateValue | DateValue[] | null | undefined;

/** Whether two selections hold the same days, ignoring object identity. */
export const isSameSelection = (a: Selection, b: Selection) => {
  if (!a || !b) return !a && !b;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((day, index) => isEqualDay(day, b[index]!));
  }
  return isEqualDay(a, b);
};

/**
 * Focuses the selected day, else today, else the day Reka's roving tabindex points at. Reka's own
 * `initialFocus` takes the first `[data-selected]` or `[data-today]` in DOM order, which can be a
 * hidden outside-view copy that can't take focus, and then focuses nothing.
 */
export const focusInitialDay = (root: HTMLElement | undefined) => {
  const day = (state: string) =>
    root?.querySelector<HTMLElement>(`[data-reka-calendar-cell-trigger]${state}[tabindex]:not([data-outside-view])`);
  (day("[data-selected]") ?? day("[data-today]") ?? day('[tabindex="0"]') ?? day(""))?.focus();
};
