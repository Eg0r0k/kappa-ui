import { type VariantProps, cva } from "class-variance-authority";

export { default as Rating } from "./Rating.vue";

export type RatingSize = "xs" | "sm" | "md" | "lg" | "xl";
export type RatingColor = "primary" | "neutral" | "destructive" | "success" | "warning" | "info";
export type RatingTouchTarget = "none" | "expand" | "wrapper";

export type RatingLabels = {
  /** The screen reader name of one step, e.g. "3 out of 5". */
  item: (value: number, length: number) => string;
  /** The name of a readonly rating, read as one picture, e.g. "Rated 4.3 out of 5". */
  readonly: (value: number, length: number) => string;
};

export const defaultRatingLabels: RatingLabels = {
  item: (value, length) => `${value} out of ${length}`,
  readonly: (value, length) => `Rated ${+value.toFixed(2)} out of ${length}`,
};

// The item box is the control height; the glyph is two thirds of it, rounded to 2px. Items touch, with half the
// control gap as the space between glyphs, so there is no dead strip between two stars to click or hover.
// Every glyph colour is opaque, which keeps a half step painted twice (reka-ui #2964, before 2.11) looking the same.
export const ratingVariants = cva(
  `
    group/rating relative inline-flex w-fit shrink-0 tone-control outline-none select-none
    [--rating-size:round(calc(var(--rating-box)*2/3),2px)] [--rating-pitch:calc(var(--rating-size)+var(--rating-gap))]
    [--rating-hit:var(--rating-box)] [--rating-fill:var(--tone)] [--rating-edge:var(--tone-text)]
    [--rating-empty:var(--tone-border)] [--halo-color:--theme(--color-foreground)]
    aria-invalid:tone-invalid
    data-disabled:cursor-not-allowed
    data-disabled:[--rating-fill:color-mix(in_oklab,var(--color-foreground)_var(--disabled-opacity),var(--color-background))]
    data-disabled:[--rating-edge:color-mix(in_oklab,var(--color-foreground)_var(--disabled-opacity),var(--color-background))]
    data-disabled:[--rating-empty:color-mix(in_oklab,var(--color-foreground)_var(--disabled-opacity),var(--color-background))]
  `,
  {
    variants: {
      size: {
        xs: "[--rating-box:var(--control-height-xs)] [--rating-gap:calc(var(--control-gap-xs)/2)]",
        sm: "[--rating-box:var(--control-height-sm)] [--rating-gap:calc(var(--control-gap-sm)/2)]",
        md: "[--rating-box:var(--control-height-md)] [--rating-gap:calc(var(--control-gap-md)/2)]",
        lg: "[--rating-box:var(--control-height-lg)] [--rating-gap:calc(var(--control-gap-lg)/2)]",
        xl: "[--rating-box:var(--control-height-xl)] [--rating-gap:calc(var(--control-gap-xl)/2)]",
      },
      orientation: {
        horizontal: "flex-row items-center [--rating-item-w:var(--rating-pitch)] [--rating-item-h:var(--rating-hit)]",
        vertical: "flex-col items-center [--rating-item-w:var(--rating-hit)] [--rating-item-h:var(--rating-pitch)]",
      },
      // Grows each item across the row only, so neighbours never overlap and the half-step split stays exact.
      touchTarget: {
        none: "",
        expand: "[--rating-hit:max(3rem,var(--rating-box))]",
        wrapper: "[--rating-hit:max(3rem,var(--rating-box))]",
      },
    },
    compoundVariants: [
      {
        touchTarget: "expand",
        orientation: "horizontal",
        class: "my-[calc((var(--rating-box)-var(--rating-hit))/2)]",
      },
      {
        touchTarget: "expand",
        orientation: "vertical",
        class: "mx-[calc((var(--rating-box)-var(--rating-hit))/2)]",
      },
    ],
    defaultVariants: {
      size: "md",
      orientation: "horizontal",
      touchTarget: "none",
    },
  },
);

// Reka marks every filled step with data-state="active" and leaves the rest without one (reka-ui #2823 renames it to
// checked/unchecked in v3). Every selector on it lives in this file.
export const ratingItemVariants = cva(
  "group/rating-item relative isolate flex h-(--rating-item-h) w-(--rating-item-w) shrink-0 items-center justify-center",
  {
    variants: {
      interactive: {
        true: "state-halo [--halo-size:var(--rating-box)] has-data-[state=active]:[--halo-color:var(--tone)]",
        false: "",
      },
    },
    defaultVariants: { interactive: true },
  },
);

export const ratingEmptyIconClass = `
  pointer-events-none absolute inset-0 m-auto flex size-(--rating-size) items-center justify-center rounded-full
  text-(--rating-empty) icon-size-(--rating-size)
  group-has-focus-visible/rating-item:focus-ring
`;

export const ratingIndicatorClass = `
  group/rating-indicator absolute inset-y-0 start-0 z-(--reka-rating-item-step-z-index)
  w-(--reka-rating-item-step-width) opacity-(--reka-rating-item-step-opacity) outline-none
  enabled:cursor-pointer
  disabled:cursor-not-allowed
`;

export const ratingClipClass = "pointer-events-none absolute inset-y-0 start-0 overflow-hidden";

export const ratingIconClass = `
  absolute inset-y-0 start-0 flex w-(--rating-item-w) items-center justify-center text-(--rating-edge)
  icon-size-(--rating-size)
  [:where(&)_svg]:fill-(--rating-fill)
`;

export const ratingIndicatorIconClass = `
  opacity-0 transition-opacity duration-short-2 ease-standard
  group-data-[state=active]/rating-indicator:opacity-100
  motion-reduce:transition-none
`;

export type RatingVariants = VariantProps<typeof ratingVariants>;
