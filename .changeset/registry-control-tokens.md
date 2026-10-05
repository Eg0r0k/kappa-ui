---
"@kappa-ui/registry": minor
---

The control scale is now a set of tokens: `--control-height-*`, `--control-padding-*`, `--control-icon-*` and `--control-gap-*` for `xs` to `xl`, added to `:root` by the `tokens` item. Button, Input, InputFloating, Select, Combobox, InputNumber, TagsInput, PinInput, InputTime, InputGroup, Menu, Tabs, ColorPicker and Pagination read them, so overriding one on `:root` resizes every control of that size.

Three sizes that strayed from the scale now follow it. Button icons are 20px at `lg` and `xl` instead of 16px, and so are the icons of Toggle, ToggleGroup, Toolbar and Pagination at those sizes. The gap between an icon and its label is 4, 6, 8, 8 and 8px from `xs` to `xl` in Menu items (and the Select, Combobox and Command lists), where it was 8, 10, 12, 12 and 12px, and in Tabs triggers, where it was 6, 8, 8, 8 and 10px; inset and checkbox or radio items move their labels with it, so they stay in line with items that have an icon. Everything else keeps its size.
