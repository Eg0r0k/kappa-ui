---
"@kappa-ui/registry": patch
---

`Textarea` works its vertical padding out from the control height of its size and its own line height, so a one-row textarea is as tall as the `Input` of the same size and variant, on narrow screens too (it was 2px taller, 6px below 768px, and the `filled` variant needs 1px more at the top for its single border). Every textarea loses 1 to 6px of vertical padding. A `py-*` class on it still wins.
