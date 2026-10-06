import { calendarCell, calendarDay } from "@/ui/calendar";

export { default as RangeCalendar } from "./RangeCalendar.vue";
export { default as RangeCalendarCell } from "./RangeCalendarCell.vue";
export { default as RangeCalendarCellTrigger } from "./RangeCalendarCellTrigger.vue";
export { default as RangeCalendarGrid } from "./RangeCalendarGrid.vue";
export { default as RangeCalendarGridBody } from "./RangeCalendarGridBody.vue";
export { default as RangeCalendarGridHead } from "./RangeCalendarGridHead.vue";
export { default as RangeCalendarGridRow } from "./RangeCalendarGridRow.vue";
export { default as RangeCalendarHeadCell } from "./RangeCalendarHeadCell.vue";
export { default as RangeCalendarHeader } from "./RangeCalendarHeader.vue";
export { default as RangeCalendarHeading } from "./RangeCalendarHeading.vue";
export { default as RangeCalendarNextButton } from "./RangeCalendarNextButton.vue";
export { default as RangeCalendarPrevButton } from "./RangeCalendarPrevButton.vue";

/**
 * The cell draws the band: the committed range once it has an end, and the preview while the end
 * is being picked, rounded at both ends and at the row's edges.
 */
export const rangeCalendarCell = `${calendarCell}
  has-data-highlighted:bg-tone-soft
  group-has-data-selection-end/calendar:has-data-selected:bg-tone-soft
  first-of-type:rounded-s-full
  last-of-type:rounded-e-full
  has-data-highlighted-start:rounded-s-full
  has-data-selection-start:rounded-s-full
  has-data-highlighted-end:rounded-e-full
  has-data-selection-end:rounded-e-full
  group-data-months/calendar:has-data-outside-view:bg-transparent
  group-data-months/calendar:has-data-outside-view:has-data-selected:bg-transparent
`;

/** Start and end are filled in the tone; the days between take the band's text colour. */
export const rangeCalendarCellTrigger = `${calendarDay}
  data-selected:text-tone-soft-foreground
  data-selection-end:bg-tone data-selection-end:text-tone-foreground
  data-selection-start:bg-tone data-selection-start:text-tone-foreground
  data-disabled:data-selected:text-foreground/(--disabled-opacity)
  forced-colors:data-selection-end:outline-2
  forced-colors:data-selection-start:outline-2
`;
