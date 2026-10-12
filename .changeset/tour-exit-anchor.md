---
"@kappa-ui/core": patch
---

`useTour`: `reference` keeps the current step's target after the tour closes instead of turning `undefined`, so the popover's exit animation plays where it was rather than jumping to the top-left corner.
