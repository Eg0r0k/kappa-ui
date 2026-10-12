---
"@kappa-ui/registry": minor
---

`MenuItem`, `MenubarItem` and `DrawerMenuItem` take `color` instead of `variant`: `variant="destructive"` becomes `color="destructive"`, and every other tone (`primary`, `neutral`, `success`, `warning`, `info` or one you declare on `[data-slot][data-color="<name>"]`) now works too. The item, its icon and its hover layer read `--tone-text`; `data-variant` is gone from the item and `data-color` carries the colour.
