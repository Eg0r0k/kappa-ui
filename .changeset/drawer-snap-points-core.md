---
"@kappa-ui/core": minor
---

`@kappa-ui/core/snap`: `toPixels`, `resolveSnapPoint` and `cycleSnapPoint`. `DrawerRoot` gains `snapPoints`, `activeSnapPoint` (v-model), `snapToSequentialPoints` and `fadeFromIndex`; the content writes `--drawer-snap-offset` and `data-expanded`, the overlay `--drawer-overlay-opacity`, a handle tap cycles the points, and the content scrolls only at the largest one. `useDrag` reports a signed release velocity over the last 100 ms and lets a mouse drag from anywhere; `releaseVerdict` takes that velocity.
