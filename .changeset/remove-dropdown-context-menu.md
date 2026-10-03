---
"@kappa-ui/registry": minor
---

`DropdownMenu` and `ContextMenu` are removed: `Menu` covers both, opening on click from the element it sits in or from a `MenuTrigger`, and with `context-menu` on right-click and long-press. It has the same parts (`MenuItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuRadioItem`, `MenuLabel`, `MenuSeparator`, `MenuShortcut`, `MenuGroup`, `MenuSub`, `MenuSubTrigger`, `MenuSubContent`), sizes and styles, so moving over means renaming the parts and replacing `DropdownMenuTrigger`/`ContextMenuTrigger` and the content part with a `Menu` inside the element that opens it; `align="end"` becomes `anchor="bottom end" self="top end"`. Copies already in a project keep working. The Breadcrumb, ButtonGroup, DrawerMenu and overlay examples use `Menu`.
