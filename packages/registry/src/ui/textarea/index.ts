import { type VariantProps, cva } from "class-variance-authority";

import { textControlBase, textControlRadius, textControlSize, textControlVariant } from "@/ui/input";

export { default as Textarea } from "./Textarea.vue";

export const textareaVariants = cva(`${textControlBase} block resize-y`, {
  variants: {
    variant: textControlVariant,
    size: {
      xs: `py-1.5 ${textControlSize.xs} ${textControlRadius.xs}`,
      sm: `py-1.5 ${textControlSize.sm} ${textControlRadius.sm}`,
      md: `py-2 ${textControlSize.md} ${textControlRadius.md}`,
      lg: `py-2.5 ${textControlSize.lg} ${textControlRadius.lg}`,
      xl: `py-3 ${textControlSize.xl} ${textControlRadius.xl}`,
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

export type TextareaVariants = VariantProps<typeof textareaVariants>;
