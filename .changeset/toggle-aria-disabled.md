---
"@kappa-ui/registry": patch
---

An `aria-disabled` Toggle, ToggleGroupItem or ToolbarToggleItem ignores click, Enter and Space like an `aria-disabled` Button, so a toolbar toggle kept focusable for its tooltip no longer changes the model. `swallowWhenDisabled` moves to `@/ui/button`, where the three parts share it.
