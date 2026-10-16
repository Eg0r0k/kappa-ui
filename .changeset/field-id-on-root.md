---
"@kappa-ui/registry": minor
---

Breaking: an `id` on `Field` or `FieldSet` lands on the field's root element, so a link to it scrolls to the field. The control's `id` moved to a prop of its own, `controlId` on `Field`; the label still follows it. `<Field id="email">` that was meant for the input becomes `<Field control-id="email">`. `FieldSet` has no `controlId`: its legend names the group, and the `id` it used to take never reached the group.
