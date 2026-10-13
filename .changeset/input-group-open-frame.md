---
"@kappa-ui/registry": patch
---

An `InputGroup` holding a `DatePicker` or `DateRangePicker` keeps its frame in the focus colour while the calendar is open, as the picker's own frame does; focus has moved into the calendar, so the group's focus rule no longer matched.
