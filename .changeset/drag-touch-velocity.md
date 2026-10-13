---
"@kappa-ui/core": patch
---

`useDrag` on touch reports each move's own `velocity` and `direction` in `onMove`, as the pointer path does, instead of a velocity of 0 and the direction from the start of the gesture.
