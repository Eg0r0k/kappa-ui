---
"@kappa-ui/registry": minor
---

New `SwipeViews`: pages that follow the finger, the way native apps page between tabs. It holds the page in the frame in `v-model`, pairs with Tabs on the same model, and lays its `SwipeView`s out in a row that a swipe or a flick moves along. `layout="stack"` lays the pages on top of each other, each sliding in over the one before it, as in a navigation stack. The frame and every page carry CSS variables for layouts and effects of your own. `SwipeViewsSwipeArea` adds a strip at an edge, and `swipe-area-only` makes it the only way to swipe. The mechanism underneath comes as its own item, `swipe-snap`, with `useSwipeSnap` for sheets, galleries and pagers of your own.
