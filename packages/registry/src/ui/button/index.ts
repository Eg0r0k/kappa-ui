import { type VariantProps, cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

const touchTargetArea =
  "after:absolute after:top-1/2 after:left-1/2 after:h-[max(48px,100%)] after:w-[max(48px,100%)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

export const buttonVariants = cva(
  "relative cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors ease-smooth outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-neutral-300 dark:focus-visible:ring-offset-neutral-950",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90",
        outline:
          "border border-neutral-200 bg-white hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        ghost:
          "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        link: "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50",
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
