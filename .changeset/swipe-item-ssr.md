---
"@kappa-ui/core": patch
---

A `SwipeItem` rendered open on the server (`v-model:state` restored to `start` or `end`) no longer crashes the render by adding its outside-press and Escape listeners to a `document` that does not exist there; the hydrated row adds them on the client.
