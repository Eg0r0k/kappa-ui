---
"@kappa-ui/registry": minor
---

New `AlertDialog`: shadcn's parts over Reka UI's AlertDialog on Dialog's window and overlay, with `AlertDialogMedia`, a `sm` size, and `AlertDialogAction` / `AlertDialogCancel` that take Button's `variant`, `color` and `size`. New `confirm` item: `useConfirm()` returns `confirm`, `alert` and `prompt`, which open alert dialogs from code and resolve with a `DialogResult`; `onConfirm` holds the dialog with a spinner while it runs and keeps it open if it throws, and `prompt` validates its value.
