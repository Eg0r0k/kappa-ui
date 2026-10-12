---
"@kappa-ui/registry": minor
---

`SelectContent` no longer renders `SelectScrollUpButton` and `SelectScrollDownButton`: a long list scrolls like any other instead of scrolling under the pointer as it hovers an arrow. Both parts stay exported, so a project that wants them puts them back around the viewport in its own `SelectContent`, or wraps the slot in a `ScrollArea`.
