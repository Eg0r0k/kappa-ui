import { type VariantProps, cva } from "class-variance-authority";

export { default as Card } from "./Card.vue";
export { default as CardContent } from "./CardContent.vue";
export { default as CardDescription } from "./CardDescription.vue";
export { default as CardFooter } from "./CardFooter.vue";
export { default as CardHeader } from "./CardHeader.vue";
export { default as CardTitle } from "./CardTitle.vue";

export const cardVariants = cva(
  `
    group/card flex flex-col gap-(--card-spacing) py-(--card-spacing) text-card-foreground
    [--scroll-fade-color:var(--card)]
  `,
  {
    variants: {
      variant: {
        outline: "bg-card ring-1 ring-surface-border",
        solid: "bg-card shadow-shadow-sm",
        soft: "bg-muted [--scroll-fade-color:var(--muted)]",
        subtle: "bg-muted ring-1 ring-surface-border [--scroll-fade-color:var(--muted)]",
      },
      size: {
        xs: "rounded-surface-sm [--card-spacing:--spacing(3)]",
        sm: "rounded-surface-sm [--card-spacing:--spacing(4)]",
        md: "rounded-surface-md [--card-spacing:--spacing(6)]",
        lg: "rounded-surface-lg [--card-spacing:--spacing(8)]",
        xl: "rounded-surface-xl [--card-spacing:--spacing(10)]",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

export type CardVariants = VariantProps<typeof cardVariants>;
