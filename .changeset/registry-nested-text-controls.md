---
"@kappa-ui/registry": patch
---

The text control frame of `InputGroup`, `InputNumber`, `TagsInput` and the `Combobox` anchor reads focus, invalid and disabled from any `input`, `textarea` or `role="spinbutton"` inside it, not only from a direct child; what sits in an `InputGroupAddon`, such as a checkbox's hidden form input, is left out. An `InputGroupAddon` click focuses the first segment of a segmented control, and addons fade when an input outside the addons is disabled.
