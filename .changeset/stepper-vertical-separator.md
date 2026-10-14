---
"@kappa-ui/registry": patch
---

A vertical `Stepper` draws its separators as a rail: a `StepperSeparator` placed straight in a `StepperItem` runs beside the step from 4px under the indicator to 4px above the next one, where it used to stretch across the row and come out 0px tall. The vertical trigger is a row with the indicator first. The rail spans `--stepper-gap`, the space between steps, and `start-*`, `top-*` and `bottom-*` on the separator move it. `stepperItem` and `stepperTrigger` are now `stepperItemVariants` and `stepperTriggerVariants`, which take the `orientation`. Horizontal steppers are unchanged.
