import { type VariantProps, cva } from "class-variance-authority";

export { default as Toggle } from "./Toggle.vue";

export const toggleVariants = cva(
  "data-[state=on]:disabled:text-foreground/(--disabled-opacity) data-[state=on]:disabled:no-underline",
  {
    variants: {
      activeVariant: {
        solid: `
          data-[state=on]:state-layer data-[state=on]:bg-tone data-[state=on]:text-tone-foreground
          data-[state=on]:inset-ring-0 data-[state=on]:no-underline
          data-[state=on]:disabled:bg-foreground/(--disabled-container-opacity)
        `,
        soft: `
          data-[state=on]:state-layer data-[state=on]:bg-tone-soft data-[state=on]:text-tone-soft-foreground
          data-[state=on]:inset-ring-0 data-[state=on]:no-underline
          data-[state=on]:disabled:bg-foreground/(--disabled-container-opacity)
        `,
        subtle: `
          data-[state=on]:state-layer data-[state=on]:bg-tone-soft data-[state=on]:text-tone-soft-foreground
          data-[state=on]:inset-ring data-[state=on]:inset-ring-tone-border-subtle data-[state=on]:no-underline
          data-[state=on]:disabled:bg-foreground/(--disabled-container-opacity)
          data-[state=on]:disabled:inset-ring-foreground/(--disabled-container-opacity)
        `,
        outline: `
          data-[state=on]:state-layer data-[state=on]:bg-background data-[state=on]:text-tone-text
          data-[state=on]:inset-ring data-[state=on]:inset-ring-tone-border data-[state=on]:no-underline
          data-[state=on]:disabled:inset-ring-foreground/(--disabled-container-opacity)
        `,
        ghost: `
          data-[state=on]:state-layer data-[state=on]:bg-transparent data-[state=on]:text-tone-text
          data-[state=on]:inset-ring-0 data-[state=on]:no-underline
        `,
        link: `
          data-[state=on]:bg-transparent data-[state=on]:text-tone-text data-[state=on]:inset-ring-0
          data-[state=on]:underline
        `,
      },
    },
    defaultVariants: { activeVariant: "soft" },
  },
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;
