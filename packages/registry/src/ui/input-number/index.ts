import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { ComputedRef } from "vue";

import {
  type TextControlSize,
  type TextControlVariant,
  textControlBase,
  textControlFrameVariant,
  textControlRadius,
} from "@/ui/input";

export { default as InputNumber } from "./InputNumber.vue";
export { default as InputNumberDecrement } from "./InputNumberDecrement.vue";
export { default as InputNumberIncrement } from "./InputNumberIncrement.vue";
export { default as InputNumberInput } from "./InputNumberInput.vue";

export type InputNumberOrientation = "horizontal" | "vertical";

export type InputNumberContext = {
  variant: TextControlVariant;
  size: TextControlSize;
  orientation: InputNumberOrientation;
  invalid: boolean | "true" | "false" | undefined;
  required: boolean | undefined;
  describedBy: string | undefined;
};

export const [injectInputNumberContext, provideInputNumberContext] =
  createContext<ComputedRef<InputNumberContext>>("InputNumber");

export const inputNumberVariants = cva(
  `
    grid w-full min-w-0 items-center transition-[color,background-color,border-color,box-shadow] duration-short-3
    ease-standard
  `,
  {
    variants: {
      variant: textControlFrameVariant,
      size: {
        xs: `h-(--control-height-xs) ${textControlRadius.xs}
          [--control-padding:var(--control-padding-xs)] [--stepper-size:--spacing(6)] [--stepper-inset:--spacing(0.5)]
          [--stepper-icon:--spacing(3.5)] [--stepper-chevron:--spacing(3)]
        `,
        sm: `h-(--control-height-sm) ${textControlRadius.sm}
          [--control-padding:var(--control-padding-sm)] [--stepper-size:--spacing(6)] [--stepper-inset:--spacing(1)]
          [--stepper-icon:--spacing(3.5)] [--stepper-chevron:--spacing(3)]
        `,
        md: `h-(--control-height-md) ${textControlRadius.md}
          [--control-padding:var(--control-padding-md)] [--stepper-size:--spacing(7)] [--stepper-inset:--spacing(1)]
          [--stepper-icon:--spacing(4)] [--stepper-chevron:--spacing(3.5)]
        `,
        lg: `h-(--control-height-lg) ${textControlRadius.lg}
          [--control-padding:var(--control-padding-lg)] [--stepper-size:--spacing(8)] [--stepper-inset:--spacing(1)]
          [--stepper-icon:--spacing(4)] [--stepper-chevron:--spacing(3.5)]
        `,
        xl: `h-(--control-height-xl) ${textControlRadius.xl}
          [--control-padding:var(--control-padding-xl)] [--stepper-size:--spacing(10)] [--stepper-inset:--spacing(1)]
          [--stepper-icon:--spacing(5)] [--stepper-chevron:--spacing(4)]
        `,
      },
      orientation: {
        horizontal: `
          grid-cols-[auto_minmax(0,1fr)_auto] [grid-template-areas:'decrement_input_increment']
          has-[>[data-slot=input-number-decrement]]:*:data-[slot=input-number-input]:ps-1.5
          has-[>[data-slot=input-number-increment]]:*:data-[slot=input-number-input]:pe-1.5
        `,
        vertical: `
          grid-cols-[minmax(0,1fr)_auto] grid-rows-2 [grid-template-areas:'input_increment'_'input_decrement']
          has-[>:is([data-slot=input-number-increment],[data-slot=input-number-decrement])]:*:data-[slot=input-number-input]:pe-1.5
        `,
      },
    },
    defaultVariants: { variant: "outline", size: "md", orientation: "horizontal" },
  },
);

export const inputNumberInputVariants = cva(
  `${textControlBase} h-full rounded-none px-(--control-padding) [grid-area:input] in-data-[orientation=horizontal]:text-center`,
  {
    variants: {
      size: { xs: "md:text-body-sm", sm: "", md: "", lg: "", xl: "md:text-body-lg" },
    },
    defaultVariants: { size: "md" },
  },
);

export const inputNumberButtonVariants = cva("p-0", {
  variants: {
    orientation: {
      horizontal: `
        size-(--stepper-size) rounded-[max(0px,calc(var(--control-radius)-var(--stepper-inset)))]
        icon-size-(--stepper-icon)
      `,
      vertical: "h-full w-(--stepper-size) rounded-none icon-size-(--stepper-chevron)",
    },
    part: {
      increment: "[grid-area:increment]",
      decrement: "[grid-area:decrement]",
    },
  },
  compoundVariants: [
    { orientation: "horizontal", part: "increment", class: "me-[calc(var(--stepper-inset)-1px)]" },
    { orientation: "horizontal", part: "decrement", class: "ms-[calc(var(--stepper-inset)-1px)]" },
    { orientation: "vertical", part: "increment", class: "rounded-se-[max(0px,calc(var(--control-radius)-1px))]" },
    {
      orientation: "vertical",
      part: "decrement",
      class: "rounded-ee-[max(0px,calc(var(--control-radius)-1px))] in-data-[variant=filled]:rounded-ee-none",
    },
  ],
  defaultVariants: { orientation: "horizontal" },
});

export type InputNumberVariants = VariantProps<typeof inputNumberVariants>;
