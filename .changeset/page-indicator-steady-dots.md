---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

PageIndicator: the dots after a moving pill no longer jump a pixel while it eases. `tailwind.css` registers `--page-indicator-length` with `@property`, the items transition it instead of `width`, and each item takes it rounded to whole pixels, up for the current page and down for the rest, so the two lengths that trade places always add up to the same width.
