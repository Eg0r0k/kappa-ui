---
"@kappa-ui/core": minor
"@kappa-ui/registry": minor
---

Add Tooltip, from shadcn-vue, with its behaviour in `@kappa-ui/core/tooltip`: it opens once the pointer rests on the trigger (moving restarts the wait), on keyboard focus only, and on a long press on touch screens; tooltips under a `TooltipProvider` warm up together; `update:open` reports why it opened or closed; `role="label"` suits icon buttons. Button with `aria-disabled="true"` now looks disabled while keeping focus and pointer events, and swallows its click. A Kbd inside a tooltip takes the tooltip's colours.
