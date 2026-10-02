import { type VariantProps, cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export type ButtonColor = "primary" | "neutral" | "destructive" | "success" | "warning" | "info";

export const buttonVariants = cva(
  "relative cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-label-lg transition-colors duration-short-3 ease-standard outline-none forced-colors:border disabled:pointer-events-none disabled:text-foreground/(--disabled-opacity) [&_svg]:pointer-events-none [&_svg]:shrink-0 icon-size-4 aria-disabled:cursor-default aria-disabled:text-foreground/(--disabled-opacity)",
  {
    variants: {
      variant: {
        solid:
          "state-layer bg-tone text-tone-foreground disabled:bg-foreground/(--disabled-container-opacity) aria-disabled:bg-foreground/(--disabled-container-opacity)",
        soft: "state-layer bg-tone-soft text-tone-soft-foreground disabled:bg-foreground/(--disabled-container-opacity) aria-disabled:bg-foreground/(--disabled-container-opacity)",
        subtle:
          "state-layer bg-tone-soft text-tone-soft-foreground inset-ring inset-ring-tone-border-subtle disabled:bg-foreground/(--disabled-container-opacity) disabled:inset-ring-foreground/(--disabled-container-opacity) aria-disabled:bg-foreground/(--disabled-container-opacity) aria-disabled:inset-ring-foreground/(--disabled-container-opacity)",
        outline:
          "state-layer text-tone-text inset-ring inset-ring-tone-border disabled:inset-ring-foreground/(--disabled-container-opacity) aria-disabled:inset-ring-foreground/(--disabled-container-opacity)",
        ghost: "state-layer text-tone-text",
        link: "text-tone-text underline-offset-4 hover:underline aria-disabled:hover:no-underline",
      },
      size: {
        xs: "h-7 gap-1 rounded-md px-2.5 text-label-sm [--touch-h:1.75rem] has-data-[icon=inline-start]:ps-2 has-data-[icon=inline-end]:pe-2 icon-size-3.5",
        sm: "h-8 gap-1.5 px-3 text-label-md [--touch-h:2rem] has-data-[icon=inline-start]:ps-2.5 has-data-[icon=inline-end]:pe-2.5",
        default: "h-9 px-4 py-2 [--touch-h:2.25rem] has-data-[icon=inline-start]:ps-3 has-data-[icon=inline-end]:pe-3",
        lg: "h-10 px-6 [--touch-h:2.5rem] has-data-[icon=inline-start]:ps-4 has-data-[icon=inline-end]:pe-4",
        xl: "h-12 rounded-xl px-8 text-title-md [--touch-h:3rem] has-data-[icon=inline-start]:ps-6 has-data-[icon=inline-end]:pe-6",
        "icon-xs": "size-7 rounded-md [--touch-w:1.75rem] [--touch-h:1.75rem] icon-size-3.5",
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
