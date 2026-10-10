---
"@kappa-ui/registry": minor
---

New `Marquee`: content that scrolls forever. The slot is repeated `repeat` times and slid by core's `animate-marquee`; `pause-on-hover` also pauses while something inside has focus, `reverse` runs it the other way, `orientation="vertical"` scrolls a column, and `fade` dissolves the edges through a mask that works on any background. Copies after the first are `inert` and hidden from assistive technology. `--marquee-gap`, `--marquee-duration` and `--marquee-fade` tune it from a class.
