---
"@kappa-ui/registry": patch
---

A disabled `RangeCalendar` draws its range ends in the disabled fill, like a disabled `Calendar`'s selected day, instead of solid destructive red: Reka reports every day of a disabled calendar as unavailable, which marked the value invalid, and a calendar root no longer takes the invalid tone while it is disabled.
