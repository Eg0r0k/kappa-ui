---
"@kappa-ui/registry": patch
---

Toasts stay clickable while a modal Dialog, Drawer or other overlay that blocks outside pointer events is open: a press on a toast's action runs it instead of falling through to the dialog's overlay and closing the dialog.
