---
"@kappa-ui/registry": patch
---

InputNumber takes its text alignment from its own root through `--input-number-align`: a vertical InputNumber in a horizontal Field is no longer centred, an alignment class such as `text-start` on `InputNumberInput` wins, and a vertical decrement keeps its corner inside a filled Item.
