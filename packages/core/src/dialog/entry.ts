import { createContext, injectDialogRootContext } from "reka-ui";
import { type Ref, computed } from "vue";

import type { DialogEntry, DialogStore } from "./manager";

export interface DialogEntryContext {
  entry: DialogEntry;
  store: DialogStore;
  root: ReturnType<typeof injectDialogRootContext> | null;
}

export const [injectDialogEntry, provideDialogEntry] = createContext<DialogEntryContext>("DialogEntryScope");

export const useDialogContext = <T = void>(): {
  close: (value: T) => void;
  dismiss: () => void;
  loading: Ref<boolean>;
} => {
  const context = injectDialogEntry(null);
  if (!context) {
    throw new Error(
      "useDialogContext() found no dialog: call it in a component opened with openDialog() or defineDialog().",
    );
  }
  const { entry, store } = context;
  return {
    close: (value) => store.close(entry, value),
    dismiss: () => store.dismiss(entry, "programmatic"),
    loading: computed({
      get: () => entry.loading,
      set: (value) => {
        entry.loading = value;
      },
    }),
  };
};

export const useOwnDialogEntry = () => {
  const context = injectDialogEntry(null);
  return context && context.root === injectDialogRootContext(null) ? context : null;
};
