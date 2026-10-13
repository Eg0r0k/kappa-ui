---
"@kappa-ui/registry": patch
---

`Button` transitions with Tailwind's default `transition` list instead of `transition-colors`, so `<Button class="press-scale">` dips while held. The dip takes Button's own duration; `--press-duration` applies to elements without a transition of their own.
