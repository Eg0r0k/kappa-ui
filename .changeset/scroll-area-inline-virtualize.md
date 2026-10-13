---
"@kappa-ui/registry": patch
---

A virtualized ScrollArea given an inline `virtualize` object no longer re-measures on every parent render: equal options keep their resolved form, so the sizes measured above the viewport survive an unrelated update and the list stops jumping. A function `estimateSize` or `getScrollElement` written inline still counts as a change; hoist those.
