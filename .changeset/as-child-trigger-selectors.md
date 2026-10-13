---
"@kappa-ui/registry": patch
---

A `Kbd` inside a Button wrapped in `TooltipTrigger as-child` (or any other `as-child` trigger) keeps the button's colours, and an `InputGroupButton` wrapped the same way in a block addon keeps the addon's inset. The trigger's `data-slot` replaces the child's own, as in shadcn, so Kbd now keys on the `<button>` element (any button tints it, Toggle and Toolbar items included) and the block addon sets the inset on its children.
