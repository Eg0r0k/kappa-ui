---
"@kappa-ui/core": patch
---

`state-layer` no longer tints a natively disabled element or one marked `data-disabled` under the mouse or on press, only an `aria-disabled` one as before; a disabled `Item as="button"` stays flat.
