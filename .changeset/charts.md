---
"@kappa-ui/registry": minor
---

New `Chart`: charts on Unovis. `ChartContainer` turns a config into series colours (`--color-<key>`, `light-dark()` pairs) and maps Unovis' variables onto the theme; `ChartCrosshair` reports the hovered point with no trailing line; `ChartTooltip` and `ChartTooltipContent` are Vue components positioned beside the pointer, with slots, zero values shown and a finger supported; `ChartLegend` can hide a series. Five `--chart-*` tokens ship with the `tokens` item, light and dark, validated for colour-vision separation in both modes, so `add @kappa-ui/chart` brings them into a project set up before this release. The theme's `:root` now sets `color-scheme: light`.
