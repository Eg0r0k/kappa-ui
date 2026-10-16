---
"@kappa-ui/registry": minor
---

ScrollArea: `virtualize` takes `getItemKey`, `anchorTo` and `followOnAppend` from TanStack Virtual. With `getItemKey`, rows are keyed by item instead of index, so a row keeps its element and measured size when rows arrive above it. `anchorTo: 'end'` keeps the first visible row in place as rows are added or removed at either end. `followOnAppend` makes a view at the end follow appended rows: a chat that loads older messages above and new ones below. The new `setScrollPositionSilently(axis, offset)` jumps without emitting `scroll`, `reachEdge` or `virtualScroll`, for restoring a saved position. Both setters now hold in `onMounted` on a virtual list, which TanStack used to scroll back to the top when it attached to the viewport a tick later. `useInfiniteScroll` with a ScrollArea API as its target no longer shifts a list anchored to the end a second time after loading above it.
