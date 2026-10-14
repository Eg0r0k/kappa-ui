---
"@kappa-ui/registry": minor
---

ScrollArea sizes from its content: `max-h-*`, `flex-1` (with or without `min-h-0`), a grid row and auto height work, so a Card body or a chip strip needs no fixed height. A ScrollArea with no size now shows its content instead of collapsing, and `virtualize` without a bounded height or width warns once in development.

Inside a ScrollArea, a Table's own sideways scrolling turns off, so a sticky `TableHeader` sticks to the area; give the ScrollArea `orientation="both"` when the table can be wider than it.
