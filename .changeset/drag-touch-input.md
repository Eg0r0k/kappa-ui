---
"@kappa-ui/core": patch
---

A finger drags a drawer through touch events whenever the device reports touch at the moment of the press (`ontouchstart` or `navigator.maxTouchPoints`), as Base UI's Drawer does, instead of only when `ontouchstart` existed at page load. A swipe from the top of a scrolled body now closes the drawer after DevTools switches on touch emulation. A finger whose scroll reaches the edge mid-gesture hands the gesture to the drawer while the browser still lets its moves be cancelled.
