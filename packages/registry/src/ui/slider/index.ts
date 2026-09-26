import { type VariantProps, cva } from "class-variance-authority";

export { default as Slider } from "./Slider.vue";

const touchArea =
  "data-[orientation=horizontal]:before:absolute data-[orientation=horizontal]:before:inset-x-0 data-[orientation=horizontal]:before:top-1/2 data-[orientation=horizontal]:before:h-[max(3rem,100%)] data-[orientation=horizontal]:before:-translate-y-1/2 data-[orientation=vertical]:before:absolute data-[orientation=vertical]:before:inset-y-0 data-[orientation=vertical]:before:left-1/2 data-[orientation=vertical]:before:w-[max(3rem,100%)] data-[orientation=vertical]:before:-translate-x-1/2";

const thumbTouchArea =
  "after:absolute after:top-1/2 after:left-1/2 after:size-[max(3rem,100%)] after:-translate-x-1/2 after:-translate-y-1/2";

export const sliderVariants = cva(
  "group/slider relative flex touch-none items-center select-none data-[orientation=horizontal]:h-(--slider-size) data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-(--slider-size) data-[orientation=vertical]:flex-col data-disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "[--slider-size:var(--slider-thumb)] [--slider-track:var(--slider-bar)]",
        inset:
          "[--slider-size:var(--slider-track)] [--slider-track:calc(var(--slider-thumb)+0.25rem)] [--slider-half:calc(var(--slider-track)/2)]",
      },
      size: {
        xs: "[--slider-thumb:0.75rem] [--slider-bar:0.25rem]",
        sm: "[--slider-thumb:0.875rem] [--slider-bar:0.375rem]",
        md: "[--slider-thumb:1rem] [--slider-bar:0.375rem]",
        lg: "[--slider-thumb:1.25rem] [--slider-bar:0.5rem]",
        xl: "[--slider-thumb:1.5rem] [--slider-bar:0.625rem]",
      },
      touchTarget: {
        none: "",
        expand: touchArea,
        wrapper: `${touchArea} data-[orientation=horizontal]:my-[max(0px,calc((3rem-var(--slider-size))/2))] data-[orientation=vertical]:mx-[max(0px,calc((3rem-var(--slider-size))/2))]`,
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      touchTarget: "none",
    },
  },
);

export const sliderTrackVariants = cva(
  "relative grow rounded-full data-[orientation=horizontal]:h-(--slider-track) data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-(--slider-track) data-disabled:bg-foreground/(--disabled-container-opacity)",
  {
    variants: {
      variant: {
        default: "overflow-hidden bg-primary/20 group-has-[[aria-invalid=true]]/slider:bg-destructive/20",
        inset:
          "border-transparent bg-muted data-[orientation=horizontal]:border-x-(length:--slider-half) data-[orientation=vertical]:border-y-(length:--slider-half)",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export const sliderRangeVariants = cva(
  "absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full group-has-[[aria-invalid=true]]/slider:bg-destructive",
  {
    variants: {
      variant: {
        default: "rounded-full data-disabled:bg-foreground/(--disabled-opacity)",
        inset:
          "before:absolute before:bg-inherit after:absolute after:bg-inherit data-[orientation=horizontal]:before:inset-y-0 data-[orientation=horizontal]:before:right-full data-[orientation=horizontal]:before:w-(--slider-half) data-[orientation=horizontal]:before:rounded-l-full data-[orientation=horizontal]:after:inset-y-0 data-[orientation=horizontal]:after:left-full data-[orientation=horizontal]:after:w-(--slider-half) data-[orientation=horizontal]:after:rounded-r-full data-[orientation=vertical]:before:inset-x-0 data-[orientation=vertical]:before:bottom-full data-[orientation=vertical]:before:h-(--slider-half) data-[orientation=vertical]:before:rounded-t-full data-[orientation=vertical]:after:inset-x-0 data-[orientation=vertical]:after:top-full data-[orientation=vertical]:after:h-(--slider-half) data-[orientation=vertical]:after:rounded-b-full data-disabled:bg-[color-mix(in_oklab,var(--color-foreground)_var(--disabled-opacity),var(--color-background))]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export const sliderThumbVariants = cva(
  "group/thumb relative flex size-(--slider-size) shrink-0 items-center justify-center rounded-full outline-none focus-visible:focus-ring",
  {
    variants: {
      variant: {
        default:
          "before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:size-[calc(var(--slider-thumb)+1.5rem)] before:-translate-x-1/2 before:-translate-y-1/2 before:scale-75 before:rounded-full before:bg-primary before:opacity-0 before:transition-[opacity,scale] before:duration-short-4 before:ease-standard data-hovered:before:scale-100 data-hovered:before:opacity-(--state-hover) group-active/slider:focus:before:scale-100 group-active/slider:focus:before:opacity-(--state-pressed) aria-invalid:before:bg-destructive data-disabled:before:hidden forced-colors:before:hidden motion-reduce:before:scale-100",
        inset:
          "bg-primary aria-invalid:bg-destructive data-disabled:bg-[color-mix(in_oklab,var(--color-foreground)_var(--disabled-opacity),var(--color-background))]",
      },
      touchTarget: {
        none: "",
        expand: thumbTouchArea,
        wrapper: thumbTouchArea,
      },
    },
    defaultVariants: {
      variant: "default",
      touchTarget: "none",
    },
  },
);

export const sliderHandleVariants = cva(
  "pointer-events-none block size-(--slider-thumb) rounded-full shadow-sm transition-[scale,background-color] duration-short-4 ease-standard group-data-disabled/thumb:shadow-none motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary group-active/slider:group-focus/thumb:scale-125 group-active/slider:group-focus/thumb:duration-short-2 group-aria-invalid/thumb:bg-destructive group-data-disabled/thumb:bg-[color-mix(in_oklab,var(--color-foreground)_var(--disabled-opacity),var(--color-background))]",
        inset:
          "bg-primary-foreground group-active/slider:group-focus/thumb:scale-90 group-active/slider:group-focus/thumb:duration-short-2 group-aria-invalid/thumb:bg-destructive-foreground group-data-disabled/thumb:bg-background",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type SliderVariants = VariantProps<typeof sliderVariants>;
