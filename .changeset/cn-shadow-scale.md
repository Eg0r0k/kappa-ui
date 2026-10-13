---
"@kappa-ui/registry": patch
---

`cn()` knows the kit's `shadow-shadow-*` elevations: `shadow-none` on a part now removes its elevation instead of losing to it, a shadow colour such as `shadow-black/40` tints it instead of removing it, and two elevations merge to the last one.
