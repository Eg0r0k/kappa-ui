---
"@kappa-ui/registry": patch
---

Left and right drawers keep their rounded corners and their handle on the inner edge in right-to-left text. `side` names a screen edge, but the corners and the handle were placed with logical classes, so under `dir="rtl"` they ended up against the edge of the screen.
