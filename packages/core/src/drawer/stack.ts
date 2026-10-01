import { createContext } from "reka-ui";
import { type ComputedRef, type Ref, type ShallowRef, shallowRef } from "vue";

import type { DragSide } from "../drag";

export interface DrawerStackEntry {
  side: ComputedRef<DragSide>;
  presence: ComputedRef<number>;
  swiping: Ref<boolean>;
}

export interface DrawerStack {
  entries: ShallowRef<readonly DrawerStackEntry[]>;
  add: (entry: DrawerStackEntry) => void;
  remove: (entry: DrawerStackEntry) => void;
}

export const createDrawerStack = (): DrawerStack => {
  const entries = shallowRef<readonly DrawerStackEntry[]>([]);
  return {
    entries,
    add: (entry) => {
      if (!entries.value.includes(entry)) entries.value = [...entries.value, entry];
    },
    remove: (entry) => {
      if (entries.value.includes(entry)) entries.value = entries.value.filter((item) => item !== entry);
    },
  };
};

export const [injectDrawerStack, provideDrawerStack] = createContext<DrawerStack>("DrawerIndent");

const shared = createDrawerStack();

export const useDrawerStack = () => injectDrawerStack(shared);
