import { type VariantProps, cva } from "class-variance-authority";

export { default as Switch } from "./Switch.vue";

const touchTargetArea =
  "after:absolute after:top-1/2 after:left-1/2 after:h-[max(3rem,100%)] after:w-[max(3rem,100%)] after:-translate-x-1/2 after:-translate-y-1/2";

export const switchVariants = cva(
  "group/switch relative inline-flex h-(--switch-h) w-(--switch-w) shrink-0 items-center rounded-full border-2 border-input bg-muted outline-none transition-[background-color,border-color] duration-short-1 ease-linear [--switch-w:calc(var(--switch-h)*1.625)] focus-visible:focus-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary aria-invalid:border-destructive aria-invalid:data-[state=checked]:bg-destructive disabled:cursor-not-allowed disabled:border-foreground/(--disabled-container-opacity) disabled:bg-transparent disabled:data-[state=checked]:border-transparent disabled:data-[state=checked]:bg-foreground/(--disabled-container-opacity)",
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
        expand: touchTargetArea,
        wrapper: `${touchTargetArea} mx-[max(0px,calc((3rem-var(--switch-w))/2))] my-[max(0px,calc((3rem-var(--switch-h))/2))]`,
      },
    },
    defaultVariants: {
      size: "md",
      touchTarget: "none",
    },
  },
);

export const switchThumbClass =
  "pointer-events-none absolute start-0 top-0 flex size-[calc(var(--switch-h)-4px)] items-center justify-center transition-[translate] duration-medium-2 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group-disabled/switch:transition-none motion-reduce:transition-none data-[state=checked]:translate-x-[calc(var(--switch-w)-var(--switch-h))] rtl:data-[state=checked]:-translate-x-[calc(var(--switch-w)-var(--switch-h))] before:absolute before:top-1/2 before:left-1/2 before:size-[calc(var(--switch-h)*1.25)] before:-translate-x-1/2 before:-translate-y-1/2 before:scale-75 before:rounded-full before:bg-foreground before:opacity-0 before:transition-[opacity,scale] before:duration-short-4 before:ease-standard group-data-hovered/switch:before:scale-100 group-data-hovered/switch:before:opacity-(--state-hover) group-active/switch:before:scale-100 group-active/switch:before:opacity-(--state-pressed) group-data-hovered/switch:group-active/switch:before:opacity-(--state-pressed) data-[state=checked]:before:bg-primary group-aria-invalid/switch:before:bg-destructive group-disabled/switch:before:hidden forced-colors:before:hidden motion-reduce:before:scale-100";

export const switchHandleClass =
  "relative flex size-[calc(var(--switch-h)/2)] items-center justify-center rounded-full bg-input transition-[width,height,background-color] duration-medium-1 ease-standard group-data-[state=checked]/switch:size-[calc(var(--switch-h)*3/4)] group-data-[state=checked]/switch:bg-primary-foreground group-data-unchecked-icon/switch:size-[calc(var(--switch-h)*3/4)] group-active/switch:size-[calc(var(--switch-h)*5/8)] group-active/switch:group-data-[state=checked]/switch:size-[min(calc(var(--switch-h)*7/8),calc(var(--switch-h)-4px))] group-active/switch:group-data-unchecked-icon/switch:size-[min(calc(var(--switch-h)*7/8),calc(var(--switch-h)-4px))] group-active/switch:duration-short-2 group-active/switch:ease-linear group-aria-invalid/switch:bg-destructive group-aria-invalid/switch:group-data-[state=checked]/switch:bg-destructive-foreground group-disabled/switch:bg-foreground/(--disabled-opacity) group-disabled/switch:group-data-[state=checked]/switch:bg-background group-disabled/switch:transition-none motion-reduce:transition-none";

export const switchIconClass =
  "absolute inset-0 flex items-center justify-center transition-[opacity,rotate] duration-short-4 ease-standard motion-reduce:transition-none [&_svg]:size-[calc(var(--switch-h)/2)] [&_svg]:shrink-0";

export type SwitchVariants = VariantProps<typeof switchVariants>;
