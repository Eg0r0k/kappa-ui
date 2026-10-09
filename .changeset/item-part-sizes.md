---
"@kappa-ui/registry": minor
---

Item: `size` is the row's density, as in shadcn. It sets padding, gap and the media size (through `--item-media` on the root), and no longer scales the text of `ItemTitle` and `ItemDescription`, which stay at `text-label-lg` and `text-body-md`. The parts carry no `group-data-[size=…]` variants any more, so a `class` of your own, like `text-body-sm`, `line-clamp-none` or `size-12` on an `ItemMedia`, wins.
