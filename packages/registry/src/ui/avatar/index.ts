import { type VariantProps, cva } from "class-variance-authority";

export { default as Avatar } from "./Avatar.vue";
export { default as AvatarFallback } from "./AvatarFallback.vue";
export { default as AvatarGroup } from "./AvatarGroup.vue";
export { default as AvatarGroupCount } from "./AvatarGroupCount.vue";
export { default as AvatarImage } from "./AvatarImage.vue";

export const avatarVariants = cva(
  "relative flex size-(--avatar-size) shrink-0 items-center justify-center overflow-hidden rounded-full select-none",
  {
    variants: {
      size: {
        xs: "text-label-sm [--avatar-size:--spacing(6)] [&_svg:not([class*='size-'])]:size-3",
        sm: "text-label-md [--avatar-size:--spacing(8)] [&_svg:not([class*='size-'])]:size-4",
        md: "text-label-lg [--avatar-size:--spacing(10)] [&_svg:not([class*='size-'])]:size-5",
        lg: "text-title-md [--avatar-size:--spacing(12)] [&_svg:not([class*='size-'])]:size-6",
        xl: "text-title-lg [--avatar-size:--spacing(16)] [&_svg:not([class*='size-'])]:size-8",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type AvatarVariants = VariantProps<typeof avatarVariants>;
export type AvatarSize = NonNullable<AvatarVariants["size"]>;
