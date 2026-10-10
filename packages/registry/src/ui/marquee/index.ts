import { type VariantProps, cva } from "class-variance-authority";

export { default as Marquee } from "./Marquee.vue";

export type MarqueeOrientation = "horizontal" | "vertical";

export const marqueeVariants = cva(
  `
    group/marquee relative flex items-center gap-(--marquee-gap) overflow-hidden [--marquee-duration:20s]
    [--marquee-fade:25%] [--marquee-gap:--spacing(16)]
  `,
  {
    variants: {
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col",
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
  "flex shrink-0 items-center justify-around gap-(--marquee-gap) backface-hidden",
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
        true: `
          group-hover/marquee:[animation-play-state:paused]
          group-focus-within/marquee:[animation-play-state:paused]
        `,
        false: "",
      },
    },
    defaultVariants: { orientation: "horizontal", reverse: false, pauseOnHover: false },
  },
);
