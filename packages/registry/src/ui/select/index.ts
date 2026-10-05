import { type VariantProps, cva } from "class-variance-authority";

import { textControlBase, textControlRadius, textControlSize, textControlVariant } from "@/ui/input";

export { default as Select } from "./Select.vue";
export { default as SelectContent } from "./SelectContent.vue";
export { default as SelectGroup } from "./SelectGroup.vue";
export { default as SelectItem } from "./SelectItem.vue";
export { default as SelectItemText } from "./SelectItemText.vue";
export { default as SelectLabel } from "./SelectLabel.vue";
export { default as SelectScrollDownButton } from "./SelectScrollDownButton.vue";
export { default as SelectScrollUpButton } from "./SelectScrollUpButton.vue";
export { default as SelectSeparator } from "./SelectSeparator.vue";
export { default as SelectTrigger } from "./SelectTrigger.vue";
export { default as SelectValue } from "./SelectValue.vue";

export const selectTriggerVariants = cva(
  `${textControlBase}
    group/select-trigger flex cursor-default items-center justify-between gap-2 text-start whitespace-nowrap
    data-placeholder:text-muted-foreground
    *:data-[slot=select-value]:truncate
    [&_svg]:pointer-events-none [&_svg]:shrink-0
    icon-size-4
  `,
  {
    variants: {
      variant: textControlVariant,
      size: {
        xs: `h-(--control-height-xs) ${textControlSize.xs} ${textControlRadius.xs}`,
        sm: `h-(--control-height-sm) ${textControlSize.sm} ${textControlRadius.sm}`,
        md: `h-(--control-height-md) ${textControlSize.md} ${textControlRadius.md}`,
        lg: `h-(--control-height-lg) ${textControlSize.lg} ${textControlRadius.lg}`,
        xl: `h-(--control-height-xl) ${textControlSize.xl} ${textControlRadius.xl}`,
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

export type SelectTriggerVariants = VariantProps<typeof selectTriggerVariants>;
