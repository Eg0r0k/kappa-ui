import { type VariantProps, cva } from "class-variance-authority";

export { default as Marquee } from "./Marquee.vue";

export type MarqueeOrientation = "horizontal" | "vertical";

export const marqueeVariants = cva(
  `
    group/marquee relative flex items-center gap-(--marquee-gap) [--marquee-duration:20s] [--marquee-fade:25%]
    [--marquee-gap:--spacing(16)]
  `,
  {
    variants: {
      orientation: {
        horizontal: "w-full min-w-0 flex-row overflow-x-clip contain-inline-size",
        vertical: "h-full min-h-0 flex-col overflow-y-clip",
      },
      fade: {
        true: "marquee-fade",
        false: "",
      },
    },
    defaultVariants: { orientation: "horizontal", fade: true },
  },
);

export type MarqueeVariants = VariantProps<typeof marqueeVariants>;

export const marqueeContentVariants = cva(
  `
    flex shrink-0 items-center justify-around gap-(--marquee-gap) backface-hidden
    group-data-focus-visible/marquee:[animation:none]
  `,
  {
    variants: {
      orientation: {
        horizontal: "w-full min-w-max flex-row animate-marquee",
        vertical: "h-full min-h-max flex-col animate-marquee-vertical",
      },
      reverse: {
        true: "[animation-direction:reverse]",
        false: "",
      },
      pauseOnHover: {
        true: "group-hover/marquee:[animation-play-state:paused]",
        false: "",
      },
      paused: {
        true: "[animation-play-state:paused]",
        false: "",
      },
    },
    defaultVariants: { orientation: "horizontal", reverse: false, pauseOnHover: false, paused: false },
  },
);
