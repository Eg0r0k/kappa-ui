import { type VariantProps, cva } from "class-variance-authority";

import { choiceControl, choiceControlVariants } from "@/lib/choice-group";

export { default as Checkbox } from "./Checkbox.vue";
export { default as CheckboxGroup } from "./CheckboxGroup.vue";

export const checkboxVariants = cva(
  `${choiceControl} group/checkbox rounded-sm text-primary-foreground transition-[background-color,border-color] duration-short-3 ease-standard data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:before:bg-primary aria-invalid:border-destructive aria-invalid:text-destructive-foreground aria-invalid:data-[state=checked]:border-destructive aria-invalid:data-[state=checked]:bg-destructive aria-invalid:data-[state=indeterminate]:border-destructive aria-invalid:data-[state=indeterminate]:bg-destructive in-aria-invalid:border-destructive in-aria-invalid:text-destructive-foreground in-aria-invalid:data-[state=checked]:border-destructive in-aria-invalid:data-[state=checked]:bg-destructive in-aria-invalid:data-[state=indeterminate]:border-destructive in-aria-invalid:data-[state=indeterminate]:bg-destructive disabled:border-foreground/(--disabled-opacity) disabled:text-background disabled:data-[state=checked]:border-transparent disabled:data-[state=checked]:bg-foreground/(--disabled-opacity) disabled:data-[state=indeterminate]:border-transparent disabled:data-[state=indeterminate]:bg-foreground/(--disabled-opacity)`,
  {
    variants: choiceControlVariants,
    defaultVariants: {
      size: "md",
      touchTarget: "none",
    },
  },
);

export type CheckboxVariants = VariantProps<typeof checkboxVariants>;
