---
"@kappa-ui/core": minor
---

New `@kappa-ui/core/swipe-views`: `SwipeViewsRoot`, `SwipeView` and `SwipeViewsSwipeArea`, headless pages that follow the finger. The root measures its pages, binds the page in the frame with `v-model` and writes `--swipe-snap-offset` and `--swipe-snap-position`; every page gets `--swipe-view-index` and `--swipe-view-start`, `data-state`, and `inert` while out of the frame. A swipe area is a strip that starts a swipe towards the page on its side; `swipeAreaOnly` makes it the only way to swipe.
