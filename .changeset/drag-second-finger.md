---
"@kappa-ui/core": patch
---

A finger drag no longer freezes when a second finger touches the screen: `useDrag` keeps following the first finger and releases when it lifts, so SwipeViews, `useSwipeSnap`, Drawer and SwipeActions settle instead of staying stuck mid-drag. A second finger that lands before the drag starts still keeps it from starting.
