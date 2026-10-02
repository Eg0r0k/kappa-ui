---
"@kappa-ui/core": patch
---

`DrawerMenuBack` follows its `DrawerMenuSubTrigger`'s text when that text changes while the submenu is open, such as a live count in the label. Before, it kept the text from when the submenu opened.
