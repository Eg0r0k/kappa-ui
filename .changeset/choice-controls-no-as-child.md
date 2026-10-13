---
"@kappa-ui/registry": patch
---

`Checkbox`, `Radio`, `Switch` and `Slider` no longer declare `as` and `asChild`, as `Rating` already does: Reka's slot cloned the control's own indicator, thumb or track into the root, which left an inert control. The props are gone from their API tables too.
