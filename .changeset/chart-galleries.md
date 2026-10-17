---
"@kappa-ui/registry": minor
---

Chart galleries: thirty examples in the Area, Bar and Line galleries, each a registry block ported from shadcn's charts.

`ChartContainer` hands `events` to its default slot, so a chart the crosshair cannot follow (a pie, a horizontal bar) feeds the tooltip from Unovis events in its own template; `events(selector)` returns the same object for the same selector, so the chart does not re-render on every parent render.

Fixes: a hovered area keeps its fill opacity instead of turning opaque; a root with no height keeps the chart's natural height instead of collapsing; the tooltip neither fades nor slides after the pointer under reduced motion.
