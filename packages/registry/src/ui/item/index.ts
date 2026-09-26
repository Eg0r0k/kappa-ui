import { createContext } from "@delta-ui/core/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type { ComputedRef } from "vue";

export { default as Item } from "./Item.vue";
export { default as ItemActions } from "./ItemActions.vue";
export { default as ItemContent } from "./ItemContent.vue";
export { default as ItemDescription } from "./ItemDescription.vue";
export { default as ItemFooter } from "./ItemFooter.vue";
export { default as ItemGroup } from "./ItemGroup.vue";
export { default as ItemHeader } from "./ItemHeader.vue";
export { default as ItemMedia } from "./ItemMedia.vue";
export { default as ItemSeparator } from "./ItemSeparator.vue";
export { default as ItemTitle } from "./ItemTitle.vue";

export const [injectItemGroupContext, provideItemGroupContext] = createContext<{ list: ComputedRef<boolean> }>(
  "ItemGroup",
);

export const itemVariants = cva(
  "group/item relative flex flex-wrap items-center border border-transparent outline-none transition-colors duration-short-4 ease-standard focus-visible:focus-ring [a&]:cursor-pointer [a&]:state-layer [button&]:cursor-pointer [button&]:state-layer [button&]:text-start",
  {
    variants: {
      variant: {
        outline: "border-border",
        soft: "bg-muted",
        filled: "border-b-border bg-muted",
        ghost: "",
        subtle: "border-border bg-muted",
      },
      size: {
        xs: "gap-2 rounded-md px-3 py-2",
        sm: "gap-2.5 rounded-md px-4 py-3",
        md: "gap-4 rounded-lg p-4",
        lg: "gap-4 rounded-lg p-5",
        xl: "gap-5 rounded-xl p-6",
      },
    },
    compoundVariants: [{ variant: "filled", class: "rounded-b-none" }],
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

export const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "",
        icon: "size-8 rounded-md border border-border bg-muted group-data-[size=xs]/item:size-6 group-data-[size=sm]/item:size-7 group-data-[size=lg]/item:size-9 group-data-[size=xl]/item:size-10 [&_svg:not([class*=size-])]:size-4 group-data-[size=xs]/item:[&_svg:not([class*=size-])]:size-3.5 group-data-[size=lg]/item:[&_svg:not([class*=size-])]:size-5 group-data-[size=xl]/item:[&_svg:not([class*=size-])]:size-5",
        image:
          "size-10 overflow-hidden rounded-md group-data-[size=xs]/item:size-8 group-data-[size=sm]/item:size-9 group-data-[size=lg]/item:size-12 group-data-[size=xl]/item:size-14 [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type ItemVariants = VariantProps<typeof itemVariants>;
export type ItemMediaVariants = VariantProps<typeof itemMediaVariants>;
