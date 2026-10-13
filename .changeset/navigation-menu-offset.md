---
"@kappa-ui/registry": patch
---

NavigationMenu: the gap between the list and a panel is the root variable `--nav-offset` (4px), read through plain margins, so a margin class on `NavigationMenuContent` wins and `[--nav-offset:…]` on `NavigationMenu` moves the viewport and the indicator's arrow together. The page now shows how to change a vertical trigger's alignment.
