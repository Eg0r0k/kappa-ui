import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { ComputedRef } from "vue";

import {
  type TextControlSize,
  type TextControlVariant,
  textControlBase,
  textControlRadius,
  textControlVariant,
} from "@/ui/input";

export { default as PinInput } from "./PinInput.vue";
export { default as PinInputGroup } from "./PinInputGroup.vue";
export { default as PinInputSeparator } from "./PinInputSeparator.vue";
export { default as PinInputSlot } from "./PinInputSlot.vue";

export type PinInputStyle = {
  variant: TextControlVariant;
  size: TextControlSize;
  invalid: boolean | "true" | "false" | undefined;
};

export const [injectPinInputStyle, providePinInputStyle] = createContext<ComputedRef<PinInputStyle>>("PinInput");

export const pinInputVariants = cva("group/pin-input flex items-center data-disabled:cursor-not-allowed", {
  variants: {
    size: {
      xs: "gap-1.5",
      sm: "gap-1.5",
      md: "gap-2",
      lg: "gap-2",
      xl: "gap-2.5",
    },
  },
  defaultVariants: { size: "md" },
});

export const pinInputSlotVariants = cva(`${textControlBase} shrink-0 p-0 text-center`, {
  variants: {
    variant: textControlVariant,
    size: {
      xs: `size-7 ${textControlRadius.xs} md:text-body-sm`,
      sm: `size-8 ${textControlRadius.sm}`,
      md: `size-9 ${textControlRadius.md}`,
      lg: `size-10 ${textControlRadius.lg}`,
      xl: `size-12 ${textControlRadius.xl} md:text-body-lg`,
    },
  },
  defaultVariants: { variant: "outline", size: "md" },
});

export type PinInputVariants = VariantProps<typeof pinInputVariants>;
