import { type VariantProps, cva } from "class-variance-authority";

export { default as Badge } from "./Badge.vue";

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

export const badgeVariants = cva(
  "relative inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap outline-none transition-colors duration-short-3 ease-standard focus-visible:focus-ring [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        solid: "",
        soft: "",
        subtle: "border",
        outline: "border",
        ghost: "",
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
        xs: "h-4 gap-0.5 rounded-sm text-label-sm [&_svg:not([class*='size-'])]:size-3",
        sm: "h-5 gap-1 rounded-sm text-label-sm [&_svg:not([class*='size-'])]:size-3",
        md: "h-6 gap-1 rounded-md text-label-md [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-7 gap-1.5 rounded-md text-label-lg [&_svg:not([class*='size-'])]:size-4",
        xl: "h-8 gap-1.5 rounded-lg text-label-lg [&_svg:not([class*='size-'])]:size-4",
      },
      square: {
        true: "",
        false: "",
      },
      touchTarget: {
        none: "",
        expand: touchTargetArea,
        wrapper: touchTargetArea,
      },
    },
    compoundVariants: [
      ...colorVariants,
      { square: false, size: "xs", class: "px-1 has-data-[icon=inline-start]:ps-0.5 has-data-[icon=inline-end]:pe-0.5" },
      { square: false, size: "sm", class: "px-1.5 has-data-[icon=inline-start]:ps-1 has-data-[icon=inline-end]:pe-1" },
      { square: false, size: "md", class: "px-2 has-data-[icon=inline-start]:ps-1.5 has-data-[icon=inline-end]:pe-1.5" },
      { square: false, size: "lg", class: "px-2.5 has-data-[icon=inline-start]:ps-2 has-data-[icon=inline-end]:pe-2" },
      { square: false, size: "xl", class: "px-3 has-data-[icon=inline-start]:ps-2.5 has-data-[icon=inline-end]:pe-2.5" },
      { square: true, size: "xs", class: "min-w-4 px-0.5" },
      { square: true, size: "sm", class: "min-w-5 px-0.5" },
      { square: true, size: "md", class: "min-w-6 px-1" },
      { square: true, size: "lg", class: "min-w-7 px-1" },
      { square: true, size: "xl", class: "min-w-8 px-2" },
      { size: "xs", touchTarget: "wrapper", class: "my-4" },
      { size: "sm", touchTarget: "wrapper", class: "my-3.5" },
      { size: "md", touchTarget: "wrapper", class: "my-3" },
      { size: "lg", touchTarget: "wrapper", class: "my-2.5" },
      { size: "xl", touchTarget: "wrapper", class: "my-2" },
    ],
    defaultVariants: {
      variant: "solid",
      color: "primary",
      size: "md",
      square: false,
      touchTarget: "none",
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
