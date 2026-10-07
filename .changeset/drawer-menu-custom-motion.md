---
"@kappa-ui/core": minor
---

A DrawerMenu panel that leaves now waits for any animation or transition running on it, not only for a keyframe animation, so the slide between panels can be replaced with plain CSS: keyframes on `data-motion`, or a transition on `data-state` with `@starting-style` for the arriving panel. A transition used to be cut short: the panel hid at once when `animation-name` was `none`.
