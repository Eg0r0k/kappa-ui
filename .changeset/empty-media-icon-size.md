---
"@kappa-ui/registry": patch
---

`icon-size-*` on `EmptyMedia` now sizes its bare icon: the part's own icon rule sits in `:where()`, so it no longer ties with the class and wins by source order.
