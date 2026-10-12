---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

A pressed Toggle or ToggleGroup item keeps its on look inside `TooltipTrigger as-child` (or any wrapper that writes its own `data-state`). The on styles read `aria-pressed`, which Reka sets on every toggle, instead of `data-state="on"`, which the tooltip overwrote with `closed`; core's active-colour rules match both, so a custom `[data-state="on"][data-active-color]` rule keeps working.
