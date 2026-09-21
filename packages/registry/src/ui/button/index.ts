import { type VariantProps, cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

const touchTargetArea =
  "after:absolute after:top-1/2 after:left-1/2 after:h-[max(48px,100%)] after:w-[max(48px,100%)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

export const buttonVariants = cva(
  "relative cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors ease-smooth outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 gap-1.5 px-3 text-xs has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
        default:
          "h-9 px-4 py-2 has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
        lg: "h-10 px-6 has-data-[icon=inline-start]:pl-4 has-data-[icon=inline-end]:pr-4",
        xl: "h-12 px-8 text-base has-data-[icon=inline-start]:pl-6 has-data-[icon=inline-end]:pr-6",
        "icon-sm": "size-8",
        icon: "size-9",
        "icon-lg": "size-10",
        "icon-xl": "size-12",
      },
      focusRing: {
        outward: "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        inward:
          "focus-visible:inset-ring-[3px] focus-visible:inset-ring-ring/50",
      },

      touchTarget: {
        none: "",
        expand: touchTargetArea,
        wrapper: touchTargetArea,
      },
    },
    compoundVariants: [
      { size: "sm", touchTarget: "wrapper", class: "my-2" },
      { size: "default", touchTarget: "wrapper", class: "my-1.5" },
      { size: "lg", touchTarget: "wrapper", class: "my-1" },
      { size: "icon-sm", touchTarget: "wrapper", class: "mx-2 my-2" },
      { size: "icon", touchTarget: "wrapper", class: "mx-1.5 my-1.5" },
      { size: "icon-lg", touchTarget: "wrapper", class: "mx-1 my-1" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      touchTarget: "none",
      focusRing: "outward",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
