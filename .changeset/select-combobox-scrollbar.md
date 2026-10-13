---
"@kappa-ui/registry": patch
---

A long `Select` or `Combobox` list shows the browser's thin scrollbar, as Menu does, instead of scrolling with no visible sign. Reka hides it with an unlayered style, so the viewports set `[scrollbar-width:thin]!`; hiding it again takes an important class too, such as `[&_[data-slot=select-viewport]]:[scrollbar-width:none]!` on `SelectContent` or `[scrollbar-width:none]!` on `ComboboxViewport`.
