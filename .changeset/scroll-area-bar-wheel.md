---
"@kappa-ui/registry": patch
---

A wheel over a ScrollArea's bar or thumb scrolls the area instead of the page: the bar and thumb sit beside the viewport, outside its scroll chain, and now forward the wheel to it. At the area's edge the page still takes the wheel, and Ctrl+wheel still zooms.
