import { type VariantProps, cva } from "class-variance-authority";

export { default as ButtonGroup } from "./ButtonGroup.vue";
export { default as ButtonGroupSeparator } from "./ButtonGroupSeparator.vue";
export { default as ButtonGroupText } from "./ButtonGroupText.vue";

export const buttonGroupVariants = cva(
  "isolate flex w-fit items-stretch [--button-group-radius:0px] *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-s-(--button-group-radius) [&>*:not(:first-child)]:border-s-0 [&>*:not(:last-child)]:rounded-e-(--button-group-radius)",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-(--button-group-radius) [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-(--button-group-radius)",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

export type ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>;
