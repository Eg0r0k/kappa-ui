// Adapted from Nuxt UI (https://github.com/nuxt/ui), modified for kappa-ui.
// Copyright (c) 2023 Nuxt. MIT License: https://github.com/nuxt/ui/blob/v4/LICENSE.md
import { cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { ComputedRef, Ref } from "vue";

export { default as Progress } from "./Progress.vue";
export { default as ProgressLabel } from "./ProgressLabel.vue";
export { default as ProgressValue } from "./ProgressValue.vue";

export type ProgressSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type ProgressAnimation = "carousel" | "carousel-inverse" | "swing" | "elastic";
export type ProgressOrientation = "horizontal" | "vertical";

export const [injectProgressContext, provideProgressContext] = createContext<{
  labelId: string;
  labelled: Ref<boolean>;
  percent: ComputedRef<number | undefined>;
  value: ComputedRef<number | null | undefined>;
  max: ComputedRef<number>;
}>("Progress");

export const progressVariants = cva("flex gap-2 text-primary", {
  variants: {
    orientation: {
      horizontal: "w-full flex-col",
      vertical: "h-full flex-row-reverse",
    },
    size: {
      "2xs": "text-body-sm [--progress-thickness:1px]",
      xs: "text-body-sm [--progress-thickness:--spacing(0.5)]",
      sm: "text-body-md [--progress-thickness:--spacing(1)]",
      md: "text-body-md [--progress-thickness:--spacing(2)]",
      lg: "text-body-md [--progress-thickness:--spacing(3)]",
      xl: "text-body-lg [--progress-thickness:--spacing(4)]",
      "2xl": "text-body-lg [--progress-thickness:--spacing(5)]",
    },
  },
});

export const progressStatusVariants = cva(
  "flex text-muted-foreground duration-short-4 ease-standard motion-reduce:transition-none",
  {
    variants: {
      orientation: {
        horizontal: "w-(--percent) min-w-fit flex-row items-center justify-end transition-[width]",
        vertical: "h-(--percent) min-h-fit flex-col justify-end transition-[height]",
      },
      inverted: {
        true: "self-end",
        false: "",
      },
    },
    compoundVariants: [
      { inverted: true, orientation: "horizontal", class: "flex-row-reverse" },
      { inverted: true, orientation: "vertical", class: "flex-col-reverse" },
    ],
  },
);

export const progressTrackVariants = cva("relative overflow-hidden rounded-full bg-current/20", {
  variants: {
    orientation: {
      horizontal: "h-(--progress-thickness) w-full",
      vertical: "h-full w-(--progress-thickness)",
    },
  },
});

export const progressIndicatorVariants = cva(
  "size-full rounded-full bg-current transition-transform duration-short-4 ease-standard motion-reduce:transition-none",
  {
    variants: {
      orientation: {
        horizontal: "",
        vertical: "",
      },
      animation: {
        carousel: "",
        "carousel-inverse": "",
        swing: "",
        elastic: "relative",
      },
    },
    compoundVariants: [
      {
        orientation: "horizontal",
        animation: "carousel",
        class: "data-[state=indeterminate]:animate-progress-carousel",
      },
      {
        orientation: "vertical",
        animation: "carousel",
        class: "data-[state=indeterminate]:animate-progress-carousel-vertical",
      },
      {
        orientation: "horizontal",
        animation: "carousel-inverse",
        class: "data-[state=indeterminate]:animate-progress-carousel-inverse",
      },
      {
        orientation: "vertical",
        animation: "carousel-inverse",
        class: "data-[state=indeterminate]:animate-progress-carousel-inverse-vertical",
      },
      {
        orientation: "horizontal",
        animation: "swing",
        class: "data-[state=indeterminate]:animate-progress-swing",
      },
      {
        orientation: "vertical",
        animation: "swing",
        class: "data-[state=indeterminate]:animate-progress-swing-vertical",
      },
      {
        orientation: "horizontal",
        animation: "elastic",
        class: "data-[state=indeterminate]:animate-progress-elastic",
      },
      {
        orientation: "vertical",
        animation: "elastic",
        class: "data-[state=indeterminate]:animate-progress-elastic-vertical",
      },
    ],
  },
);

export const progressStepsVariants = cva("grid items-end", {
  variants: {
    orientation: {
      horizontal: "",
      vertical: "",
    },
    inverted: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [{ inverted: true, orientation: "vertical", class: "items-start" }],
});

export const progressStepVariants = cva(
  "col-start-1 row-start-1 truncate text-end transition-opacity duration-short-3 ease-standard data-[state=first]:text-muted-foreground data-[state=other]:opacity-0",
  {
    variants: {
      orientation: {
        horizontal: "",
        vertical: "",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [{ inverted: true, orientation: "horizontal", class: "text-start" }],
  },
);
