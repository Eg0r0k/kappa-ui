import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { Ref } from "vue";

import type { MenuSize } from "@/ui/menu";

export { default as Menubar } from "./Menubar.vue";
export { default as MenubarCheckboxItem } from "./MenubarCheckboxItem.vue";
export { default as MenubarContent } from "./MenubarContent.vue";
export { default as MenubarGroup } from "./MenubarGroup.vue";
export { default as MenubarItem } from "./MenubarItem.vue";
export { default as MenubarItemIndicator } from "./MenubarItemIndicator.vue";
export { default as MenubarLabel } from "./MenubarLabel.vue";
export { default as MenubarMenu } from "./MenubarMenu.vue";
export { default as MenubarRadioGroup } from "./MenubarRadioGroup.vue";
export { default as MenubarRadioItem } from "./MenubarRadioItem.vue";
export { default as MenubarSeparator } from "./MenubarSeparator.vue";
export { default as MenubarShortcut } from "./MenubarShortcut.vue";
export { default as MenubarSub } from "./MenubarSub.vue";
export { default as MenubarSubContent } from "./MenubarSubContent.vue";
export { default as MenubarSubTrigger } from "./MenubarSubTrigger.vue";
export { default as MenubarTrigger } from "./MenubarTrigger.vue";

export type MenubarSize = MenuSize;

export const menubarVariants = cva("group/menubar flex w-fit items-center gap-1", {
  variants: {
    variant: {
      outline: "rounded-outset-(--menubar-radius)/[calc(var(--spacing)+1px)] border border-border bg-background p-1",
      soft: "rounded-outset-(--menubar-radius)/1 bg-muted p-1",
      ghost: "",
    },
    size: {
      xs: `
        [--menubar-radius:--theme(--radius-control-xs)] [--menubar-h:var(--control-height-xs)]
        [--menubar-px:var(--control-padding-xs)] [--menubar-gap:var(--control-gap-xs)]
        [--menubar-icon:var(--control-icon-xs)] [--menubar-text:var(--typescale-label-sm-size)]
        [--menubar-text-leading:var(--typescale-label-sm-line-height)]
      `,
      sm: `
        [--menubar-radius:--theme(--radius-control-sm)] [--menubar-h:var(--control-height-sm)]
        [--menubar-px:var(--control-padding-sm)] [--menubar-gap:var(--control-gap-sm)]
        [--menubar-icon:var(--control-icon-sm)] [--menubar-text:var(--typescale-label-md-size)]
        [--menubar-text-leading:var(--typescale-label-md-line-height)]
      `,
      md: `
        [--menubar-radius:--theme(--radius-control-md)] [--menubar-h:var(--control-height-md)]
        [--menubar-px:var(--control-padding-md)] [--menubar-gap:var(--control-gap-md)]
        [--menubar-icon:var(--control-icon-md)] [--menubar-text:var(--typescale-label-lg-size)]
        [--menubar-text-leading:var(--typescale-label-lg-line-height)]
      `,
      lg: `
        [--menubar-radius:--theme(--radius-control-lg)] [--menubar-h:var(--control-height-lg)]
        [--menubar-px:var(--control-padding-lg)] [--menubar-gap:var(--control-gap-lg)]
        [--menubar-icon:var(--control-icon-lg)] [--menubar-text:var(--typescale-label-lg-size)]
        [--menubar-text-leading:var(--typescale-label-lg-line-height)]
      `,
      xl: `
        [--menubar-radius:--theme(--radius-control-xl)] [--menubar-h:var(--control-height-xl)]
        [--menubar-px:var(--control-padding-xl)] [--menubar-gap:var(--control-gap-xl)]
        [--menubar-icon:var(--control-icon-xl)] [--menubar-text:var(--typescale-title-md-size)]
        [--menubar-text-leading:var(--typescale-title-md-line-height)]
      `,
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

export type MenubarVariants = VariantProps<typeof menubarVariants>;

export const menubarTrigger = `
  relative inline-flex h-(--menubar-h) shrink-0 cursor-default items-center gap-(--menubar-gap)
  rounded-(--menubar-radius) px-(--menubar-px) text-(length:--menubar-text)/(--menubar-leading) font-medium
  whitespace-nowrap text-foreground outline-none select-none state-layer
  focus-visible:focus-ring-inset
  data-[state=open]:before:opacity-(--state-hover)
  data-disabled:pointer-events-none data-disabled:text-foreground/(--disabled-opacity)
  forced-colors:data-[state=open]:outline-2
  [&_svg]:pointer-events-none [&_svg]:shrink-0
  icon-size-(--menubar-icon)
`;

export const menubarContent = `
  flex max-h-(--reka-menubar-content-available-height) min-w-32 flex-col gap-0.5 overflow-x-hidden overflow-y-auto
  origin-(--reka-menubar-content-transform-origin)
`;

// Menus are portaled to the end of the page, so Tab from one would skip everything after the bar. Moving focus
// to the trigger first makes Tab and Shift+Tab continue from the bar, as they do from a closed menu.
export const tabFromTrigger = (event: KeyboardEvent, trigger: HTMLElement | undefined) => {
  if (event.key !== "Tab" || event.defaultPrevented || !trigger) return;
  trigger.focus();
  // Reka's roving focus only lets Shift+Tab step out of the bar when the keydown comes from a trigger
  if (event.shiftKey)
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }));
};

export const [injectMenubarSize, provideMenubarSize] = createContext<Ref<MenubarSize>>("Menubar");
