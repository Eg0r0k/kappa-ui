---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

`DrawerMenu as-child` makes the child the menu root: the child gets the root's attributes (`data-slot`, classes, `dir`, the height variable and the back keys), its own content becomes the root panel, and the submenu panels render inside it. Before, the attributes landed on the root panel and the submenus sat outside the child.
