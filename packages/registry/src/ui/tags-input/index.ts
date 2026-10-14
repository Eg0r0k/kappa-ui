import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { ComputedRef } from "vue";

import {
  type TextControlSize,
  type TextControlVariant,
  textControlBase,
  textControlFrameVariant,
  textControlInnerText,
  textControlRadius,
  textControlText,
} from "@/lib/text-control";
import type { BadgeVariants } from "@/ui/badge";

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
        xs: `min-h-(--control-height-xs) gap-1 ${textControlRadius.xs}
          [--control-padding:var(--control-padding-xs)] [--tags-inset:--spacing(1)] [--tags-input-line:--spacing(5)]
          [--tags-input-delete:--spacing(4)]
          ${textControlText.xs}`,
        sm: `min-h-(--control-height-sm) gap-1 ${textControlRadius.sm}
          [--control-padding:var(--control-padding-sm)] [--tags-inset:--spacing(1)] [--tags-input-line:--spacing(6)]
          [--tags-input-delete:--spacing(4)]
          ${textControlText.sm}`,
        md: `min-h-(--control-height-md) gap-1.5 ${textControlRadius.md}
          [--control-padding:var(--control-padding-md)] [--tags-inset:--spacing(1.5)] [--tags-input-line:--spacing(6)]
          [--tags-input-delete:--spacing(4)]
          ${textControlText.md}`,
        lg: `min-h-(--control-height-lg) gap-1.5 ${textControlRadius.lg}
          [--control-padding:var(--control-padding-lg)] [--tags-inset:--spacing(1.5)] [--tags-input-line:--spacing(7)]
          [--tags-input-delete:--spacing(5)]
          ${textControlText.lg}`,
        xl: `min-h-(--control-height-xl) gap-1.5 ${textControlRadius.xl}
          [--control-padding:var(--control-padding-xl)] [--tags-inset:--spacing(2)] [--tags-input-line:--spacing(8)]
          [--tags-input-delete:--spacing(5)]
          ${textControlText.xl}`,
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
  max-w-full cursor-default rounded-inset-(--frame-radius)/(--tags-inset)
  data-[state=active]:focus-ring
  data-disabled:opacity-(--disabled-opacity)
`;

export const tagsInputItemDelete = `
  state-layer relative inline-flex size-(--tags-input-delete) shrink-0 cursor-pointer items-center justify-center
  rounded-full outline-none
  focus-visible:focus-ring
  data-disabled:pointer-events-none
  [&_svg]:pointer-events-none
`;

export const tagsInputInput = `${textControlBase} ${textControlInnerText} h-(--tags-input-line) w-auto min-w-24 flex-1 rounded-none px-[calc(var(--control-padding)-var(--tags-inset)+1px)]`;

export type TagsInputVariants = VariantProps<typeof tagsInputVariants>;
