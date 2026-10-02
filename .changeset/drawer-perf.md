---
"@kappa-ui/core": patch
---

A drag no longer re-renders the drawer's content or the page in `DrawerIndent`: `DrawerContent`, `DrawerOverlay` and `DrawerIndent` write the values that change every frame straight to their elements, and `tailwind.css` registers `--drawer-swipe-movement`, `--drawer-swipe-progress` and the variables derived from them with `inherits: false`, so a frame restyles one element rather than its subtree. Read `--drawer-swipe-movement` and `--drawer-swipe-progress` on the panel or the overlay itself; its children now see `0`.
