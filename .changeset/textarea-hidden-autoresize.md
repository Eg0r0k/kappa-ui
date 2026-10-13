---
"@kappa-ui/registry": patch
---

An `autoresize` Textarea mounted while hidden (a closed tab, a Collapsible, a `hidden md:block` column) measures itself when it shows instead of staying collapsed until the user types, and it re-measures by itself when its width changes.
