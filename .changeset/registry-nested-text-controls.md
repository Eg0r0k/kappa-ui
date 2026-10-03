---
"@kappa-ui/registry": patch
---

The text control frame of `InputGroup`, `InputNumber`, `TagsInput` and the `Combobox` anchor reads focus, invalid and disabled from any `input`, `textarea` or `role="spinbutton"` inside it, not only from a direct child. An `InputGroupAddon` click focuses the first segment of a segmented control, and addons fade when any input inside the group is disabled.
