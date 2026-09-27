export { default as Dialog } from "./Dialog.vue";
export { default as DialogBody } from "./DialogBody.vue";
export { default as DialogClose } from "./DialogClose.vue";
export { default as DialogContent } from "./DialogContent.vue";
export { default as DialogDescription } from "./DialogDescription.vue";
export { default as DialogFooter } from "./DialogFooter.vue";
export { default as DialogHeader } from "./DialogHeader.vue";
export { default as DialogOverlay } from "./DialogOverlay.vue";
export { default as DialogScrollContent } from "./DialogScrollContent.vue";
export { default as DialogTitle } from "./DialogTitle.vue";
export { default as DialogTrigger } from "./DialogTrigger.vue";
export {
  type DialogDefinition,
  type DialogHandle,
  type DialogResult,
  type DismissReason,
  DialogHost,
  closeAllDialogs,
  createDialogs,
  defineDialog,
  openDialog,
  useDialogContext,
} from "@delta-ui/core/dialog";

export const dialogSurface =
  "group/dialog flex flex-col gap-4 rounded-2xl border border-surface-border bg-popover py-6 text-popover-foreground shadow-xl outline-none animate-overlay [--scroll-fade-color:var(--popover)]";
