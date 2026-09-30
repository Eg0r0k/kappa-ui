import { type VariantProps, cva } from "class-variance-authority";

export { default as Empty } from "./Empty.vue";
export { default as EmptyContent } from "./EmptyContent.vue";
export { default as EmptyDescription } from "./EmptyDescription.vue";
export { default as EmptyHeader } from "./EmptyHeader.vue";
export { default as EmptyMedia } from "./EmptyMedia.vue";
export { default as EmptyTitle } from "./EmptyTitle.vue";

export const emptyVariants = cva(
  "group/empty flex min-w-0 flex-1 flex-col items-center justify-center text-center text-balance",
  {
    variants: {
      size: {
        xs: "gap-3 p-4",
        sm: "gap-4 p-6",
        md: "gap-6 p-8",
        lg: "gap-8 p-10",
        xl: "gap-10 p-12",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type EmptyVariants = VariantProps<typeof emptyVariants>;
