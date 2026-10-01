import { type DialogRootProps, createContext } from "reka-ui";
import type { ComputedRef, Ref } from "vue";

import type { DragSide } from "../drag";
import type { SnapPoint } from "../snap";
import type { DrawerStack, DrawerStackEntry } from "./stack";

export interface DrawerRootProps extends DialogRootProps {
  side?: DragSide;
  dismissible?: boolean;
  handleOnly?: boolean;
  snapPoints?: SnapPoint[];
  activeSnapPoint?: SnapPoint | null;
  snapToSequentialPoints?: boolean;
  fadeFromIndex?: number;
}

export type DrawerRootEmits = {
  "update:open": [value: boolean];
  "update:activeSnapPoint": [value: SnapPoint | null];
};

export interface DrawerRootContext {
  side: ComputedRef<DragSide>;
  dismissible: ComputedRef<boolean>;
  handleOnly: ComputedRef<boolean>;
  open: ComputedRef<boolean>;
  size: Ref<number>;
  movement: Ref<number>;
  progress: ComputedRef<number>;
  swiping: Ref<boolean>;
  dragged: Ref<boolean>;
  keyboardInset: Ref<number>;
  snapPoints: ComputedRef<SnapPoint[]>;
  snapPixels: ComputedRef<number[]>;
  activeSnapPoint: Ref<SnapPoint | null>;
  activeSnapIndex: ComputedRef<number>;
  snapToSequentialPoints: ComputedRef<boolean>;
  expanded: ComputedRef<boolean>;
  snapOffset: ComputedRef<number>;
  overlayOpacity: ComputedRef<number>;
  setOpen: (open: boolean) => void;
  stack: DrawerStack;
  entry: DrawerStackEntry;
}

export const [injectDrawerRootContext, provideDrawerRootContext] = createContext<DrawerRootContext>("DrawerRoot");

export const useDrawerContext = () => injectDrawerRootContext();
