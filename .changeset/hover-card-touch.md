---
"@kappa-ui/core": minor
"@kappa-ui/registry": minor
---

`@kappa-ui/core/hover-card` drives the hover card: on touch, `auto` opens a link on a long press and anything else on a tap, the card stays open while the page scrolls and closes on a tap outside, on Escape or on `disabled`; on a desktop the pointer has to rest for `openDelay`, focus opens only when visible, and `update:open` reports why the card opened or closed. `HoverCard` loses `enableTouch` and gains `touch`, `touchDelay`, `restThreshold` and `disabled`. The card no longer gets stuck after a scroll on touch.
