---
"@kappa-ui/core": minor
"@kappa-ui/registry": minor
---

Breaking: the focus ring's colour hook is `--focus-ring-color`, no longer `--color-ring`. `focus-ring` and `focus-ring-inset` read `var(--focus-ring-color, --theme(--color-ring))`, so a `.dark` island (or any subtree that sets `--ring`) rings its controls in its own `--ring`; a class such as `[--color-ring:currentColor]` copied from the kit now has no effect and becomes `[--focus-ring-color:currentColor]`. `tone-control`, `AlertClose`, `BannerClose` and the `ChoiceGroup` cards set the new variable.
