---
"@kappa-ui/registry": minor
---

New `Editable`: text that turns into a field where it stands, over Reka UI. Four parts (`Editable`, `EditableArea`, `EditablePreview`, `EditableInput`); the text and the field take the surrounding type, `autoResize` is on so entering edit mode moves nothing, and edit, save and cancel buttons come from the root slot. A disabled editable leaves the tab order, which Reka's preview does not do on its own.
