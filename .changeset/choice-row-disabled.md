---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

A row of a disabled `RadioGroup` or `CheckboxGroup`, or of a group inside a disabled `FieldSet`, looks disabled: `choice-row` drops its hover tint and shows a `not-allowed` cursor when the row's checkbox or radio is disabled, not only when its `Field` is, and `FieldLabel` dims beside a disabled checkbox or radio.
