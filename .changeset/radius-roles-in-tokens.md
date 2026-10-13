---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

The corner role tokens (`--radius-control-*`, `--radius-surface-*`, `--radius-item-*`) move from the `theme` item to the `tokens` item, which every component brings. A project that skipped init and kept its own shadcn theme now gets `rounded-control-*`, `rounded-surface-*` and `rounded-item-*` (and the `rounded-inset-*`/`rounded-outset-*` forms on them) instead of square corners. They scale from your `--radius` and the optional `--control-radius`, `--surface-radius` and `--item-radius` knobs, as before.
