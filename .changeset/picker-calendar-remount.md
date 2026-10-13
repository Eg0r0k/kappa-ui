---
"@kappa-ui/registry": patch
---

`DatePickerCalendar` and `DateRangePickerCalendar` render a fresh calendar each time the picker opens. With `force-mount`, or when the picker reopened during its close animation, the still-mounted calendar lost its placeholder when the picker reset it, threw and came back empty.
