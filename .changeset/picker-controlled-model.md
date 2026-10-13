---
"@kappa-ui/registry": patch
---

`DatePicker` and `DateRangePicker` keep a bound `modelValue`, `open` or `placeholder` until the parent changes it: a parent that refuses a picked date, or binds `open` to `false` without a listener, no longer sees the picker show a value or a panel it never accepted. Unbound, they keep their own state as before.
