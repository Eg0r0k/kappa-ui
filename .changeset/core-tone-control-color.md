---
"@kappa-ui/core": minor
---

`tone-control` works with a `color` prop. On an element with `data-slot` and `data-color` it leaves `--tone`, `--tone-foreground` and `--tone-text` to the `[data-slot][data-color]` rules, so the control takes that tone, and it keeps `--input` as the unchecked edge. A colour other than `primary` also rings the control in its `--tone-text`. Any other element gets `primary` exactly as before, now including `--tone-text`, so copies of Switch, Checkbox, Radio and Slider made before the prop look the same. `tone-invalid` now turns `--tone-text` `destructive` along with the rest of the tone, so edges, marks and rings drawn in it go red on an invalid control too. Copies made before the prop don't read `--tone-text`, so they look the same. `choice-row` tints a selected option in its group's tone when the group has `data-slot` and `data-color`, and in `primary` when it doesn't.
