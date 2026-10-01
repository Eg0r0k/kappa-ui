---
"@kappa-ui/core": minor
---

`@kappa-ui/core/drawer`: `DrawerRoot`, `DrawerContent`, `DrawerOverlay`, `DrawerHandle` and `DrawerSwipeArea` over Reka UI's dialog, with a swipe-to-dismiss gesture on every side, swipe-to-open from the screen edge and a bottom edge that lifts above the virtual keyboard. New modules `@kappa-ui/core/drag` (`useDrag` over `@use-gesture/vanilla` with the drag-start rules) and `@kappa-ui/core/virtual-keyboard` (`useVirtualKeyboardInset`). `tailwind.css` gains `drawer-slide` and `drawer-overlay-fade`. `@use-gesture/vanilla` and `@vueuse/core` become dependencies. `DismissReason` gains `"swipe"`.
