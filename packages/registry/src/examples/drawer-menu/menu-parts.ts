import type { Component } from "vue";

import {
  DrawerMenuCheckboxItem,
  DrawerMenuGroup,
  DrawerMenuItem,
  DrawerMenuLabel,
  DrawerMenuRadioGroup,
  DrawerMenuRadioItem,
  DrawerMenuSeparator,
  DrawerMenuSub,
  DrawerMenuSubContent,
  DrawerMenuSubTrigger,
} from "@/ui/drawer-menu";
import {
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "@/ui/menu";

export interface MenuPartSet {
  Item: Component;
  Separator: Component;
  Label: Component;
  Group: Component;
  Sub: Component;
  SubTrigger: Component;
  SubContent: Component;
  RadioGroup: Component;
  RadioItem: Component;
  CheckboxItem: Component;
}

export const menuParts: MenuPartSet = {
  Item: MenuItem,
  Separator: MenuSeparator,
  Label: MenuLabel,
  Group: MenuGroup,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  CheckboxItem: MenuCheckboxItem,
};

export const sheetParts: MenuPartSet = {
  Item: DrawerMenuItem,
  Separator: DrawerMenuSeparator,
  Label: DrawerMenuLabel,
  Group: DrawerMenuGroup,
  Sub: DrawerMenuSub,
  SubTrigger: DrawerMenuSubTrigger,
  SubContent: DrawerMenuSubContent,
  RadioGroup: DrawerMenuRadioGroup,
  RadioItem: DrawerMenuRadioItem,
  CheckboxItem: DrawerMenuCheckboxItem,
};
