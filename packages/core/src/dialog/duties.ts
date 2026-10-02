import { onMounted, onUnmounted } from "vue";

import { createDialogContentParts, provideDialogContentParts } from "./context";
import { useOwnDialogEntry } from "./entry";

export const useDialogContentDuties = () => {
  const owner = useOwnDialogEntry();

  provideDialogContentParts(createDialogContentParts());

  const onEscapeKeyDown = (event: KeyboardEvent) => {
    if (event.isComposing || owner?.entry.loading) event.preventDefault();
    if (owner && !event.defaultPrevented) owner.entry.reason = "escape";
  };

  const onInteractOutside = (event: Event) => {
    if (owner?.entry.loading) event.preventDefault();
    if (owner && !event.defaultPrevented) owner.entry.reason = "outside";
  };

  const onAfterLeave = () => {
    if (owner) owner.store.afterLeave(owner.entry);
  };

  onMounted(() => {
    if (owner) owner.store.mountContent(owner.entry);
  });

  onUnmounted(() => {
    if (owner) owner.store.unmountContent(owner.entry);
  });

  return { onEscapeKeyDown, onInteractOutside, onAfterLeave };
};
