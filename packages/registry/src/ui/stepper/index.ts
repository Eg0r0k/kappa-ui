import { type VariantProps, cva } from "class-variance-authority";

export { default as Stepper } from "./Stepper.vue";
export { default as StepperDescription } from "./StepperDescription.vue";
export { default as StepperIndicator } from "./StepperIndicator.vue";
export { default as StepperItem } from "./StepperItem.vue";
export { default as StepperSeparator } from "./StepperSeparator.vue";
export { default as StepperTitle } from "./StepperTitle.vue";
export { default as StepperTrigger } from "./StepperTrigger.vue";

export type StepperColor = "primary" | "neutral" | "destructive" | "success" | "warning" | "info";

export const stepperVariants = cva("group/stepper flex gap-(--stepper-gap) data-[orientation=vertical]:flex-col", {
  variants: {
    size: {
      xs: `
        [--stepper-gap:--spacing(1.5)] [--stepper-icon:--spacing(3.5)] [--stepper-indicator:--spacing(6)]
        [--stepper-text:var(--typescale-label-sm-size)] [--stepper-separator:1px]
      `,
      sm: `
        [--stepper-gap:--spacing(2)] [--stepper-icon:--spacing(4)] [--stepper-indicator:--spacing(7)]
        [--stepper-text:var(--typescale-label-md-size)] [--stepper-separator:--spacing(0.5)]
      `,
      md: `
        [--stepper-gap:--spacing(2)] [--stepper-icon:--spacing(4)] [--stepper-indicator:--spacing(8)]
        [--stepper-text:var(--typescale-label-lg-size)] [--stepper-separator:--spacing(0.5)]
      `,
      lg: `
        [--stepper-gap:--spacing(2.5)] [--stepper-icon:--spacing(5)] [--stepper-indicator:--spacing(10)]
        [--stepper-text:var(--typescale-label-lg-size)] [--stepper-separator:--spacing(0.5)]
      `,
      xl: `
        [--stepper-gap:--spacing(3)] [--stepper-icon:--spacing(6)] [--stepper-indicator:--spacing(12)]
        [--stepper-text:var(--typescale-title-md-size)] [--stepper-separator:--spacing(1)]
      `,
    },
  },
  defaultVariants: { size: "md" },
});

export type StepperVariants = VariantProps<typeof stepperVariants>;
export type StepperSize = NonNullable<StepperVariants["size"]>;

export const stepperItemVariants = cva(
  "group/stepper-item flex gap-(--stepper-gap) data-disabled:pointer-events-none",
  {
    variants: {
      orientation: { horizontal: "items-center", vertical: "relative items-start" },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

export const stepperTriggerVariants = cva(
  "flex items-center gap-1 rounded-item-xs p-1 outline-none focus-visible:focus-ring",
  {
    variants: {
      orientation: { horizontal: "flex-col text-center", vertical: "flex-row text-start" },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

export const stepperIndicator = `
  inline-flex size-(--stepper-indicator) shrink-0 items-center justify-center rounded-full text-(length:--stepper-text)
  leading-none font-medium text-muted-foreground/50
  group-data-disabled/stepper-item:text-muted-foreground group-data-disabled/stepper-item:opacity-(--disabled-opacity)
  group-data-[state=active]/stepper-item:bg-tone group-data-[state=active]/stepper-item:text-tone-foreground
  group-data-[state=completed]/stepper-item:bg-accent group-data-[state=completed]/stepper-item:text-accent-foreground
  [&_svg]:pointer-events-none [&_svg]:shrink-0
  icon-size-(--stepper-icon)
`;

export const stepperTitle = `text-title-sm whitespace-nowrap`;

export const stepperDescription = `text-body-sm text-muted-foreground`;

export const stepperSeparator = `
  h-(--stepper-separator-h) w-(--stepper-separator-w) flex-1 rounded-full bg-muted
  group-data-disabled/stepper-item:opacity-(--disabled-opacity)
  group-data-[state=completed]/stepper-item:bg-accent
  data-[orientation=horizontal]:[--stepper-separator-h:var(--stepper-separator)]
  data-[orientation=horizontal]:[--stepper-separator-w:auto]
  data-[orientation=vertical]:[--stepper-separator-h:auto]
  data-[orientation=vertical]:[--stepper-separator-w:var(--stepper-separator)]
  [:where([data-slot=stepper-item][data-orientation=vertical]>&)]:absolute
  [:where([data-slot=stepper-item][data-orientation=vertical]>&)]:start-[calc(--spacing(1)+(var(--stepper-indicator)-var(--stepper-separator))/2)]
  [:where([data-slot=stepper-item][data-orientation=vertical]>&)]:top-[calc(--spacing(1)+var(--stepper-indicator)+--spacing(1))]
  [:where([data-slot=stepper-item][data-orientation=vertical]>&)]:bottom-[calc(-1*var(--stepper-gap))]
`;
