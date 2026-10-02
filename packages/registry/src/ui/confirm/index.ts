import { type DialogHandle, openDialog } from "@kappa-ui/core/dialog";

import type { AlertDialogSize } from "@/ui/alert-dialog";
import type { ButtonColor } from "@/ui/button";
import ConfirmDialog from "./ConfirmDialog.vue";
import PromptDialog from "./PromptDialog.vue";

export { default as ConfirmDialog } from "./ConfirmDialog.vue";
export { default as PromptDialog } from "./PromptDialog.vue";

export interface AlertOptions {
  title: string;
  description?: string;
  action?: string;
  color?: ButtonColor | (string & {});
  size?: AlertDialogSize;
}

export interface ConfirmOptions extends AlertOptions {
  cancel?: string;
  onConfirm?: () => unknown;
}

export interface PromptOptions extends AlertOptions {
  cancel?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  type?: "text" | "email" | "password" | "search" | "tel" | "url";
  validate?: (value: string) => string | undefined | Promise<string | undefined>;
  onConfirm?: (value: string) => unknown;
}

export const useConfirm = () => ({
  confirm: (options: ConfirmOptions): DialogHandle<void> =>
    openDialog<void>(ConfirmDialog, { action: "Confirm", cancel: "Cancel", ...options }),
  alert: (options: AlertOptions): DialogHandle<void> => openDialog<void>(ConfirmDialog, { ...options }),
  prompt: (options: PromptOptions): DialogHandle<string> => openDialog<string>(PromptDialog, { ...options }),
});
