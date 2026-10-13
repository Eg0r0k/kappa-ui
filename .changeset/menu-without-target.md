---
"@kappa-ui/registry": patch
---

A `Menu` with `target: false` opens centred in the viewport instead of half off its top-left corner (an `anchor` or `self` you pass still wins), and `show(event)` on such a menu with `contextMenu` or `touchPosition` opens at the event's position.
