---
"@kappa-ui/registry": patch
---

A class such as `self-center` or `translate-y-0` on `ItemMedia` now wins over the top alignment it takes beside an `ItemDescription`: `Item` passes that alignment down through `--item-media-align` and `--item-media-shift` instead of a group variant that outranked the class.
