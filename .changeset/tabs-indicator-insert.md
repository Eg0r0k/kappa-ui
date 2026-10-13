---
"@kappa-ui/registry": patch
---

The `TabsList` indicator follows the active trigger when a tab is inserted before it or removed: the list watches its children and asks Reka's indicator to measure again, which a fixed-width list never prompted.
