import { type VariantProps, cva } from "class-variance-authority";

export { default as DrawerMenu } from "./DrawerMenu.vue";
export { default as DrawerMenuCheckboxItem } from "./DrawerMenuCheckboxItem.vue";
export { default as DrawerMenuGroup } from "./DrawerMenuGroup.vue";
export { default as DrawerMenuItem } from "./DrawerMenuItem.vue";
export { default as DrawerMenuLabel } from "./DrawerMenuLabel.vue";
export { default as DrawerMenuRadioGroup } from "./DrawerMenuRadioGroup.vue";
export { default as DrawerMenuRadioItem } from "./DrawerMenuRadioItem.vue";
export { default as DrawerMenuSeparator } from "./DrawerMenuSeparator.vue";
export { default as DrawerMenuSub } from "./DrawerMenuSub.vue";
export { default as DrawerMenuSubContent } from "./DrawerMenuSubContent.vue";
export { default as DrawerMenuSubTrigger } from "./DrawerMenuSubTrigger.vue";

export const drawerMenuVariants = cva(
  "group/drawer-menu drawer-menu min-h-0 px-(--menu-pad) [--drawer-menu-gap:--spacing(0.5)]",
  {
    variants: {
      size: {
        sm: `
          text-body-md [--menu-pad:--spacing(2)] [--menu-item-height:--spacing(10)] [--menu-item-px:--spacing(3)]
          [--menu-item-py:--spacing(2)] [--menu-item-gap:--spacing(3)] [--menu-icon:--spacing(4)]
        `,
        md: `
          text-body-lg [--menu-pad:--spacing(2)] [--menu-item-height:--spacing(12)] [--menu-item-px:--spacing(4)]
          [--menu-item-py:--spacing(3)] [--menu-item-gap:--spacing(4)] [--menu-icon:--spacing(5)]
        `,
        lg: `
          text-body-lg [--menu-pad:--spacing(2)] [--menu-item-height:--spacing(14)] [--menu-item-px:--spacing(4)]
          [--menu-item-py:--spacing(3)] [--menu-item-gap:--spacing(4)] [--menu-icon:--spacing(6)]
        `,
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export type DrawerMenuSize = NonNullable<VariantProps<typeof drawerMenuVariants>["size"]>;

export const drawerMenuItem = `
  group/drawer-menu-item relative flex min-h-(--menu-item-height) cursor-default items-center gap-(--menu-item-gap)
  rounded-lg px-(--menu-item-px) py-(--menu-item-py) outline-none select-none
  focus-visible:focus-ring-inset
  before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-foreground
  before:opacity-0 before:transition-opacity before:duration-short-2 before:ease-standard
  data-highlighted:before:opacity-(--state-hover)
  active:before:opacity-(--state-pressed)
  data-disabled:pointer-events-none data-disabled:text-foreground/(--disabled-opacity)
  data-inset:ps-[calc(var(--menu-item-px)*2+var(--menu-icon))]
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

export const drawerMenuIndicatorItem = `${drawerMenuItem} ps-[calc(var(--menu-item-px)*2+var(--menu-icon))]`;

export const drawerMenuIndicator = `
  pointer-events-none absolute start-(--menu-item-px) flex size-(--menu-icon) items-center justify-center text-primary
  group-data-disabled/drawer-menu-item:text-foreground/(--disabled-opacity)
`;

export const drawerMenuRadioDot = "size-[calc(var(--menu-icon)/2)] rounded-full bg-current";

export const drawerMenuLabel = `
  px-(--menu-item-px) pt-(--menu-item-py) pb-1 text-label-lg text-muted-foreground
  group-data-[size=sm]/drawer-menu:text-label-md
  data-inset:ps-[calc(var(--menu-item-px)*2+var(--menu-icon))]
`;

export const drawerMenuSeparator = "-mx-(--menu-pad) my-(--menu-pad) h-px shrink-0 bg-border";

export const drawerMenuBack = `${drawerMenuItem} font-medium`;
