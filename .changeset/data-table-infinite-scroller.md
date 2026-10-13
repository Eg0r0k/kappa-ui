---
"@kappa-ui/registry": patch
---

A DataTable with `onLoadMore` and no `height` looks for its scroller above its own container, which only scrolls sideways: it no longer loads page after page on mount while the end of the page is far away.
