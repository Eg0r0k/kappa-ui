---
"@kappa-ui/registry": patch
---

Components size their icons with core's `icon-size-*` instead of `[&_svg:not([class*='size-'])]:size-*`, so `class="icon-size-5"` resizes the icons in a Button, a Badge or a menu item, and `cn` lets the later of two `icon-size-*` classes win. A Button tightens its padding beside a `data-icon="inline-start"` or `"inline-end"` icon on the logical side, so the right side in right-to-left text.
