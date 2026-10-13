---
"@kappa-ui/core": patch
---

A toast that is already closed when it first renders (closed by `max` in the same tick it was added, or added and removed in one tick) is dropped and its `onClose` runs, instead of staying in `toasts` until the toaster unmounts.
