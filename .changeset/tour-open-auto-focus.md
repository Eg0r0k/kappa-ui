---
"@kappa-ui/registry": patch
---

`TourContent` honours a listener that calls `preventDefault()` on `openAutoFocus`: focus stays where it is instead of moving to `TourNext`.
