---
"@kappa-ui/registry": patch
---

In a ToggleGroup (or a ButtonGroup of toggles) whose `activeVariant` is `outline` or `subtle`, pressed neighbours share one edge instead of drawing two side by side: `Toggle` and `ToggleGroupItem` carry `data-active-variant`, and the group overlaps them by that edge as it does for an outline variant.
