---
"@kappa-ui/core": minor
---

`DrawerIndent` in `@kappa-ui/core/drawer`: the page element that steps back while a modal drawer is open. Open modal drawers form a stack in the nearest `DrawerIndent`, or a shared one without it. The page follows the first drawer through `--drawer-indent-progress`, `data-side`, `data-swiping` and the part of it on screen (`--drawer-indent-top`, `--drawer-indent-bottom`), kept until its return transition ends, and carries `data-open`. A drawer content gets `--drawer-nested`, `--drawer-nested-progress`, `data-nested-open` and `data-nested-swiping` from the drawers above it. `tailwind.css` adds the `drawer-indent` utility, and `drawer-slide` steps a drawer back while others are open above it.
