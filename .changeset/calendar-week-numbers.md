---
"@kappa-ui/registry": patch
---

Week numbers in `Calendar` and `RangeCalendar` stay within 1 to 53 in a non-Gregorian calendar such as `fa-IR`'s Persian one: each row's first day is converted to the Gregorian calendar before Reka numbers it, instead of being diffed against January 1 of the same year number in the Gregorian calendar.
