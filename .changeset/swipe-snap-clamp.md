---
"@kappa-ui/core": patch
---

`useSwipeSnap` clamps an `active` index outside its points when it starts, so `active` 5 over three points rests on the last one instead of writing an offset of 0 and a position of 5.
