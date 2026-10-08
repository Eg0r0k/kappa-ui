---
"@kappa-ui/core": minor
---

New `@kappa-ui/core/swipe-snap`: `useSwipeSnap` pages between snap points measured in px. A drag follows the finger, the release settles on the nearest point or the next one after a flick, and a finger can catch a settle mid-way. It writes `--swipe-snap-offset` and `--swipe-snap-position` on its element for CSS to move things with; the new `swipe-snap` utility transitions them and `swipe-view` passes them one level down.
