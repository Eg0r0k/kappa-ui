---
"@kappa-ui/registry": minor
---

The default theme rounds corners at `0.5rem` instead of `0.75rem`, draws cards, dialogs, menus and popovers without an edge (`--surface-border: transparent`), and brightens the info colour to `oklch(0.79 0.17 256)` with matching `--info-foreground` and `--info-text`. To keep the old look, set `--radius: 0.75rem`, `--surface-border: var(--border)` and the previous `--info*` values in your stylesheet.
