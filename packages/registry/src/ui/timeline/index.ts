import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { ComputedRef, Ref } from "vue";

export { default as Timeline } from "./Timeline.vue";
export { default as TimelineContent } from "./TimelineContent.vue";
export { default as TimelineDate } from "./TimelineDate.vue";
export { default as TimelineDescription } from "./TimelineDescription.vue";
export { default as TimelineIndicator } from "./TimelineIndicator.vue";
export { default as TimelineItem } from "./TimelineItem.vue";
export { default as TimelineSeparator } from "./TimelineSeparator.vue";
export { default as TimelineTitle } from "./TimelineTitle.vue";

export type TimelineColor = "primary" | "neutral" | "destructive" | "success" | "warning" | "info";
export type TimelineValue = string | number;
export type TimelineOrientation = "vertical" | "horizontal";
export type TimelineState = "active" | "completed" | "inactive";

export interface TimelineEntry {
  element: HTMLElement | undefined;
  value: () => TimelineValue | undefined;
}

export interface TimelineContext {
  orientation: ComputedRef<TimelineOrientation>;
  reverse: ComputedRef<boolean>;
  model: Ref<TimelineValue | null | undefined>;
  entries: Ref<TimelineEntry[]>;
  activeIndex: ComputedRef<number>;
  register: (entry: TimelineEntry) => () => void;
  resort: () => void;
}

export const [injectTimelineContext, provideTimelineContext] = createContext<TimelineContext>("Timeline");

export const timelineVariants = cva("group/timeline flex flex-col data-[orientation=horizontal]:flex-row", {
  variants: {
    size: {
      xs: `
        [--timeline-gap:--spacing(1.5)] [--timeline-icon:--spacing(3.5)] [--timeline-indicator:--spacing(6)]
        [--timeline-separator:1px] [--timeline-spacing:--spacing(4)] [--timeline-text:var(--typescale-label-sm-size)]
      `,
      sm: `
        [--timeline-gap:--spacing(2)] [--timeline-icon:--spacing(4)] [--timeline-indicator:--spacing(7)]
        [--timeline-separator:--spacing(0.5)] [--timeline-spacing:--spacing(5)]
        [--timeline-text:var(--typescale-label-md-size)]
      `,
      md: `
        [--timeline-gap:--spacing(2)] [--timeline-icon:--spacing(4)] [--timeline-indicator:--spacing(8)]
        [--timeline-separator:--spacing(0.5)] [--timeline-spacing:--spacing(6)]
        [--timeline-text:var(--typescale-label-lg-size)]
      `,
      lg: `
        [--timeline-gap:--spacing(2.5)] [--timeline-icon:--spacing(5)] [--timeline-indicator:--spacing(10)]
        [--timeline-separator:--spacing(0.5)] [--timeline-spacing:--spacing(7)]
        [--timeline-text:var(--typescale-label-lg-size)]
      `,
      xl: `
        [--timeline-gap:--spacing(3)] [--timeline-icon:--spacing(6)] [--timeline-indicator:--spacing(12)]
        [--timeline-separator:--spacing(1)] [--timeline-spacing:--spacing(8)]
        [--timeline-text:var(--typescale-title-md-size)]
      `,
    },
  },
  defaultVariants: { size: "md" },
});

export type TimelineVariants = VariantProps<typeof timelineVariants>;

export const timelineItemVariants = cva(
  "group/timeline-item relative grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-(--timeline-gap)",
  {
    variants: {
      orientation: {
        vertical: "",
        horizontal: "min-w-0 flex-1",
      },
    },
  },
);

export const timelineIndicator = `
  col-start-1 row-start-1 inline-flex size-(--timeline-indicator) shrink-0 items-center justify-center rounded-full
  bg-tone text-(length:--timeline-text) leading-none font-medium text-tone-foreground
  group-data-[state=inactive]/timeline-item:bg-muted group-data-[state=inactive]/timeline-item:text-muted-foreground
  [&_svg]:pointer-events-none [&_svg]:shrink-0
  icon-size-(--timeline-icon)
`;

export const timelineSeparatorVariants = cva(
  `
    rounded-full bg-muted
    group-data-[state=completed]/timeline-item:bg-tone
    group-data-reverse/timeline:group-data-[state=active]/timeline-item:bg-tone
    group-last/timeline-item:hidden
  `,
  {
    variants: {
      orientation: {
        vertical: `
          col-start-1 row-start-2 mb-(--timeline-gap) min-h-(--timeline-spacing) w-(--timeline-separator)
          justify-self-center
        `,
        horizontal: "col-start-2 row-start-1 h-(--timeline-separator) self-center me-(--timeline-gap)",
      },
    },
  },
);

export const timelineContentVariants = cva("flex min-w-0 flex-col", {
  variants: {
    orientation: {
      vertical: `
        col-start-2 row-span-2 row-start-1 mb-(--timeline-spacing)
        pt-[calc((var(--timeline-indicator)-var(--typescale-title-sm-line-height))/2)]
        group-last/timeline-item:mb-0
      `,
      horizontal: "col-span-2 col-start-1 row-start-2 me-(--timeline-spacing) group-last/timeline-item:me-0",
    },
  },
});

export const timelineDate = "text-body-sm text-muted-foreground";

export const timelineTitle = "text-title-sm";

export const timelineDescription = "text-body-sm text-muted-foreground";
