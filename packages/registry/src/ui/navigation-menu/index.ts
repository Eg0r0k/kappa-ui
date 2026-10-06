import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { Ref } from "vue";

import { overlaySurface } from "@/ui/popover";

export { default as NavigationMenu } from "./NavigationMenu.vue";
export { default as NavigationMenuContent } from "./NavigationMenuContent.vue";
export { default as NavigationMenuIndicator } from "./NavigationMenuIndicator.vue";
export { default as NavigationMenuItem } from "./NavigationMenuItem.vue";
export { default as NavigationMenuLink } from "./NavigationMenuLink.vue";
export { default as NavigationMenuList } from "./NavigationMenuList.vue";
export { default as NavigationMenuTrigger } from "./NavigationMenuTrigger.vue";
export { default as NavigationMenuViewport } from "./NavigationMenuViewport.vue";

const sizes = {
  xs: "text-label-sm [--nav-pad:--spacing(1)] [--nav-radius:--theme(--radius-md)] [--nav-item-height:var(--control-height-xs)] [--nav-item-px:var(--control-padding-xs)] [--nav-gap:var(--control-gap-xs)] [--nav-icon:var(--control-icon-xs)]",
  sm: "text-label-md [--nav-pad:--spacing(1.5)] [--nav-radius:--theme(--radius-lg)] [--nav-item-height:var(--control-height-sm)] [--nav-item-px:var(--control-padding-sm)] [--nav-gap:var(--control-gap-sm)] [--nav-icon:var(--control-icon-sm)]",
  md: "text-label-lg [--nav-pad:--spacing(1.5)] [--nav-radius:--theme(--radius-lg)] [--nav-item-height:var(--control-height-md)] [--nav-item-px:var(--control-padding-md)] [--nav-gap:var(--control-gap-md)] [--nav-icon:var(--control-icon-md)]",
  lg: "text-label-lg [--nav-pad:--spacing(1.5)] [--nav-radius:--theme(--radius-lg)] [--nav-item-height:var(--control-height-lg)] [--nav-item-px:var(--control-padding-lg)] [--nav-gap:var(--control-gap-lg)] [--nav-icon:var(--control-icon-lg)]",
  xl: "text-title-md [--nav-pad:--spacing(1.5)] [--nav-radius:--theme(--radius-xl)] [--nav-item-height:var(--control-height-xl)] [--nav-item-px:var(--control-padding-xl)] [--nav-gap:var(--control-gap-xl)] [--nav-icon:var(--control-icon-xl)]",
};

export const navigationMenuVariants = cva(
  `
    group/navigation-menu relative flex max-w-max flex-1 items-center
    data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch
  `,
  {
    variants: {
      size: sizes,
      variant: { ghost: "", link: "" },
    },
    defaultVariants: { size: "md", variant: "ghost" },
  },
);

export type NavigationMenuVariants = VariantProps<typeof navigationMenuVariants>;
export type NavigationMenuSize = NonNullable<NavigationMenuVariants["size"]>;
export type NavigationMenuVariant = NonNullable<NavigationMenuVariants["variant"]>;

/** The look of a top-level trigger or link. Use it to give your own element the same look. */
export const navigationMenuTriggerStyle = cva(
  `
    group/navigation-menu-trigger relative inline-flex h-(--nav-item-height) w-max shrink-0 cursor-pointer items-center
    justify-center gap-(--nav-gap) rounded-(--nav-radius) px-(--nav-item-px) whitespace-nowrap text-muted-foreground
    outline-none transition-colors duration-short-3 ease-standard select-none
    hover:text-foreground
    focus-visible:focus-ring
    data-active:text-foreground
    data-[state=open]:text-foreground
    disabled:pointer-events-none disabled:text-foreground/(--disabled-opacity)
    aria-disabled:cursor-default aria-disabled:text-foreground/(--disabled-opacity)
    group-data-[orientation=vertical]/navigation-menu:w-full
    group-data-[orientation=vertical]/navigation-menu:justify-start
    [&_svg]:pointer-events-none [&_svg]:shrink-0
    icon-size-(--nav-icon)
  `,
  {
    variants: {
      variant: {
        ghost: `
          state-layer
          data-active:before:opacity-(--state-selected)
          data-[state=open]:before:opacity-(--state-hover)
        `,
        link: `underline-offset-4 hover:underline data-active:underline aria-disabled:hover:no-underline`,
      },
      size: sizes,
    },
    defaultVariants: { variant: "ghost", size: "md" },
  },
);

