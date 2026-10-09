import { type VariantProps, cva } from "class-variance-authority";

export { default as Toolbar } from "./Toolbar.vue";
export { default as ToolbarButton } from "./ToolbarButton.vue";
export { default as ToolbarLink } from "./ToolbarLink.vue";
export { default as ToolbarSeparator } from "./ToolbarSeparator.vue";
export { default as ToolbarToggleGroup } from "./ToolbarToggleGroup.vue";
export { default as ToolbarToggleItem } from "./ToolbarToggleItem.vue";

export const toolbarVariants = cva(
  "flex w-fit items-center gap-1 aria-[orientation=vertical]:flex-col aria-[orientation=vertical]:items-stretch",
  {
    variants: {
      variant: {
        outline: "rounded-outset-control-sm/[calc(var(--spacing)+1px)] border border-border bg-background p-1",
        ghost: "",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

export type ToolbarVariants = VariantProps<typeof toolbarVariants>;
