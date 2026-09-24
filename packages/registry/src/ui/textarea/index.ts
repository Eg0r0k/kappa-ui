import { type VariantProps, cva } from "class-variance-authority";

import { textControlBase, textControlSize, textControlVariant } from "@/lib/text-control";

export { default as Textarea } from "./Textarea.vue";

export const textareaVariants = cva(`${textControlBase} block resize-y`, {
  variants: {
    variant: textControlVariant,
    size: {
      xs: `py-1.5 ${textControlSize.xs}`,
      sm: `py-1.5 ${textControlSize.sm}`,
      md: `py-2 ${textControlSize.md}`,
      lg: `py-2.5 ${textControlSize.lg}`,
      xl: `py-3 ${textControlSize.xl}`,
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

export type TextareaVariants = VariantProps<typeof textareaVariants>;
