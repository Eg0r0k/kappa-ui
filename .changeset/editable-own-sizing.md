---
"@kappa-ui/registry": patch
---

`Editable` sizes its field to the text with classes of its own instead of Reka's inline `all: unset` style: the area is an inline grid with the text and the field in one cell, and the one not in use is invisible. Width, background, font and other classes on `EditableInput` now apply; before, only `!` classes did. The look and the sizing are unchanged, and `autoResize` still turns it off.
