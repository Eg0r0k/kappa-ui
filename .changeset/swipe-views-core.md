---
"@kappa-ui/core": minor
---

New `@kappa-ui/core/swipe-views`: `SwipeViewsRoot`, `SwipeView` and `SwipeViewsSwipeArea`, headless pages that follow the finger. The root measures its pages, binds the page in the frame with `v-model` and writes `--swipe-snap-offset` and `--swipe-snap-position`; every page gets `--swipe-view-index`, `--swipe-view-start`, `data-state`, and `inert` while out of the frame, and the `swipe-view` utility derives `--swipe-view-offset` and `--swipe-view-stack` from them. `layout` (`row` or `stack`) is carried as `data-layout`, and the root sets `dir`. A swipe area is a strip that starts a swipe towards the page on its side; `swipeAreaOnly` makes it the only way to swipe.
