---
"@kappa-ui/core": minor
---

`vRipple` leaves a disabled host alone (`:disabled`, `aria-disabled="true"` or `data-disabled`), and a `v-ripple` on a component that already ripples now overrides the one inside it from the first render, not only after an update.

`--kappa-ripple: none` turns the ripple off for an element and everything inside it, read at the moment of the press: put it on `:root` to go without ripples, built-in ones included. `state-layer` now yields its pressed layer only while a wave is showing, so a press keeps its feedback once the ripple is off.
