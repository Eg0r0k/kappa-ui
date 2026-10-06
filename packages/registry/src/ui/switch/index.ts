import { type VariantProps, cva } from "class-variance-authority";

export { default as Switch } from "./Switch.vue";

export type SwitchColor = "primary" | "neutral" | "destructive" | "success" | "warning" | "info";

export const switchVariants = cva(
  `
    group/switch relative inline-flex h-(--switch-h) w-(--switch-w) shrink-0 items-center rounded-full border-2
    border-tone-border bg-muted outline-none transition-[background-color,border-color] duration-short-1 ease-linear
    [--switch-w:calc(var(--switch-h)*1.625)] [--touch-w:var(--switch-w)] [--touch-h:var(--switch-h)]
    [--halo-size:calc(var(--switch-h)*1.25)] tone-control [--halo-color:--theme(--color-foreground)]
    aria-invalid:tone-invalid
    data-[state=checked]:[--halo-color:var(--tone)]
    focus-visible:focus-ring
    data-[state=checked]:border-tone-text data-[state=checked]:bg-tone
    disabled:cursor-not-allowed disabled:border-foreground/(--disabled-container-opacity) disabled:bg-transparent
    disabled:data-[state=checked]:border-transparent
    disabled:data-[state=checked]:bg-foreground/(--disabled-container-opacity)
  `,
  {
    variants: {
      size: {
        xs: "[--switch-h:1rem]",
        sm: "[--switch-h:1.25rem]",
        md: "[--switch-h:1.5rem]",
        lg: "[--switch-h:1.75rem]",
        xl: "[--switch-h:2rem]",
      },
      touchTarget: {
        none: "",
        expand: "touch-target",
        wrapper: "touch-target-wrapper",
      },
    },
    defaultVariants: {
      size: "md",
      touchTarget: "none",
    },
  },
);

export const switchThumbClass = `
  pointer-events-none absolute start-0 top-0 flex size-[calc(var(--switch-h)-4px)] items-center justify-center
  state-halo transition-[translate] duration-medium-2 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
  group-disabled/switch:transition-none
  motion-reduce:transition-none
  data-[state=checked]:translate-x-[calc(var(--switch-w)-var(--switch-h))]
  rtl:data-[state=checked]:-translate-x-[calc(var(--switch-w)-var(--switch-h))]
`;

export const switchHandleClass = `
  relative flex size-[calc(var(--switch-h)/2)] items-center justify-center rounded-full bg-tone-border
  transition-[width,height,background-color] duration-medium-1 ease-standard
  group-data-[state=checked]/switch:size-[calc(var(--switch-h)*3/4)]
  group-data-[state=checked]/switch:bg-tone-foreground
  group-data-unchecked-icon/switch:size-[calc(var(--switch-h)*3/4)]
  group-active/switch:size-[calc(var(--switch-h)*5/8)]
  group-active/switch:group-data-[state=checked]/switch:size-[min(calc(var(--switch-h)*7/8),calc(var(--switch-h)-4px))]
  group-active/switch:group-data-unchecked-icon/switch:size-[min(calc(var(--switch-h)*7/8),calc(var(--switch-h)-4px))]
  group-active/switch:duration-short-2 group-active/switch:ease-linear
  group-disabled/switch:bg-foreground/(--disabled-opacity)
  group-disabled/switch:group-data-[state=checked]/switch:bg-background
  group-disabled/switch:transition-none
  motion-reduce:transition-none
`;

export const switchIconClass = `
  absolute inset-0 flex items-center justify-center transition-[opacity,rotate] duration-short-4 ease-standard
  motion-reduce:transition-none
  [&_svg]:size-[calc(var(--switch-h)/2)] [&_svg]:shrink-0
`;

export type SwitchVariants = VariantProps<typeof switchVariants>;
