---
"@kappa-ui/registry": patch
---

A `Field` or `FieldSet` inside a disabled `FieldSet` is disabled too, so a `Slider`, `Rating` or `ColorPicker` in its own Field stops taking focus and input while the form is locked. Only `disabled` passes down; `invalid` and `required` stay with the part that sets them.
