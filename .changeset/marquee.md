---
"@kappa-ui/registry": minor
---

New `Marquee`: content that scrolls forever. The slot is repeated `repeat` times (two by default) and slid by core's `animate-marquee`; copies after the first are `aria-hidden` with their focusable elements out of the Tab order, while the pointer works on every copy. `paused` stops it for a control of your own, `pause-on-hover` holds it under the pointer, keyboard focus inside stops it, `reverse` runs it the other way, `orientation="vertical"` scrolls a column, and `fade` dissolves the edges through a mask that works on any background. `--marquee-gap`, `--marquee-duration` and `--marquee-fade` tune it from a class.
