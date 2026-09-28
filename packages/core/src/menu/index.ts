import * as internal from "reka-ui/internal";

const parts = [
  "MenuAnchor",
  "MenuCheckboxItem",
  "MenuContent",
  "MenuGroup",
  "MenuItem",
  "MenuItemIndicator",
  "MenuLabel",
  "MenuPortal",
  "MenuRadioGroup",
  "MenuRadioItem",
  "MenuRoot",
  "MenuSeparator",
  "MenuSub",
  "MenuSubContent",
  "MenuSubTrigger",
] as const;

if ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) {
  const missing = parts.filter((name) => !(name in internal));
  if (missing.length > 0) {
    throw new Error(
      `[kappa-ui] reka-ui/internal no longer exports ${missing.join(", ")}, which the kappa-ui Menu is built on. Supported: reka-ui ^2.10.5.`,
    );
  }
}

export const MenuAnchor: typeof internal.MenuAnchor = internal.MenuAnchor;
export const MenuCheckboxItem: typeof internal.MenuCheckboxItem = internal.MenuCheckboxItem;
export const MenuContent: typeof internal.MenuContent = internal.MenuContent;
export const MenuGroup: typeof internal.MenuGroup = internal.MenuGroup;
export const MenuItem: typeof internal.MenuItem = internal.MenuItem;
export const MenuItemIndicator: typeof internal.MenuItemIndicator = internal.MenuItemIndicator;
export const MenuLabel: typeof internal.MenuLabel = internal.MenuLabel;
export const MenuPortal: typeof internal.MenuPortal = internal.MenuPortal;
export const MenuRadioGroup: typeof internal.MenuRadioGroup = internal.MenuRadioGroup;
export const MenuRadioItem: typeof internal.MenuRadioItem = internal.MenuRadioItem;
export const MenuRoot: typeof internal.MenuRoot = internal.MenuRoot;
export const MenuSeparator: typeof internal.MenuSeparator = internal.MenuSeparator;
export const MenuSub: typeof internal.MenuSub = internal.MenuSub;
export const MenuSubContent: typeof internal.MenuSubContent = internal.MenuSubContent;
export const MenuSubTrigger: typeof internal.MenuSubTrigger = internal.MenuSubTrigger;

export type {
  MenuCheckboxItemEmits,
  MenuCheckboxItemProps,
  MenuGroupProps,
  MenuItemEmits,
  MenuItemProps,
  MenuLabelProps,
  MenuRadioGroupEmits,
  MenuRadioGroupProps,
  MenuRadioItemEmits,
  MenuRadioItemProps,
  MenuSeparatorProps,
  MenuSubContentEmits,
  MenuSubContentProps,
  MenuSubEmits,
  MenuSubProps,
  MenuSubTriggerProps,
} from "reka-ui/internal";
