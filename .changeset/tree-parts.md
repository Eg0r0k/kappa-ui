---
"@kappa-ui/registry": minor
---

`Tree` no longer draws its rows: render a `TreeItem` for each of the default slot's `items` and fill it with `TreeItemToggle`, `TreeItemCheckbox`, `TreeItemIcon`, `TreeItemLabel` or anything else, as with Reka's `TreeRoot`. The `item`, `item-leading`, `item-label` and `item-trailing` slots, `TreeItem`'s `leading`, `label` and `trailing` slots, and `label-key` are gone; the row's state comes with `TreeItem`'s slot. Virtualization is a part: put a `TreeVirtualizer` in a tree rendered `as="div"` with a height, instead of `virtualize`; its `text-content` gives typeahead each node's text. `checkbox` stays a selection mode (multiple, cascade, `aria-checked`) and no longer adds checkboxes by itself.
