---
"@kappa-ui/registry": patch
---

With Reka UI 2.11, the toasts in a `Toaster` ease to their new height again when a toast arrives or closes and when the stack expands, instead of jumping to it. Reka 2.11 measures each toast by setting its inline height to `auto`, which cut the toast's height transition short. The toast now takes its height from `min-height` and `max-height`, which the measuring leaves alone. With Reka UI 2.10 the stack looks and moves as before.
