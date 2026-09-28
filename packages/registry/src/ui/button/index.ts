import { type VariantProps, cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export type ButtonColor = "primary" | "neutral" | "destructive" | "success" | "warning";

export const buttonVariants = cva(
  "relative cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-label-lg transition-colors duration-short-3 ease-standard outline-none forced-colors:border disabled:pointer-events-none disabled:text-foreground/(--disabled-opacity) [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        solid: "state-layer bg-(--c) text-(--c-fg) disabled:bg-foreground/(--disabled-container-opacity)",
        soft: "state-layer bg-(--c-soft) text-(--c-soft-fg) disabled:bg-foreground/(--disabled-container-opacity)",
        subtle:
          "state-layer bg-(--c-soft) text-(--c-soft-fg) inset-ring inset-ring-(--c-subtle-edge) disabled:bg-foreground/(--disabled-container-opacity) disabled:inset-ring-foreground/(--disabled-container-opacity)",
        outline:
          "state-layer bg-background text-(--c-text) inset-ring inset-ring-(--c-edge) disabled:inset-ring-foreground/(--disabled-container-opacity)",
        ghost: "state-layer text-(--c-text)",
        link: "text-(--c-text) underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 gap-1 rounded-md px-2.5 text-label-sm [--touch-h:1.75rem] has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-3 text-label-md [--touch-h:2rem] has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
        default: "h-9 px-4 py-2 [--touch-h:2.25rem] has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
        lg: "h-10 px-6 [--touch-h:2.5rem] has-data-[icon=inline-start]:pl-4 has-data-[icon=inline-end]:pr-4",
        xl: "h-12 rounded-xl px-8 text-title-md [--touch-h:3rem] has-data-[icon=inline-start]:pl-6 has-data-[icon=inline-end]:pr-6",
        "icon-xs": "size-7 rounded-md [--touch-w:1.75rem] [--touch-h:1.75rem] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 [--touch-w:2rem] [--touch-h:2rem]",
        icon: "size-9 [--touch-w:2.25rem] [--touch-h:2.25rem]",
        "icon-lg": "size-10 [--touch-w:2.5rem] [--touch-h:2.5rem]",
        "icon-xl": "size-12 rounded-xl [--touch-w:3rem] [--touch-h:3rem]",
      },
      focusRing: {
        outward: "focus-visible:focus-ring",
        inward: "focus-visible:focus-ring-inset",
      },
      touchTarget: {
        none: "",
        expand: "touch-target",
        wrapper: "touch-target-wrapper",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
      touchTarget: "none",
      focusRing: "outward",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
