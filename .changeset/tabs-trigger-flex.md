---
"@kappa-ui/registry": patch
---

`flex-none` (or any `flex-*` class) on a horizontal pill `TabsTrigger` now wins over the stretch the list gives its triggers; the list passes the stretch down through `--tabs-trigger-flex`.
