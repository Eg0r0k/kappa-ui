import { createContext } from "@kappa-ui/core/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type { Ref } from "vue";

export { default as ContextMenu } from "./ContextMenu.vue";
export { default as ContextMenuCheckboxItem } from "./ContextMenuCheckboxItem.vue";
export { default as ContextMenuContent } from "./ContextMenuContent.vue";
export { default as ContextMenuGroup } from "./ContextMenuGroup.vue";
export { default as ContextMenuItem } from "./ContextMenuItem.vue";
export { default as ContextMenuLabel } from "./ContextMenuLabel.vue";
export { default as ContextMenuRadioGroup } from "./ContextMenuRadioGroup.vue";
export { default as ContextMenuRadioItem } from "./ContextMenuRadioItem.vue";
export { default as ContextMenuSeparator } from "./ContextMenuSeparator.vue";
export { default as ContextMenuShortcut } from "./ContextMenuShortcut.vue";
export { default as ContextMenuSub } from "./ContextMenuSub.vue";
export { default as ContextMenuSubContent } from "./ContextMenuSubContent.vue";
export { default as ContextMenuSubTrigger } from "./ContextMenuSubTrigger.vue";
export { default as ContextMenuTrigger } from "./ContextMenuTrigger.vue";

export const contextMenuSizeVariants = cva("group/menu p-(--menu-pad)", {
  variants: {
    size: {
      xs: "rounded-lg text-body-sm [--menu-pad:--spacing(0.5)] [--menu-item-height:--spacing(7)] [--menu-item-px:--spacing(2)] [--menu-item-py:--spacing(1.5)] [--menu-item-gap:--spacing(2)] [--menu-icon:--spacing(3.5)]",
      sm: "text-body-sm [--menu-pad:--spacing(1)] [--menu-item-height:--spacing(8)] [--menu-item-px:--spacing(2.5)] [--menu-item-py:--spacing(2)] [--menu-item-gap:--spacing(2.5)] [--menu-icon:--spacing(4)]",
      md: "text-body-md [--menu-pad:--spacing(1)] [--menu-item-height:--spacing(9)] [--menu-item-px:--spacing(3)] [--menu-item-py:--spacing(2)] [--menu-item-gap:--spacing(3)] [--menu-icon:--spacing(4)]",
      lg: "text-body-lg [--menu-pad:--spacing(1)] [--menu-item-height:--spacing(10)] [--menu-item-px:--spacing(3)] [--menu-item-py:--spacing(2)] [--menu-item-gap:--spacing(3)] [--menu-icon:--spacing(5)]",
      xl: "text-body-lg [--menu-pad:--spacing(1)] [--menu-item-height:--spacing(12)] [--menu-item-px:--spacing(4)] [--menu-item-py:--spacing(3)] [--menu-item-gap:--spacing(3)] [--menu-icon:--spacing(5)]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ContextMenuSize = NonNullable<VariantProps<typeof contextMenuSizeVariants>["size"]>;

export const [injectContextMenuSize, provideContextMenuSize] =
  createContext<Ref<ContextMenuSize>>("ContextMenuContent");

const indicatorInset = "ps-[calc(var(--menu-item-px)*2+var(--menu-icon))]";

export const contextMenuItem = `group/menu-item relative flex min-h-(--menu-item-height) cursor-default items-center gap-(--menu-item-gap) rounded-lg group-data-[size=xs]/menu:rounded-md px-(--menu-item-px) py-(--menu-item-py) outline-none select-none focus-visible:focus-ring-inset before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-foreground before:opacity-0 before:transition-opacity before:duration-short-2 before:ease-standard data-highlighted:before:opacity-(--state-hover) active:before:opacity-(--state-pressed) data-disabled:pointer-events-none data-disabled:text-foreground/(--disabled-opacity) data-inset:ps-[calc(var(--menu-item-px)*2+var(--menu-icon))] data-[variant=destructive]:text-destructive data-[variant=destructive]:before:bg-destructive forced-colors:before:hidden forced-colors:data-highlighted:outline-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-(--menu-icon) [&>svg:not([class*=text-])]:text-muted-foreground data-[variant=destructive]:[&>svg:not([class*=text-])]:text-destructive data-disabled:[&>svg:not([class*=text-])]:text-foreground/(--disabled-opacity)`;

export const contextMenuIndicatorItem = `${contextMenuItem} ${indicatorInset}`;

export const contextMenuIndicator =
  "pointer-events-none absolute start-(--menu-item-px) flex size-(--menu-icon) items-center justify-center text-primary group-data-disabled/menu-item:text-foreground/(--disabled-opacity)";

export const contextMenuRadioDot = "size-[calc(var(--menu-icon)/2)] rounded-full bg-current";

const labelText =
  "text-label-md group-data-[size=xs]/menu:text-label-sm group-data-[size=sm]/menu:text-label-sm group-data-[size=lg]/menu:text-label-lg group-data-[size=xl]/menu:text-label-lg";

export const contextMenuLabel = `px-(--menu-item-px) pt-(--menu-item-py) pb-1 ${labelText} text-muted-foreground data-inset:ps-[calc(var(--menu-item-px)*2+var(--menu-icon))]`;

export const contextMenuSeparator = "-mx-(--menu-pad) my-(--menu-pad) h-px shrink-0 bg-border";

export const contextMenuShortcut = `ms-auto ps-4 ${labelText} tracking-wider text-muted-foreground`;

export const contextMenuSubTrigger = `${contextMenuItem} data-[state=open]:before:opacity-(--state-hover)`;
