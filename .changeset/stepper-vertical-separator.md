---
"@kappa-ui/registry": patch
---

A vertical `Stepper` draws its separators in flow: each item becomes a column, the trigger a row with the indicator first, and a `StepperSeparator` placed straight in the item runs down from under the indicator, at least 24px long, where it used to stretch across the row and come out 0px tall. `min-h-*` and `ms-*` on the separator lengthen and move it. A vertical layout of your own that sets the item's children side by side needs `flex-row` on `StepperItem` now. Horizontal steppers are unchanged.
