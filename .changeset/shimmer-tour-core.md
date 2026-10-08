---
"@kappa-ui/core": minor
---

New `shimmer` utilities in `@kappa-ui/core/tailwind.css`, ported from shadcn-vue: a highlight that sweeps across text drawn with `background-clip: text`, with `shimmer-once`, `shimmer-reverse`, `shimmer-none` and `shimmer-color-*`, `shimmer-duration-*`, `shimmer-spread-*`, `shimmer-angle-*`. New `@kappa-ui/core/tour` with `useTour`, ported from Nuxt UI: the state of a guided tour whose `reference` a popover anchor follows; a step without a target, or whose target matches nothing, sits in the centre of the viewport and sets `centered`. `animate-skeleton-wave` draws its band in the element's tone when the element has a `data-color`.
