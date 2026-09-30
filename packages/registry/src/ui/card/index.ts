import { type VariantProps, cva } from "class-variance-authority";

export { default as Card } from "./Card.vue";
export { default as CardContent } from "./CardContent.vue";
export { default as CardDescription } from "./CardDescription.vue";
export { default as CardFooter } from "./CardFooter.vue";
export { default as CardHeader } from "./CardHeader.vue";
export { default as CardTitle } from "./CardTitle.vue";

export const cardVariants = cva(
  "group/card flex flex-col gap-(--card-spacing) py-(--card-spacing) text-card-foreground [--scroll-fade-color:var(--card)]",
  {
    variants: {
      variant: {
        outline: "border border-surface-border bg-card",
        solid: "bg-card shadow-shadow-sm",
        soft: "bg-muted [--scroll-fade-color:var(--muted)]",
        subtle: "border border-surface-border bg-muted [--scroll-fade-color:var(--muted)]",
      },
      size: {
        xs: "rounded-lg [--card-spacing:--spacing(3)]",
        sm: "rounded-lg [--card-spacing:--spacing(4)]",
        md: "rounded-xl [--card-spacing:--spacing(6)]",
        lg: "rounded-2xl [--card-spacing:--spacing(8)]",
        xl: "rounded-3xl [--card-spacing:--spacing(10)]",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

export type CardVariants = VariantProps<typeof cardVariants>;
