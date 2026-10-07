import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { Ref } from "vue";

export { default as Menu } from "./Menu.vue";
export { default as MenuCheckboxItem } from "./MenuCheckboxItem.vue";
export { default as MenuGroup } from "./MenuGroup.vue";
export { default as MenuItem } from "./MenuItem.vue";
export { default as MenuLabel } from "./MenuLabel.vue";
export { default as MenuRadioGroup } from "./MenuRadioGroup.vue";
export { default as MenuRadioItem } from "./MenuRadioItem.vue";
export { default as MenuSeparator } from "./MenuSeparator.vue";
export { default as MenuShortcut } from "./MenuShortcut.vue";
export { default as MenuSub } from "./MenuSub.vue";
export { default as MenuSubContent } from "./MenuSubContent.vue";
export { default as MenuSubTrigger } from "./MenuSubTrigger.vue";
export { default as MenuTrigger } from "./MenuTrigger.vue";
export type { MenuOrigin, MenuPosition } from "./position";

export const menuTriggers = new WeakSet<Element>();

export const menuSizeVariants = cva("group/menu p-(--menu-pad)", {
  variants: {
    size: {
      xs: `
        rounded-lg text-body-sm [--menu-pad:--spacing(0.5)] [--menu-item-height:var(--control-height-xs)]
        [--menu-item-px:var(--control-padding-xs)] [--menu-item-py:--spacing(1.5)]
        [--menu-item-gap:var(--control-gap-xs)] [--menu-icon:var(--control-icon-xs)]
      `,
      sm: `
        text-body-sm [--menu-pad:--spacing(1)] [--menu-item-height:var(--control-height-sm)]
        [--menu-item-px:var(--control-padding-sm)] [--menu-item-py:--spacing(2)] [--menu-item-gap:var(--control-gap-sm)]
        [--menu-icon:var(--control-icon-sm)]
      `,
      md: `
        text-body-md [--menu-pad:--spacing(1)] [--menu-item-height:var(--control-height-md)]
        [--menu-item-px:var(--control-padding-md)] [--menu-item-py:--spacing(2)] [--menu-item-gap:var(--control-gap-md)]
        [--menu-icon:var(--control-icon-md)]
      `,
      lg: `
        text-body-lg [--menu-pad:--spacing(1)] [--menu-item-height:var(--control-height-lg)]
        [--menu-item-px:var(--control-padding-lg)] [--menu-item-py:--spacing(2)] [--menu-item-gap:var(--control-gap-lg)]
        [--menu-icon:var(--control-icon-lg)]
      `,
      xl: `
        text-body-lg [--menu-pad:--spacing(1)] [--menu-item-height:var(--control-height-xl)]
        [--menu-item-px:var(--control-padding-xl)] [--menu-item-py:--spacing(3)] [--menu-item-gap:var(--control-gap-xl)]
        [--menu-icon:var(--control-icon-xl)]
      `,
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type MenuSize = NonNullable<VariantProps<typeof menuSizeVariants>["size"]>;

export const [injectMenuSize, provideMenuSize] = createContext<Ref<MenuSize>>("MenuContent");

const indicatorInset = "ps-[calc(var(--menu-item-px)+var(--menu-icon)+var(--menu-item-gap))]";

export const menuItem = `
  group/menu-item relative flex min-h-(--menu-item-height) cursor-default items-center gap-(--menu-item-gap) rounded-lg
  group-data-[size=xs]/menu:rounded-md
  px-(--menu-item-px) py-(--menu-item-py) outline-none select-none
  focus-visible:focus-ring-inset
  before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-foreground
  before:opacity-0 before:transition-opacity before:duration-short-2 before:ease-standard
  data-highlighted:before:opacity-(--state-hover)
  active:not-has-[>[data-slot=ripple]>*]:before:opacity-(--state-pressed)
  data-disabled:pointer-events-none data-disabled:text-foreground/(--disabled-opacity)
  data-inset:ps-[calc(var(--menu-item-px)+var(--menu-icon)+var(--menu-item-gap))]
  data-[variant=destructive]:text-destructive
  data-[variant=destructive]:before:bg-destructive
  forced-colors:before:hidden
  forced-colors:data-highlighted:outline-2
  [&_svg]:pointer-events-none [&_svg]:shrink-0
  icon-size-(--menu-icon)
  [&>svg:not([class*=text-])]:text-muted-foreground
  data-[variant=destructive]:[&>svg:not([class*=text-])]:text-destructive
  data-disabled:[&>svg:not([class*=text-])]:text-foreground/(--disabled-opacity)
`;

export const menuIndicatorItem = `${menuItem} ${indicatorInset}`;

export const menuIndicator = `
  pointer-events-none absolute start-(--menu-item-px) flex size-(--menu-icon) items-center justify-center text-primary
  group-data-disabled/menu-item:text-foreground/(--disabled-opacity)
`;

export const menuRadioDot = "size-[calc(var(--menu-icon)/2)] rounded-full bg-current";

const labelText = `
  text-label-md
  group-data-[size=xs]/menu:text-label-sm
  group-data-[size=sm]/menu:text-label-sm
  group-data-[size=lg]/menu:text-label-lg
  group-data-[size=xl]/menu:text-label-lg
`;

export const menuLabel = `px-(--menu-item-px) pt-(--menu-item-py) pb-1 ${labelText} text-muted-foreground data-inset:ps-[calc(var(--menu-item-px)+var(--menu-icon)+var(--menu-item-gap))]`;

export const menuSeparator = "-mx-(--menu-pad) my-(--menu-pad) h-px shrink-0 bg-border";

export const menuShortcut = `ms-auto ps-4 ${labelText} tracking-wider text-muted-foreground`;

export const menuSubTrigger = `${menuItem} data-[state=open]:before:opacity-(--state-hover)`;
