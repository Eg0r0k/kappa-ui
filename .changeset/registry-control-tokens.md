---
"@kappa-ui/registry": minor
---

The control scale is now a set of tokens: `--control-height-*`, `--control-padding-*`, `--control-icon-*` and `--control-gap-*` for `xs` to `xl`, added to `:root` by the `tokens` item. Button, Input, InputFloating, Select, Combobox, InputNumber, TagsInput, PinInput, InputTime, InputGroup, Menu, Tabs, ColorPicker and Pagination read them, so overriding one on `:root` resizes every control of that size. The values are unchanged.
