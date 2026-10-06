---
"@kappa-ui/registry": patch
---

`CommandList` takes no room when it has nothing to show: with every item filtered out and no `CommandEmpty`, or with no items at all, it collapses, padding included. The line between the input and the results now belongs to the list, so it goes with it, and an input with nothing under it no longer ends in a stray border.
