import { type DialogRootEmits, type DialogRootProps, createContext } from "reka-ui";
import type { ComputedRef, Ref } from "vue";

import type { DragSide } from "../drag";

export interface DrawerRootProps extends DialogRootProps {
  side?: DragSide;
  dismissible?: boolean;
  handleOnly?: boolean;
}

export type DrawerRootEmits = DialogRootEmits;

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
  snapOffset: Ref<number>;
  overlayOpacity: Ref<number>;
  setOpen: (open: boolean) => void;
}

export const [injectDrawerRootContext, provideDrawerRootContext] = createContext<DrawerRootContext>("DrawerRoot");

export const useDrawerContext = () => injectDrawerRootContext();
