import { type VariantProps, cva } from "class-variance-authority";

export { default as Alert } from "./Alert.vue";
export { default as AlertActions } from "./AlertActions.vue";
export { default as AlertDescription } from "./AlertDescription.vue";
export { default as AlertTitle } from "./AlertTitle.vue";

export type AlertColor = "primary" | "neutral" | "destructive" | "success" | "warning" | "info";

export const alertVariants = cva(
  "group/alert relative grid w-full grid-cols-[auto_1fr] items-start data-[orientation=horizontal]:grid-cols-[auto_1fr_auto] data-[orientation=horizontal]:grid-rows-[1fr_auto_auto_1fr] [&>svg]:pointer-events-none [&>svg]:col-start-1 [&>svg]:row-start-1 [&>svg]:me-(--alert-gap) [&>svg]:h-(--alert-line) [&>svg]:w-(--alert-icon) [&>svg]:shrink-0 data-[orientation=horizontal]:[&>svg]:row-span-full data-[orientation=horizontal]:[&>svg]:h-(--alert-icon) data-[orientation=horizontal]:[&>svg]:self-center",
  {
    variants: {
      variant: {
        solid: "bg-(--c) text-(--c-fg)",
        soft: "bg-(--c-soft) text-(--c-soft-fg)",
        subtle: "bg-(--c-soft) text-(--c-soft-fg) inset-ring inset-ring-(--c-subtle-edge)",
        outline: "bg-background text-(--c-text) inset-ring inset-ring-(--c-edge)",
        ghost: "text-(--c-text)",
        link: "text-(--c-text) underline-offset-4 hover:underline",
      },
      size: {
        xs: "rounded-md p-2.5 [--alert-gap:--spacing(2)] [--alert-icon:--spacing(3.5)] [--alert-line:var(--typescale-label-md-line-height)]",
        sm: "rounded-md p-3 [--alert-gap:--spacing(2)] [--alert-icon:--spacing(4)] [--alert-line:var(--typescale-title-sm-line-height)]",
        md: "rounded-lg p-4 [--alert-gap:--spacing(2.5)] [--alert-icon:--spacing(5)] [--alert-line:var(--typescale-title-sm-line-height)]",
        lg: "rounded-lg p-5 [--alert-gap:--spacing(3)] [--alert-icon:--spacing(5)] [--alert-line:var(--typescale-title-md-line-height)]",
        xl: "rounded-xl p-6 [--alert-gap:--spacing(3.5)] [--alert-icon:--spacing(6)] [--alert-line:var(--typescale-title-lg-line-height)]",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

export type AlertVariants = VariantProps<typeof alertVariants>;
