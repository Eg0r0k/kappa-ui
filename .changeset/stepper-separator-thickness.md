---
"@kappa-ui/registry": patch
---

A thickness class on `StepperSeparator` (`h-1` across a horizontal stepper, `w-1` down a vertical one) now wins; the separator takes its size-driven thickness through `--stepper-separator-h` and `--stepper-separator-w` instead of `data-[orientation]` rules that outranked the class.
