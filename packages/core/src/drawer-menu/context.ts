import { type AcceptableValue, type PrimitiveProps, createContext } from "reka-ui";
import type { ComputedRef, Ref, ShallowRef } from "vue";

export type DrawerMenuDirection = "ltr" | "rtl";
export type DrawerMenuMotion = "from-start" | "from-end" | "to-start" | "to-end";
export type DrawerMenuCheckedState = boolean | "indeterminate";

export interface DrawerMenuProps extends PrimitiveProps {
  loop?: boolean;
  dir?: DrawerMenuDirection;
}

export interface DrawerMenuItemProps extends PrimitiveProps {
  disabled?: boolean;
  textValue?: string;
}

export type DrawerMenuItemEmits = { select: [event: Event] };

export interface DrawerMenuCheckboxItemProps extends DrawerMenuItemProps {
  modelValue?: DrawerMenuCheckedState;
}

export type DrawerMenuCheckboxItemEmits = {
  select: [event: Event];
  "update:modelValue": [value: DrawerMenuCheckedState];
};

export interface DrawerMenuRadioGroupProps extends PrimitiveProps {
  modelValue?: AcceptableValue;
}

export type DrawerMenuRadioGroupEmits = { "update:modelValue": [value: AcceptableValue] };

export interface DrawerMenuRadioItemProps extends DrawerMenuItemProps {
  value: AcceptableValue;
}

export type DrawerMenuRadioItemEmits = DrawerMenuItemEmits;

export interface DrawerMenuItemIndicatorProps extends PrimitiveProps {
  forceMount?: boolean;
}

export type DrawerMenuGroupProps = PrimitiveProps;
export type DrawerMenuLabelProps = PrimitiveProps;
export type DrawerMenuSeparatorProps = PrimitiveProps;
export type DrawerMenuBackProps = PrimitiveProps;

export interface DrawerMenuSubProps {
  open?: boolean;
  defaultOpen?: boolean;
}

export type DrawerMenuSubEmits = { "update:open": [value: boolean] };

export interface DrawerMenuSubEntry {
  triggerId: string;
  contentId: string;
  close: () => void;
}

export interface DrawerMenuContext {
  outlet: Ref<HTMLElement | undefined>;
  stack: ShallowRef<DrawerMenuSubEntry[]>;
  navigation: Ref<"forward" | "back">;
  height: Ref<number | undefined>;
  loop: ComputedRef<boolean>;
  dir: ComputedRef<DrawerMenuDirection>;
  push: (entry: DrawerMenuSubEntry) => void;
  remove: (entry: DrawerMenuSubEntry, restoreFocus?: boolean) => void;
  select: (emit: (event: Event) => void) => Promise<void>;
  dragged: () => boolean;
}

export const [injectDrawerMenuContext, provideDrawerMenuContext] = createContext<DrawerMenuContext>("DrawerMenu");

export interface DrawerMenuSubContext {
  open: Ref<boolean>;
  label: Ref<string>;
  textValue: Ref<string | undefined>;
  entry: DrawerMenuSubEntry;
}

export const [injectDrawerMenuSubContext, provideDrawerMenuSubContext] =
  createContext<DrawerMenuSubContext>("DrawerMenuSub");

export const [injectDrawerMenuRadioGroupContext, provideDrawerMenuRadioGroupContext] = createContext<{
  modelValue: Ref<AcceptableValue | undefined>;
  onValueChange: (value: AcceptableValue) => void;
}>("DrawerMenuRadioGroup");

export const [injectDrawerMenuItemIndicatorContext, provideDrawerMenuItemIndicatorContext] = createContext<{
  state: ComputedRef<DrawerMenuCheckedState>;
}>("DrawerMenuItemIndicator");

export const checkedState = (state: DrawerMenuCheckedState) => {
  if (state === "indeterminate") return "indeterminate";
  return state ? "checked" : "unchecked";
};
