import { type VariantProps, cva } from "class-variance-authority";

import { choiceControl, choiceControlVariants } from "@/ui/choice-group";

export { default as Checkbox } from "./Checkbox.vue";
export { default as CheckboxGroup } from "./CheckboxGroup.vue";

export const checkboxVariants = cva(
  `${choiceControl}
    group/checkbox rounded-xs text-tone-foreground transition-[background-color,border-color] duration-short-3
    ease-standard
    data-[state=checked]:bg-tone
    data-[state=indeterminate]:border-tone data-[state=indeterminate]:bg-tone
    data-[state=indeterminate]:[--halo-color:var(--tone)]
    disabled:border-foreground/(--disabled-opacity) disabled:text-background
    disabled:data-[state=checked]:border-transparent disabled:data-[state=checked]:bg-foreground/(--disabled-opacity)
    disabled:data-[state=indeterminate]:border-transparent
    disabled:data-[state=indeterminate]:bg-foreground/(--disabled-opacity)
  `,
  {
    variants: choiceControlVariants,
    defaultVariants: {
      size: "md",
      touchTarget: "none",
    },
  },
);

export type CheckboxVariants = VariantProps<typeof checkboxVariants>;
