import { type VariantProps, cva } from "class-variance-authority";

export { default as Tabs } from "./Tabs.vue";
export { default as TabsContent } from "./TabsContent.vue";
export { default as TabsList } from "./TabsList.vue";
export { default as TabsTrigger } from "./TabsTrigger.vue";

export type TabsColor = "primary" | "neutral" | "destructive" | "success" | "warning" | "info";

const sizes = {
  xs: "text-label-sm [--tabs-radius:--theme(--radius-lg)] [--tabs-trigger-height:var(--control-height-xs)] [--tabs-trigger-px:var(--control-padding-xs)] [--tabs-trigger-gap:var(--control-gap-xs)] [--tabs-icon:var(--control-icon-xs)]",
  sm: "text-label-md [--tabs-radius:--theme(--radius-lg)] [--tabs-trigger-height:var(--control-height-sm)] [--tabs-trigger-px:var(--control-padding-sm)] [--tabs-trigger-gap:var(--control-gap-sm)] [--tabs-icon:var(--control-icon-sm)]",
  md: "text-label-md [--tabs-radius:--theme(--radius-lg)] [--tabs-trigger-height:var(--control-height-md)] [--tabs-trigger-px:var(--control-padding-md)] [--tabs-trigger-gap:var(--control-gap-md)] [--tabs-icon:var(--control-icon-md)]",
  lg: "text-label-lg [--tabs-radius:--theme(--radius-xl)] [--tabs-trigger-height:var(--control-height-lg)] [--tabs-trigger-px:var(--control-padding-lg)] [--tabs-trigger-gap:var(--control-gap-lg)] [--tabs-icon:var(--control-icon-lg)]",
  xl: "text-label-lg [--tabs-radius:--theme(--radius-xl)] [--tabs-trigger-height:var(--control-height-xl)] [--tabs-trigger-px:var(--control-padding-xl)] [--tabs-trigger-gap:var(--control-gap-xl)] [--tabs-icon:var(--control-icon-xl)]",
};

const pillInnerRadius = "rounded-[max(0px,calc(var(--tabs-radius)-var(--spacing)))]";

export const tabsListVariants = cva(
  `
    group/tabs-list relative isolate inline-flex w-fit shrink-0 items-center
    aria-[orientation=vertical]:flex-col aria-[orientation=vertical]:items-stretch
    aria-[orientation=vertical]:self-start
  `,
  {
    variants: {
      variant: {
        pill: "rounded-(--tabs-radius) bg-muted p-1",
        line: "border-border aria-[orientation=horizontal]:border-b aria-[orientation=vertical]:border-e",
      },
      size: sizes,
    },
    defaultVariants: { variant: "pill", size: "md" },
  },
);

export const tabsIndicatorVariants = cva(
  `
    pointer-events-none absolute transition-[translate,width,height] duration-short-4 ease-standard
    motion-reduce:transition-none
    group-aria-[orientation=horizontal]/tabs-list:left-0
    group-aria-[orientation=horizontal]/tabs-list:w-(--reka-tabs-indicator-size)
    group-aria-[orientation=horizontal]/tabs-list:translate-x-(--reka-tabs-indicator-position)
    group-aria-[orientation=vertical]/tabs-list:top-0
    group-aria-[orientation=vertical]/tabs-list:h-(--reka-tabs-indicator-size)
    group-aria-[orientation=vertical]/tabs-list:translate-y-(--reka-tabs-indicator-position)
  `,
  {
    variants: {
      variant: {
        pill: `
          bg-background shadow-shadow-sm
          dark:bg-input/30
          group-aria-[orientation=horizontal]/tabs-list:top-1
          group-aria-[orientation=horizontal]/tabs-list:h-(--reka-tabs-indicator-thickness)
          group-aria-[orientation=vertical]/tabs-list:left-1
          group-aria-[orientation=vertical]/tabs-list:w-(--reka-tabs-indicator-thickness)
        `,
        line: `
          rounded-full bg-tone
          group-aria-[orientation=horizontal]/tabs-list:-bottom-px group-aria-[orientation=horizontal]/tabs-list:h-0.5
          group-aria-[orientation=vertical]/tabs-list:-end-px group-aria-[orientation=vertical]/tabs-list:w-0.5
        `,
      },
      size: { xs: "", sm: "", md: "", lg: "", xl: "" },
    },
    compoundVariants: [{ variant: "pill", class: pillInnerRadius }],
    defaultVariants: { variant: "pill", size: "md" },
  },
);

export const tabsTrigger = `
  relative z-1 inline-flex h-(--tabs-trigger-height) shrink-0 items-center justify-center gap-(--tabs-trigger-gap)
  rounded-md px-(--tabs-trigger-px) whitespace-nowrap text-muted-foreground outline-none transition-colors
  duration-short-4 ease-standard
  hover:text-foreground
  focus-visible:focus-ring
  data-[state=active]:text-foreground
  data-disabled:pointer-events-none data-disabled:text-foreground/(--disabled-opacity)
  data-[orientation=vertical]:justify-start
  data-[orientation=horizontal]:group-data-[variant=pill]/tabs-list:flex-1
  group-data-[variant=pill]/tabs-list:rounded-[max(0px,calc(var(--tabs-radius)-var(--spacing)))]
  [&_svg]:pointer-events-none [&_svg]:shrink-0
  icon-size-(--tabs-icon)
`;

export const tabsContent = "flex-1 rounded-md outline-none focus-visible:focus-ring";

export type TabsListVariants = VariantProps<typeof tabsListVariants>;
