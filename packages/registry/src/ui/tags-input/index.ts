import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { ComputedRef } from "vue";

import type { BadgeVariants } from "@/ui/badge";
import {
  type TextControlSize,
  type TextControlVariant,
  textControlBase,
  textControlFrameVariant,
  textControlRadius,
} from "@/ui/input";

export { default as TagsInput } from "./TagsInput.vue";
export { default as TagsInputInput } from "./TagsInputInput.vue";
export { default as TagsInputItem } from "./TagsInputItem.vue";
export { default as TagsInputItemDelete } from "./TagsInputItemDelete.vue";
export { default as TagsInputItemText } from "./TagsInputItemText.vue";

export type TagsInputContext = {
  variant: TextControlVariant;
  size: TextControlSize;
  invalid: boolean | "true" | "false" | undefined;
  required: boolean | undefined;
  describedBy: string | undefined;
};

export const [injectTagsInputContext, provideTagsInputContext] =
  createContext<ComputedRef<TagsInputContext>>("TagsInput");

export const tagsInputVariants = cva(
  `
    flex w-full min-w-0 flex-wrap items-center p-[calc(var(--tags-inset)-1px)]
    transition-[color,background-color,border-color,box-shadow] duration-short-3 ease-standard
  `,
  {
    variants: {
      variant: textControlFrameVariant,
      size: {
        xs: `min-h-7 gap-1 ${textControlRadius.xs} [--control-padding:--spacing(2)] [--tags-inset:--spacing(1)]`,
        sm: `min-h-8 gap-1 ${textControlRadius.sm} [--control-padding:--spacing(2.5)] [--tags-inset:--spacing(1)]`,
        md: `min-h-9 gap-1.5 ${textControlRadius.md} [--control-padding:--spacing(3)] [--tags-inset:--spacing(1.5)]`,
        lg: `min-h-10 gap-1.5 ${textControlRadius.lg} [--control-padding:--spacing(3)] [--tags-inset:--spacing(1.5)]`,
        xl: `min-h-12 gap-1.5 ${textControlRadius.xl} [--control-padding:--spacing(4)] [--tags-inset:--spacing(2)]`,
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export const tagsInputBadgeSize: Record<TextControlSize, NonNullable<BadgeVariants["size"]>> = {
  xs: "sm",
  sm: "md",
  md: "md",
  lg: "lg",
  xl: "xl",
};

export const tagsInputItemClass = `
  max-w-full cursor-default rounded-[max(0px,calc(var(--control-radius)-var(--tags-inset)))]
  data-[state=active]:focus-ring
  data-disabled:opacity-(--disabled-opacity)
`;

export const tagsInputItemDeleteVariants = cva(
  `
    state-layer relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none
    focus-visible:focus-ring
    data-disabled:pointer-events-none
    [&_svg]:pointer-events-none
  `,
  {
    variants: {
      size: { xs: "size-4", sm: "size-4", md: "size-4", lg: "size-5", xl: "size-5" },
    },
    defaultVariants: { size: "md" },
  },
);

export const tagsInputInputVariants = cva(
  `${textControlBase} w-auto min-w-24 flex-1 rounded-none px-[calc(var(--control-padding)-var(--tags-inset)+1px)]`,
  {
    variants: {
      size: {
        xs: "h-5 md:text-body-sm",
        sm: "h-6",
        md: "h-6",
        lg: "h-7",
        xl: "h-8 md:text-body-lg",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type TagsInputVariants = VariantProps<typeof tagsInputVariants>;
