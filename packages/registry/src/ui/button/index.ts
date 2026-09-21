import { type VariantProps, cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

const touchTargetArea =
  "after:absolute after:top-1/2 after:left-1/2 after:h-[max(48px,100%)] after:w-[max(48px,100%)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

export const buttonVariants = cva(
  "relative cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors ease-smooth outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // No dark: utilities anywhere below. The semantic tokens change value
      // under .dark, so every variant follows the theme on its own.
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-9 px-4 py-2",
        lg: "h-10 px-6",
        icon: "size-9",
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
      { size: "icon", touchTarget: "wrapper", class: "mx-1.5 my-1.5" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      touchTarget: "none",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
