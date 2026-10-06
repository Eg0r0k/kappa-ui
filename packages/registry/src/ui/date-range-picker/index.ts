import type { DateValue } from "@internationalized/date";
import { type DateRange, createContext } from "reka-ui";
import type { ComputedRef, ShallowRef } from "vue";

// The calendar opens and focuses the same way for a range, so these two parts are shared. Imported, then exported:
// the shadcn-vue CLI rewrites the alias of an import, not of an `export … from`.
import { DatePickerContent, type DatePickerSize, DatePickerTrigger, type DatePickerVariant } from "@/ui/date-picker";

export { default as DateRangePicker } from "./DateRangePicker.vue";
export { default as DateRangePickerCalendar } from "./DateRangePickerCalendar.vue";
export { default as DateRangePickerInput } from "./DateRangePickerInput.vue";
export { default as DateRangePickerValue } from "./DateRangePickerValue.vue";

export { DatePickerContent as DateRangePickerContent, DatePickerTrigger as DateRangePickerTrigger };
export type DateRangePickerSize = DatePickerSize;
export type DateRangePickerVariant = DatePickerVariant;

/** The range, the placeholder and the calendar settings of a `DateRangePicker`. */
export interface DateRangePickerState {
  model: ShallowRef<DateRange | null | undefined>;
  setModel: (value: DateRange) => void;
  /** Days picked in the calendar, keeping the typed times. */
  pick: (value: DateRange) => void;
  /** A finished range picked in the calendar: closes when `closeOnSelect` says so. */
  complete: () => void;
  placeholder: ShallowRef<DateValue | undefined>;
  setPlaceholder: (value: DateValue) => void;
  setStart: (value: DateValue | undefined) => void;
  field: ComputedRef<Record<string, unknown>>;
  calendar: ComputedRef<Record<string, unknown>>;
}

export const [injectDateRangePickerState, provideDateRangePickerState] =
  createContext<DateRangePickerState>("DateRangePickerState");
