import { type VariantProps, cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

const touchTargetArea =
  "after:absolute after:top-1/2 after:left-1/2 after:h-[max(3rem,100%)] after:w-[max(3rem,100%)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

const colors = {
  primary: {
    solid: "bg-primary text-primary-foreground",
    soft: "bg-primary/12 text-primary",
    subtle: "bg-primary/12 border-primary/25 text-primary",
    outline: "border-primary text-primary",
    ghost: "text-primary",
    link: "text-primary",
  },
  neutral: {
    solid: "bg-foreground text-background",
    soft: "bg-secondary text-secondary-foreground",
    subtle: "bg-secondary border-input text-secondary-foreground",
    outline: "border-input text-foreground",
    ghost: "text-foreground",
    link: "text-foreground",
  },
  destructive: {
    solid: "bg-destructive text-destructive-foreground",
    soft: "bg-destructive/12 text-destructive",
    subtle: "bg-destructive/12 border-destructive/25 text-destructive",
    outline: "border-destructive text-destructive",
    ghost: "text-destructive",
    link: "text-destructive",
  },
  success: {
    solid: "bg-success text-success-foreground",
    soft: "bg-success/12 text-success-text",
    subtle: "bg-success/12 border-success-text/25 text-success-text",
    outline: "border-success-text text-success-text",
    ghost: "text-success-text",
    link: "text-success-text",
  },
  warning: {
    solid: "bg-warning text-warning-foreground",
    soft: "bg-warning/12 text-warning-text",
    subtle: "bg-warning/12 border-warning-text/25 text-warning-text",
    outline: "border-warning-text text-warning-text",
    ghost: "text-warning-text",
    link: "text-warning-text",
  },
} as const;

const colorVariants = Object.entries(colors).flatMap(([color, variants]) =>
  Object.entries(variants).map(([variant, className]) => ({
    color: color as keyof typeof colors,
    variant: variant as keyof (typeof colors)[keyof typeof colors],
    class: className,
  })),
);

export const buttonVariants = cva(
  "relative cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-label-lg transition-colors duration-short-3 ease-standard outline-none disabled:pointer-events-none disabled:text-foreground/(--disabled-opacity) [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        solid: "state-layer disabled:bg-foreground/(--disabled-container-opacity)",
        soft: "state-layer disabled:bg-foreground/(--disabled-container-opacity)",
        subtle:
          "state-layer border disabled:bg-foreground/(--disabled-container-opacity) disabled:border-foreground/(--disabled-container-opacity)",
        outline: "state-layer border bg-background disabled:border-foreground/(--disabled-container-opacity)",
        ghost: "state-layer",
        link: "underline-offset-4 hover:underline",
      },
      color: {
        primary: "",
        neutral: "",
        destructive: "",
        success: "",
        warning: "",
      },
      size: {
        xs: "h-7 gap-1 rounded-md px-2.5 text-label-sm has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-3 text-label-md has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
        default: "h-9 px-4 py-2 has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
        lg: "h-10 px-6 has-data-[icon=inline-start]:pl-4 has-data-[icon=inline-end]:pr-4",
        xl: "h-12 rounded-xl px-8 text-title-md has-data-[icon=inline-start]:pl-6 has-data-[icon=inline-end]:pr-6",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        icon: "size-9",
        "icon-lg": "size-10",
        "icon-xl": "size-12 rounded-xl",
      },
      focusRing: {
        outward: "focus-visible:focus-ring",
        inward: "focus-visible:focus-ring-inset",
      },

      touchTarget: {
        none: "",
        expand: touchTargetArea,
        wrapper: touchTargetArea,
      },
    },
    compoundVariants: [
      ...colorVariants,
      { size: "xs", touchTarget: "wrapper", class: "my-2.5" },
      { size: "sm", touchTarget: "wrapper", class: "my-2" },
      { size: "default", touchTarget: "wrapper", class: "my-1.5" },
      { size: "lg", touchTarget: "wrapper", class: "my-1" },
      { size: "icon-xs", touchTarget: "wrapper", class: "mx-2.5 my-2.5" },
      { size: "icon-sm", touchTarget: "wrapper", class: "mx-2 my-2" },
      { size: "icon", touchTarget: "wrapper", class: "mx-1.5 my-1.5" },
      { size: "icon-lg", touchTarget: "wrapper", class: "mx-1 my-1" },
    ],
    defaultVariants: {
      variant: "solid",
      color: "primary",
      size: "default",
      touchTarget: "none",
      focusRing: "outward",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
