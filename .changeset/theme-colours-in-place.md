---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

Colours written inside arbitrary values and variables now resolve where the element sits, so a `.dark` island (or any subtree that sets a token) gets its own: the filled Input, InputGroup and DatePicker underline, the Table hover, selected and stripe tints, the disabled Slider and Rating fills and the ColorPicker checkerboard read `--theme(--color-x)` instead of `var(--color-x)`, which Tailwind resolves once on `:root`. The ripple wave reads `--state-pressed` where it is pressed (the `ripple` item no longer pins `--kappa-ripple-opacity` on `:root`), so a subtree that changes `--state-pressed` changes the wave as well as the state layer.
