---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

`useTour` returns `loop`, and `TourNext` reads "Next" rather than "Finish" on the last step of a looping tour, where pressing it goes back to the first step.
