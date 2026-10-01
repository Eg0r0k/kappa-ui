---
"@kappa-ui/registry": minor
---

New `InputNumber`: a number field over Reka UI's NumberField with `InputNumberInput`, `InputNumberIncrement` and `InputNumberDecrement` parts inside one frame, in Input's variants and sizes, horizontal or vertical, with `min`, `max`, `step`, `formatOptions` and `locale`, wired to a surrounding Field.

`Input` now exports `textControlFrameVariant`, the text control variants for a frame around a control, read from the control's focus, invalid and disabled state. `InputGroup` draws its frame from it; its radius variable is renamed from `--input-group-radius` to `--control-radius`.
