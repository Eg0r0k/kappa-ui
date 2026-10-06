import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { ComputedRef } from "vue";

import { choiceControl, choiceControlVariants } from "@/ui/choice-group";

export { default as Radio } from "./Radio.vue";
export { default as RadioGroup } from "./RadioGroup.vue";

export type RadioColor = "primary" | "neutral" | "destructive" | "success" | "warning" | "info";

/** A group's `color`, for the radios in it that don't set their own. */
export const [injectRadioGroupContext, provideRadioGroupContext] = createContext<{
  color: ComputedRef<RadioColor | (string & {})>;
}>("RadioGroup");

export const radioVariants = cva(
  `${choiceControl}
    group/radio rounded-full transition-[border-color] duration-short-1 ease-linear
    disabled:border-foreground/(--disabled-opacity)
    disabled:data-[state=checked]:border-foreground/(--disabled-opacity)
  `,
  {
    variants: choiceControlVariants,
    defaultVariants: {
      size: "md",
      touchTarget: "none",
    },
  },
);

export type RadioVariants = VariantProps<typeof radioVariants>;
