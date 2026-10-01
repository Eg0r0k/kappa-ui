---
"@kappa-ui/registry": patch
---

Card: `outline` and `subtle` draw their edge as a one-pixel ring outside the box instead of a border, so every variant has the same size, as Button's do, and content that reaches the sides, a flush image or a list of items, never covers it.
