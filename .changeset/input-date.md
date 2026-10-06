---
"@kappa-ui/registry": minor
---

New `InputDate` and `InputDateRange`: segmented date fields over Reka UI's `DateField` and `DateRangeField`, in Input's five variants and five sizes, with optional time segments, `min-value`/`max-value`, `is-date-unavailable`, `loading` and Field wiring. Inside an `InputGroup` they drop their own frame and take the group's variant and size. Pasting an ISO date (`2025-03-14`, or `2025-03-14T09:30`) fills every segment, and Enter submits the form through its submit button, like a native date input. `InputDateRange` submits `name[start]` and `name[end]` as ISO dates, empty until that end is filled, and `required` needs both.

`InputTime` and `InputTimeRange` get the same fixes. `focus` and `blur` now fire once when focus enters or leaves the field, so a form library's validate-on-blur runs; before, they never fired. Clicking the frame outside the segments focuses the first one, Enter submits the form, and changing `granularity` or `hour-cycle` after mount rebuilds the segments instead of leaving stale ones. `InputTimeRange` with `name` now submits `name[start]` and `name[end]` instead of one `start - end` field, which read `undefined - undefined` while empty and never failed `required`. If your server reads the old field, read the two new ones.
