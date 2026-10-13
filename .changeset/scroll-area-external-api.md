---
"@kappa-ui/registry": patch
---

In external-scroll mode (`virtualize.getScrollElement`), ScrollArea's `getScrollTarget`, `setScrollPosition` and `setScrollPercentage` act on the external scroller instead of the inner viewport, which never scrolls there, so a nested `InfiniteScroll` reads the right edge. `getScroll` and `getScrollPosition` still report the inner viewport in that mode.
