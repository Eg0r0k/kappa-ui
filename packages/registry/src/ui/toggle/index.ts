import { type VariantProps, cva } from "class-variance-authority";

export { default as Toggle } from "./Toggle.vue";

export const toggleVariants = cva(
  "aria-pressed:disabled:text-foreground/(--disabled-opacity) aria-pressed:disabled:no-underline",
  {
    variants: {
      activeVariant: {
        solid: `
          aria-pressed:state-layer aria-pressed:bg-tone aria-pressed:text-tone-foreground aria-pressed:inset-ring-0
          aria-pressed:no-underline
          aria-pressed:disabled:bg-foreground/(--disabled-container-opacity)
        `,
        soft: `
          aria-pressed:state-layer aria-pressed:bg-tone-soft aria-pressed:text-tone-soft-foreground
          aria-pressed:inset-ring-0 aria-pressed:no-underline
          aria-pressed:disabled:bg-foreground/(--disabled-container-opacity)
        `,
        subtle: `
          aria-pressed:state-layer aria-pressed:bg-tone-soft aria-pressed:text-tone-soft-foreground
          aria-pressed:inset-ring aria-pressed:inset-ring-tone-border-subtle aria-pressed:no-underline
          aria-pressed:disabled:bg-foreground/(--disabled-container-opacity)
          aria-pressed:disabled:inset-ring-foreground/(--disabled-container-opacity)
        `,
        outline: `
          aria-pressed:state-layer aria-pressed:bg-background aria-pressed:text-tone-text aria-pressed:inset-ring
          aria-pressed:inset-ring-tone-border aria-pressed:no-underline
          aria-pressed:disabled:inset-ring-foreground/(--disabled-container-opacity)
        `,
        ghost: `
          aria-pressed:state-layer aria-pressed:bg-transparent aria-pressed:text-tone-text aria-pressed:inset-ring-0
          aria-pressed:no-underline
        `,
        link: `aria-pressed:bg-transparent aria-pressed:text-tone-text aria-pressed:inset-ring-0 aria-pressed:underline`,
      },
    },
    defaultVariants: { activeVariant: "soft" },
  },
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;
