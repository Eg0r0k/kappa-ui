import { type VariantProps, cva } from "class-variance-authority";

export { default as Tabs } from "./Tabs.vue";
export { default as TabsContent } from "./TabsContent.vue";
export { default as TabsList } from "./TabsList.vue";
export { default as TabsTrigger } from "./TabsTrigger.vue";

const sizes = {
  xs: "text-label-sm [--tabs-trigger-height:--spacing(7)] [--tabs-trigger-px:--spacing(2)] [--tabs-trigger-gap:--spacing(1.5)] [--tabs-icon:--spacing(3.5)]",
  sm: "text-label-md [--tabs-trigger-height:--spacing(8)] [--tabs-trigger-px:--spacing(2.5)] [--tabs-trigger-gap:--spacing(2)] [--tabs-icon:--spacing(4)]",
  md: "text-label-md [--tabs-trigger-height:--spacing(9)] [--tabs-trigger-px:--spacing(3)] [--tabs-trigger-gap:--spacing(2)] [--tabs-icon:--spacing(4)]",
  lg: "text-label-lg [--tabs-trigger-height:--spacing(10)] [--tabs-trigger-px:--spacing(3)] [--tabs-trigger-gap:--spacing(2)] [--tabs-icon:--spacing(5)]",
  xl: "text-label-lg [--tabs-trigger-height:--spacing(12)] [--tabs-trigger-px:--spacing(4)] [--tabs-trigger-gap:--spacing(2.5)] [--tabs-icon:--spacing(5)]",
};

export const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit shrink-0 items-center aria-[orientation=vertical]:flex-col aria-[orientation=vertical]:items-stretch",
  {
    variants: {
      variant: {
        pill: "bg-muted p-1",
        line: "aria-[orientation=horizontal]:border-b aria-[orientation=vertical]:border-e",
      },
      size: sizes,
    },
    compoundVariants: [
      { variant: "pill", size: "xs", class: "rounded-md" },
      { variant: "pill", size: ["sm", "md"], class: "rounded-lg" },
      { variant: "pill", size: ["lg", "xl"], class: "rounded-xl" },
    ],
    defaultVariants: { variant: "pill", size: "md" },
  },
);

export const tabsIndicatorVariants = cva(
  "pointer-events-none absolute transition-[translate,width,height] duration-short-4 ease-standard motion-reduce:transition-none group-aria-[orientation=horizontal]/tabs-list:left-0 group-aria-[orientation=horizontal]/tabs-list:w-(--reka-tabs-indicator-size) group-aria-[orientation=horizontal]/tabs-list:translate-x-(--reka-tabs-indicator-position) group-aria-[orientation=vertical]/tabs-list:top-0 group-aria-[orientation=vertical]/tabs-list:h-(--reka-tabs-indicator-size) group-aria-[orientation=vertical]/tabs-list:translate-y-(--reka-tabs-indicator-position)",
  {
    variants: {
      variant: {
        pill: "bg-background shadow-sm group-aria-[orientation=horizontal]/tabs-list:top-1 group-aria-[orientation=horizontal]/tabs-list:h-(--reka-tabs-indicator-thickness) group-aria-[orientation=vertical]/tabs-list:left-1 group-aria-[orientation=vertical]/tabs-list:w-(--reka-tabs-indicator-thickness)",
        line: "rounded-full bg-primary group-aria-[orientation=horizontal]/tabs-list:-bottom-px group-aria-[orientation=horizontal]/tabs-list:h-0.5 group-aria-[orientation=vertical]/tabs-list:-end-px group-aria-[orientation=vertical]/tabs-list:w-0.5",
      },
      size: { xs: "", sm: "", md: "", lg: "", xl: "" },
    },
    compoundVariants: [
      { variant: "pill", size: "xs", class: "rounded-sm" },
      { variant: "pill", size: ["sm", "md"], class: "rounded-md" },
      { variant: "pill", size: ["lg", "xl"], class: "rounded-lg" },
    ],
    defaultVariants: { variant: "pill", size: "md" },
  },
);

export const tabsTrigger =
  "relative z-1 inline-flex h-(--tabs-trigger-height) shrink-0 items-center justify-center gap-(--tabs-trigger-gap) rounded-md px-(--tabs-trigger-px) whitespace-nowrap text-muted-foreground outline-none transition-colors duration-short-4 ease-standard hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=active]:text-foreground data-disabled:pointer-events-none data-disabled:text-foreground/(--disabled-opacity) data-[orientation=vertical]:justify-start group-data-[variant=pill]/tabs-list:flex-1 group-data-[size=xs]/tabs-list:rounded-sm group-data-[size=lg]/tabs-list:rounded-lg group-data-[size=xl]/tabs-list:rounded-lg [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-(--tabs-icon)";

export const tabsContent = "flex-1 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

export type TabsListVariants = VariantProps<typeof tabsListVariants>;
