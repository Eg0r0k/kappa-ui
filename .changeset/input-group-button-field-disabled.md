---
"@kappa-ui/registry": patch
---

`InputGroupButton` inside a disabled Field is disabled, not only faded with its addon: it no longer takes focus or runs its click (InputTimeGroup's "Now" button changed the value of a disabled field). A `disabled` attribute passed to the button still wins.
