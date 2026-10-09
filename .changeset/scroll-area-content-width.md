---
"@kappa-ui/registry": patch
---

ScrollArea: a vertical area gives its content the area's width, so `truncate`, `line-clamp-*` and percentage widths work inside it. Before, the content box grew to the longest line, as in QScrollArea. `horizontal` and `both` keep letting the content grow.

`setScrollPercentage` and `setScrollPosition` measure the viewport when called instead of reading the last observed size, so `setScrollPercentage('vertical', 1)` right after a content change reaches the new end.
