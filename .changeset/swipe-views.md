---
"@kappa-ui/registry": minor
---

New `SwipeViews`: pages that follow the finger, the way native apps page between tabs. It holds the page in the frame in `v-model`, pairs with Tabs on the same model, and lays its `SwipeView`s out in a row that a swipe or a flick moves along. The frame and every page carry CSS variables for other layouts and effects, such as sidebars that trail the content. `SwipeViewsSwipeArea` adds a strip at an edge, and `swipe-area-only` makes it the only way to swipe. `useSwipeSnap`, the mechanism underneath, is exported too.
