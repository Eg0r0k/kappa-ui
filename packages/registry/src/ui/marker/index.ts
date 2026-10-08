import { type VariantProps, cva } from "class-variance-authority";

export { default as Marker } from "./Marker.vue";
export { default as MarkerContent } from "./MarkerContent.vue";
export { default as MarkerIcon } from "./MarkerIcon.vue";

export type MarkerColor = "primary" | "neutral" | "destructive" | "success" | "warning" | "info";

export const markerVariants = cva(
  `
    group/marker relative flex min-h-4 w-full items-center gap-2 text-start text-body-md text-muted-foreground
    icon-size-4 [--marker-hover:--theme(--color-foreground)]
    data-color:text-tone-text data-color:[--marker-hover:var(--tone-text)]
    [a&]:underline [a&]:underline-offset-3
    [a&]:hover:text-(--marker-hover)
  `,
  {
    variants: {
      variant: {
        default: "",
        border: "border-b border-border pb-2 data-color:border-tone-border-subtle",
        separator: `
          before:h-px before:min-w-0 before:flex-1 before:bg-border before:me-1
          after:h-px after:min-w-0 after:flex-1 after:bg-border after:ms-1
          data-color:before:bg-tone-border-subtle
          data-color:after:bg-tone-border-subtle
        `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type MarkerVariants = VariantProps<typeof markerVariants>;
