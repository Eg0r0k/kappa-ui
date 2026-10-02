---
"@kappa-ui/core": minor
---

`@kappa-ui/core/drawer-menu`: a menu that lives inside a drawer. `DrawerMenu` holds panels with `role="menu"` and roving focus; `DrawerMenuItem`, `DrawerMenuCheckboxItem`, `DrawerMenuRadioGroup`, `DrawerMenuRadioItem`, `DrawerMenuItemIndicator`, `DrawerMenuGroup`, `DrawerMenuLabel` and `DrawerMenuSeparator` take the props and events of Reka UI's menu parts, so a select closes the drawer unless prevented. `DrawerMenuSub`, `DrawerMenuSubTrigger` and `DrawerMenuSubContent` drill down in the same sheet, with `DrawerMenuBack` at the top of a sub panel; ArrowLeft, Backspace and Escape go back. `tailwind.css` adds the `drawer-menu` utility, which slides between panels and follows the visible panel's height.