/** A link inside a panel: a title with an optional description under it, or a row when it starts with an icon. */
export const navigationMenuPanelLink = `
  relative flex min-h-(--nav-item-height) cursor-pointer flex-col justify-center gap-1 rounded-(--nav-radius)
  px-(--nav-item-px) py-2 text-foreground outline-none state-layer select-none
  focus-visible:focus-ring-inset
  has-[>svg]:flex-row has-[>svg]:items-center has-[>svg]:justify-start has-[>svg]:gap-(--nav-gap)
  data-active:before:opacity-(--state-selected)
  aria-disabled:cursor-default aria-disabled:text-foreground/(--disabled-opacity)
  [&_svg]:pointer-events-none [&_svg]:shrink-0
  icon-size-(--nav-icon)
  [&_svg:not([class*=text-])]:text-muted-foreground
`;

export const navigationMenuChevron = `
  transition-transform duration-short-4 ease-standard
  motion-reduce:transition-none
  group-data-[orientation=horizontal]/navigation-menu:group-data-[state=open]/navigation-menu-trigger:rotate-180
  group-data-[orientation=vertical]/navigation-menu:ms-auto group-data-[orientation=vertical]/navigation-menu:-rotate-90
  rtl:group-data-[orientation=vertical]/navigation-menu:rotate-90
`;

/* Panels are as wide as their content. Reka keeps the viewport 10px from either edge of the page, so a
   panel never grows past the page width minus those 20px. */
const panelWidth = "w-max max-w-[calc(100vw-20px)]";

export const navigationMenuContent = {
  viewport: `absolute top-0 start-0 ${panelWidth} p-(--nav-pad) navigation-menu-motion`,
  inline: `
    ${overlaySurface} absolute ${panelWidth} p-(--nav-pad) origin-top [--overlay-y:-0.25rem]
    group-data-[orientation=horizontal]/navigation-menu:start-0 group-data-[orientation=horizontal]/navigation-menu:top-full
    group-data-[orientation=horizontal]/navigation-menu:mt-1
    group-data-[orientation=vertical]/navigation-menu:start-full group-data-[orientation=vertical]/navigation-menu:top-0
    group-data-[orientation=vertical]/navigation-menu:ms-1 group-data-[orientation=vertical]/navigation-menu:[--overlay-y:0]
    group-data-[orientation=vertical]/navigation-menu:[--overlay-x:-0.25rem]
    rtl:group-data-[orientation=vertical]/navigation-menu:[--overlay-x:0.25rem]
  `,
};

export const navigationMenuViewportWrapper = `
  absolute z-50 isolate
  group-data-[orientation=horizontal]/navigation-menu:inset-x-0
  group-data-[orientation=horizontal]/navigation-menu:top-full
  group-data-[orientation=vertical]/navigation-menu:start-full group-data-[orientation=vertical]/navigation-menu:top-0
`;

/* Reka's viewport position is physical (left and top), so horizontal panels use `left`. Reka sizes and places
   the viewport from the panel's own size, so the edge is an inset outline, which adds no width, not a border. */
