---
"@kappa-ui/registry": minor
---

Breaking: `StepperItem` is the named group `group/stepper-item` instead of a bare `group`, and the indicator and separator read their state through `group-data-[state=…]/stepper-item:` and `group-data-disabled/stepper-item:`. An outer element with the `group` class and a `data-state` (an outer step of a nested stepper, your own wrapper) no longer paints the steps inside it. Classes you copied from the examples as `group-data-[state=completed]:bg-primary` need the new suffix: `group-data-[state=completed]/stepper-item:bg-primary`.
