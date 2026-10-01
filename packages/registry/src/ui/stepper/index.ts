import { type VariantProps, cva } from "class-variance-authority";

export { default as Stepper } from "./Stepper.vue";
export { default as StepperDescription } from "./StepperDescription.vue";
export { default as StepperIndicator } from "./StepperIndicator.vue";
export { default as StepperItem } from "./StepperItem.vue";
export { default as StepperSeparator } from "./StepperSeparator.vue";
export { default as StepperTitle } from "./StepperTitle.vue";
export { default as StepperTrigger } from "./StepperTrigger.vue";

export const stepperVariants = cva("group/stepper flex gap-(--stepper-gap) data-[orientation=vertical]:flex-col", {
  variants: {
    size: {
      xs: "[--stepper-gap:--spacing(1.5)] [--stepper-icon:--spacing(3.5)] [--stepper-indicator:--spacing(6)] [--stepper-separator:1px]",
      sm: "[--stepper-gap:--spacing(2)] [--stepper-icon:--spacing(4)] [--stepper-indicator:--spacing(7)] [--stepper-separator:--spacing(0.5)]",
      md: "[--stepper-gap:--spacing(2)] [--stepper-icon:--spacing(4)] [--stepper-indicator:--spacing(8)] [--stepper-separator:--spacing(0.5)]",
      lg: "[--stepper-gap:--spacing(2.5)] [--stepper-icon:--spacing(5)] [--stepper-indicator:--spacing(10)] [--stepper-separator:--spacing(0.5)]",
      xl: "[--stepper-gap:--spacing(3)] [--stepper-icon:--spacing(6)] [--stepper-indicator:--spacing(12)] [--stepper-separator:--spacing(1)]",
    },
  },
  defaultVariants: { size: "md" },
});

export type StepperVariants = VariantProps<typeof stepperVariants>;

export const stepperItem = "group flex items-center gap-(--stepper-gap) data-disabled:pointer-events-none";

export const stepperTrigger =
  "flex flex-col items-center gap-1 rounded-md p-1 text-center outline-none focus-visible:focus-ring";

export const stepperIndicator =
  "inline-flex size-(--stepper-indicator) shrink-0 items-center justify-center rounded-full text-label-lg text-muted-foreground/50 group-data-[size=xs]/stepper:text-label-sm group-data-[size=sm]/stepper:text-label-md group-data-[size=xl]/stepper:text-title-md group-data-disabled:text-muted-foreground group-data-disabled:opacity-(--disabled-opacity) group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground group-data-[state=completed]:bg-accent group-data-[state=completed]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--stepper-icon)";

export const stepperTitle =
  "text-title-sm whitespace-nowrap group-data-[size=xs]/stepper:text-label-md group-data-[size=sm]/stepper:text-label-lg group-data-[size=lg]/stepper:text-title-md group-data-[size=xl]/stepper:text-title-lg";

export const stepperDescription =
  "text-body-sm text-muted-foreground group-data-[size=lg]/stepper:text-body-md group-data-[size=xl]/stepper:text-body-lg";

export const stepperSeparator =
  "shrink-0 rounded-full bg-muted group-data-disabled:opacity-(--disabled-opacity) group-data-[state=completed]:bg-accent data-[orientation=horizontal]:h-(--stepper-separator) data-[orientation=horizontal]:flex-1 data-[orientation=vertical]:w-(--stepper-separator) data-[orientation=vertical]:flex-1";
