---
"@kappa-ui/registry": patch
---

Progress clamps a value outside `0` to `max` before Reka sees it, so a float overshoot such as `100.4` shows a full bar instead of Reka rewriting the model to `null`, and `aria-valuenow` never passes `aria-valuemax`. `NaN` shows an indeterminate bar.
