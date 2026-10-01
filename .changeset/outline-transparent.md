---
"@kappa-ui/registry": patch
---

Button and Alert: the `outline` variant no longer paints `bg-background`, so an outline button or alert on a tinted surface shows the surface through it, as Badge's `outline` already did.
