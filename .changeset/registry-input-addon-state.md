---
"@kappa-ui/registry": patch
---

The text control frame of `InputGroup`, `InputNumber`, `TagsInput` and the `Combobox` anchor ignores what sits in an `InputGroupAddon`: a disabled checkbox's hidden form input no longer greys the frame or fades the addons, and the browser focusing it after a failed submit no longer lights the frame. A focused control that fails native validation shows the destructive edge again instead of the focus one.
