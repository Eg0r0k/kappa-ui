import { type VariantProps, cva } from "class-variance-authority";

import { choiceControl, choiceControlVariants } from "@/lib/choice-group";

export { default as Radio } from "./Radio.vue";
export { default as RadioGroup } from "./RadioGroup.vue";

export const radioVariants = cva(
  `${choiceControl} group/radio rounded-full transition-[border-color] duration-short-1 ease-linear data-[state=checked]:border-primary aria-invalid:border-destructive aria-invalid:data-[state=checked]:border-destructive in-aria-invalid:border-destructive in-aria-invalid:data-[state=checked]:border-destructive disabled:border-foreground/(--disabled-opacity) disabled:data-[state=checked]:border-foreground/(--disabled-opacity)`,
  {
    variants: choiceControlVariants,
    defaultVariants: {
      size: "md",
      touchTarget: "none",
    },
  },
);

export type RadioVariants = VariantProps<typeof radioVariants>;
