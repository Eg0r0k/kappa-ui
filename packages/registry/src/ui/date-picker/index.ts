import { type VariantProps, cva } from "class-variance-authority";

export { default as DatePicker } from "./DatePicker.vue";
export { default as DatePickerCalendar } from "./DatePickerCalendar.vue";
export { default as DatePickerContent } from "./DatePickerContent.vue";
export { default as DatePickerInput } from "./DatePickerInput.vue";
export { default as DatePickerTrigger } from "./DatePickerTrigger.vue";
export { default as DatePickerValue } from "./DatePickerValue.vue";

export {
  type DatePickerContext,
  type DatePickerSize,
  type DatePickerVariant,
  injectDatePickerContext,
  injectDatePickerState,
} from "./picker";

/**
 * Laid over InputGroup's frame: the frame keeps its focus colour while the calendar is open, as a
 * Select trigger does.
 */
export const datePickerInputVariants = cva("", {
  variants: {
    variant: {
      outline: "data-[state=open]:border-primary data-[state=open]:inset-ring data-[state=open]:inset-ring-primary",
      soft: "data-[state=open]:border-primary data-[state=open]:inset-ring data-[state=open]:inset-ring-primary",
      filled: "data-[state=open]:border-primary data-[state=open]:shadow-[inset_0_-1px_0_var(--color-primary)]",
      ghost: `
        data-[state=open]:border-primary data-[state=open]:bg-muted data-[state=open]:inset-ring
        data-[state=open]:inset-ring-primary
      `,
      subtle: "data-[state=open]:border-primary data-[state=open]:inset-ring data-[state=open]:inset-ring-primary",
    },
  },
  defaultVariants: { variant: "outline" },
});

export type DatePickerInputVariants = VariantProps<typeof datePickerInputVariants>;

/**
 * The icon button at the end of the field: a square one spacing step inside the frame, with a radius
 * that stays concentric with the frame's. It reads the frame's size from InputGroup's variables.
 */
export const datePickerTrigger = `
  me-[calc(var(--spacing)-1px)] size-[calc(var(--input-group-height,var(--control-height-md))-var(--spacing)*2)]
  rounded-[max(0px,calc(var(--control-radius,var(--radius-lg))-var(--spacing)))] p-0 text-muted-foreground
  icon-size-[var(--input-group-icon,var(--control-icon-md))]
  data-[state=open]:text-foreground
`;

export const datePickerValue = "truncate data-placeholder:text-muted-foreground";

/** Padding around the calendar, which sizes itself; the panel is as wide as the months. */
export const datePickerContent =
  "w-auto max-w-(--reka-popover-content-available-width) p-3 origin-(--reka-popover-content-transform-origin)";
