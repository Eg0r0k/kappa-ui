---
"@kappa-ui/core": minor
---

`vRipple` leaves a disabled host alone (`:disabled`, `aria-disabled="true"` or `data-disabled`), and a `v-ripple` on a component that already ripples now overrides the one inside it from the first render, not only after an update.
