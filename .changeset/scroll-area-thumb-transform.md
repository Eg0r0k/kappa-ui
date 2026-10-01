---
"@kappa-ui/registry": patch
---

ScrollArea moves its thumb with `transform` instead of `top` / `inset-inline-start`, so scrolling no longer lays out and repaints the bar on every frame, and the thumb drops its permanent `will-change` layer.
