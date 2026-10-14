import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { ComputedRef } from "vue";

import {
  type TextControlVariant,
  textControlBase,
  textControlInnerText,
  textControlRadius,
  textControlText,
  textControlVariant,
} from "@/lib/text-control";

export { default as PinInput } from "./PinInput.vue";
export { default as PinInputGroup } from "./PinInputGroup.vue";
export { default as PinInputSeparator } from "./PinInputSeparator.vue";
export { default as PinInputSlot } from "./PinInputSlot.vue";

export type PinInputStyle = {
  variant: TextControlVariant;
  invalid: boolean | "true" | "false" | undefined;
};

export const [injectPinInputStyle, providePinInputStyle] = createContext<ComputedRef<PinInputStyle>>("PinInput");

export const pinInputVariants = cva("group/pin-input flex items-center data-disabled:cursor-not-allowed", {
  variants: {
    size: {
      xs: `gap-(--control-gap-xs) [--pin-input-slot:var(--control-height-xs)] ${textControlRadius.xs} ${textControlText.xs}`,
      sm: `gap-(--control-gap-sm) [--pin-input-slot:var(--control-height-sm)] ${textControlRadius.sm} ${textControlText.sm}`,
      md: `gap-(--control-gap-md) [--pin-input-slot:var(--control-height-md)] ${textControlRadius.md} ${textControlText.md}`,
      lg: `gap-(--control-gap-lg) [--pin-input-slot:var(--control-height-lg)] ${textControlRadius.lg} ${textControlText.lg}`,
      xl: `gap-(--control-gap-xl) [--pin-input-slot:var(--control-height-xl)] ${textControlRadius.xl} ${textControlText.xl}`,
    },
  },
  defaultVariants: { size: "md" },
});

export const pinInputSlotVariants = cva(
  `${textControlBase} ${textControlInnerText} size-(--pin-input-slot) shrink-0 p-0 text-center`,
  {
    variants: {
      variant: textControlVariant,
    },
    defaultVariants: { variant: "outline" },
  },
);

export type PinInputVariants = VariantProps<typeof pinInputVariants>;