export const navigationMenuViewport = `
  ${overlaySurface}
  absolute border-0 outline-1 -outline-offset-1 outline-surface-border outline-solid
  h-(--reka-navigation-menu-viewport-height) w-(--reka-navigation-menu-viewport-width) overflow-hidden
  transition-[width,height,left,top] duration-short-4 ease-standard
  motion-reduce:transition-none
  group-data-[orientation=horizontal]/navigation-menu:top-0
  group-data-[orientation=horizontal]/navigation-menu:left-(--reka-navigation-menu-viewport-left)
  group-data-[orientation=horizontal]/navigation-menu:mt-1
  group-data-[orientation=horizontal]/navigation-menu:origin-top
  group-data-[orientation=horizontal]/navigation-menu:[--overlay-y:-0.25rem]
  group-data-[orientation=vertical]/navigation-menu:start-0
  group-data-[orientation=vertical]/navigation-menu:top-(--reka-navigation-menu-viewport-top)
  group-data-[orientation=vertical]/navigation-menu:ms-1
  group-data-[orientation=vertical]/navigation-menu:[--overlay-x:-0.25rem]
  rtl:group-data-[orientation=vertical]/navigation-menu:[--overlay-x:0.25rem]
`;

/* The indicator sits in the 4px gap between the list and the panel and reaches 2px into the panel, so its
   arrow touches the panel's edge. */
export const navigationMenuIndicator = `
  pointer-events-none absolute z-51 flex transition-[translate,width,height,opacity] duration-short-4 ease-standard
  motion-reduce:transition-none
  data-[state=hidden]:opacity-0
  data-[orientation=horizontal]:top-full data-[orientation=horizontal]:left-0 data-[orientation=horizontal]:h-1.5
  data-[orientation=horizontal]:w-(--reka-navigation-menu-indicator-size)
  data-[orientation=horizontal]:translate-x-(--reka-navigation-menu-indicator-position)
  data-[orientation=horizontal]:items-end data-[orientation=horizontal]:justify-center
  data-[orientation=vertical]:start-full data-[orientation=vertical]:top-0 data-[orientation=vertical]:w-1.5
  data-[orientation=vertical]:h-(--reka-navigation-menu-indicator-size)
  data-[orientation=vertical]:translate-y-(--reka-navigation-menu-indicator-position)
  data-[orientation=vertical]:items-center data-[orientation=vertical]:justify-end
`;

export const navigationMenuArrow = `
  shrink-0 bg-border
  group-data-[orientation=horizontal]/navigation-menu-indicator:h-1.5
  group-data-[orientation=horizontal]/navigation-menu-indicator:w-3
  group-data-[orientation=horizontal]/navigation-menu-indicator:[clip-path:polygon(50%_0,100%_100%,0_100%)]
  group-data-[orientation=vertical]/navigation-menu-indicator:h-3
  group-data-[orientation=vertical]/navigation-menu-indicator:w-1.5
  group-data-[orientation=vertical]/navigation-menu-indicator:[clip-path:polygon(0_50%,100%_0,100%_100%)]
  rtl:group-data-[orientation=vertical]/navigation-menu-indicator:[clip-path:polygon(100%_50%,0_0,0_100%)]
`;

export interface NavigationMenuContext {
  size: Ref<NavigationMenuSize>;
  variant: Ref<NavigationMenuVariant>;
  viewport: Ref<boolean>;
  dir: Ref<"ltr" | "rtl">;
}

export const [injectNavigationMenuContext, provideNavigationMenuContext] =
  createContext<NavigationMenuContext>("NavigationMenu");

/** Set by NavigationMenuContent, so a link inside a panel takes the panel-link look. */
export const [injectNavigationMenuInContent, provideNavigationMenuInContent] =
  createContext<boolean>("NavigationMenuContent");

/* Reka finds the open trigger with `id.includes(value)`, so values such as `docs` and `docs-api` (or `a`,
   which every generated id contains) match the wrong trigger. Wrapping each value in colons, which
   encodeURIComponent never leaves in a value, makes one value never contain another.
   Drop when Reka compares whole values. */
export const encodeValue = (value: string | undefined) => (value ? `:${encodeURIComponent(value)}:` : "");

export const decodeValue = (value: string | undefined) =>
  value && value.startsWith(":") && value.endsWith(":") && value.length > 1
    ? decodeURIComponent(value.slice(1, -1))
    : (value ?? "");
