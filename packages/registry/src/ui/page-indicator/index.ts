import { cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { ComputedRef } from "vue";

export { default as PageIndicator } from "./PageIndicator.vue";
export { default as PageIndicatorItem } from "./PageIndicatorItem.vue";

export type PageIndicatorVariant = "dot" | "pill" | "line";
export type PageIndicatorSize = "xs" | "sm" | "md" | "lg" | "xl";
export type PageIndicatorColor = "primary" | "neutral" | "destructive" | "success" | "warning" | "info";
export type PageIndicatorOrientation = "horizontal" | "vertical";
export type PageIndicatorTouchTarget = "none" | "expand" | "wrapper";

export type PageIndicatorLook = {
  variant: PageIndicatorVariant;
  orientation: PageIndicatorOrientation;
  touchTarget: PageIndicatorTouchTarget;
  cumulative: boolean;
  readonly: boolean;
};

export const [injectPageIndicatorContext, providePageIndicatorContext] = createContext<{
  page: ComputedRef<number>;
  look: ComputedRef<PageIndicatorLook>;
  select: (page: number) => void;
}>("PageIndicator");

export const pageIndicatorVariants = cva(
  "flex w-fit items-center gap-(--page-indicator-gap) data-[orientation=vertical]:flex-col",
  {
    variants: {
      variant: {
        dot: "",
        pill: "",
        line: "",
      },
      orientation: {
        horizontal: "",
        vertical: "",
      },
      size: {
        xs: "[--page-indicator-dot:--spacing(1)] [--page-indicator-gap:--spacing(1)] [--page-indicator-pill:--spacing(3)]",
        sm: `
          [--page-indicator-dot:--spacing(1.5)] [--page-indicator-gap:--spacing(1.5)]
          [--page-indicator-pill:--spacing(4)]
        `,
        md: "[--page-indicator-dot:--spacing(2)] [--page-indicator-gap:--spacing(2)] [--page-indicator-pill:--spacing(6)]",
        lg: `
          [--page-indicator-dot:--spacing(2.5)] [--page-indicator-gap:--spacing(2.5)]
          [--page-indicator-pill:--spacing(7)]
        `,
        xl: "[--page-indicator-dot:--spacing(3)] [--page-indicator-gap:--spacing(3)] [--page-indicator-pill:--spacing(8)]",
      },
    },
    compoundVariants: [
      { variant: "line", orientation: "horizontal", class: "w-full" },
      { variant: "line", orientation: "vertical", class: "h-full" },
    ],
  },
);

export const pageIndicatorItemVariants = cva(
  `
    relative shrink-0 rounded-full bg-tone/25 outline-none
    transition-[--page-indicator-length,background-color,box-shadow] duration-short-4 ease-standard
    [--page-indicator-fill:0] [--page-indicator-halo:calc(var(--page-indicator-gap)/2)]
    before:absolute before:start-0 before:top-0 before:rounded-full before:bg-tone
    data-[state=active]:[--page-indicator-fill:clamp(0,var(--page-indicator-progress,1),1)]
    focus-visible:focus-ring
    enabled:cursor-pointer
    enabled:hover:ring-(length:--page-indicator-halo) enabled:hover:ring-tone/(--state-hover)
    enabled:active:ring-(length:--page-indicator-halo) enabled:active:ring-tone/(--state-pressed)
    motion-reduce:transition-none
  `,
  {
    variants: {
      variant: {
        dot: "[--page-indicator-length:var(--page-indicator-dot)]",
        pill: `
          [--page-indicator-length:var(--page-indicator-dot)]
          data-[state=active]:[--page-indicator-length:var(--page-indicator-pill)]
        `,
        line: "flex-1",
      },
      orientation: {
        horizontal: `
          h-(--page-indicator-dot) [--touch-h:var(--page-indicator-dot)]
          before:h-full before:w-[calc(var(--page-indicator-fill)*100%)]
        `,
        vertical: `
          w-(--page-indicator-dot) [--touch-w:var(--page-indicator-dot)]
          before:h-[calc(var(--page-indicator-fill)*100%)] before:w-full
        `,
      },
      cumulative: {
        true: "data-[state=completed]:[--page-indicator-fill:1]",
        false: "",
      },
      touchTarget: {
        none: "enabled:after:absolute enabled:after:-inset-(--page-indicator-halo) enabled:after:content-['']",
        expand: "touch-target",
        wrapper: "touch-target-wrapper",
      },
    },
    compoundVariants: [
      {
        variant: ["dot", "pill"],
        orientation: "horizontal",
        class: `
          w-[round(down,var(--page-indicator-length),1px)] [--touch-w:round(down,var(--page-indicator-length),1px)]
          data-[state=active]:w-[round(up,var(--page-indicator-length),1px)]
          data-[state=active]:[--touch-w:round(up,var(--page-indicator-length),1px)]
        `,
      },
      {
        variant: ["dot", "pill"],
        orientation: "vertical",
        class: `
          h-[round(down,var(--page-indicator-length),1px)] [--touch-h:round(down,var(--page-indicator-length),1px)]
          data-[state=active]:h-[round(up,var(--page-indicator-length),1px)]
          data-[state=active]:[--touch-h:round(up,var(--page-indicator-length),1px)]
        `,
      },
    ],
  },
);
