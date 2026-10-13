---
"@kappa-ui/core": patch
---

SwipeViews renders its state on the server: pages register during setup, so the server HTML marks the page in `v-model` `active` and the others `inert`, and each page places itself by index (in percent of its own size) until the root has measured the pages in the browser, so the first paint shows the model's page instead of the first one, or the last one in the stack layout. Hydration matches the server HTML. `--swipe-snap-offset`, `--swipe-view-offset` and `--swipe-view-stack` are registered as `<length-percentage>`; the root context gains `resolved`, `measured` and `resort`, and a registered page's `element` is set once it mounts.
