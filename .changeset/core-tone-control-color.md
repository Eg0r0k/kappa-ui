---
"@kappa-ui/core": minor
---

`tone-control` works with a `color` prop. On an element with `data-color` it leaves `--tone` and `--tone-foreground` to the `[data-slot][data-color]` rules, so the control takes that tone, and it keeps `--input` as the unchecked edge. A colour other than `primary` also rings the control in its `--tone-text`. An element without `data-color` gets `primary` exactly as before, so copies of Switch, Checkbox, Radio and Slider made before the prop look the same, and `tone-invalid` still wins over either. `choice-row` tints a selected option in its group's tone when the group has `data-color`, and in `primary` when it doesn't.
