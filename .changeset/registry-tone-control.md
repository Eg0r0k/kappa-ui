---
"@kappa-ui/registry": patch
---

Switch, Checkbox, Radio and Slider take their tone from core's `tone-control` and `tone-invalid` utilities instead of a dozen variable assignments each, so they need the `@kappa-ui/core` release that adds them. They look the same, and a `[--tone:…]` class still recolours them. Long class strings across the components are now wrapped by variant group.
