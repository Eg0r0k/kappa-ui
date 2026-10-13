---
"@kappa-ui/core": patch
---

`useTour` follows the page while a tour is open: a string target that mounts after its step opened (a route or a `v-if` section) anchors the panel once it appears, and a target removed mid-step centres the panel instead of pinning it to the viewport's top-left corner.
