---
"@kappa-ui/registry": minor
---

New `Rating` component, on Reka UI's Rating: a row of stars to pick a score in whole, half, quarter or tenth steps. It takes `size` from `xs` to `xl` on the control tokens, so it lines up with a Button of the same size, and `color` like the other choice controls, with `warning` for gold stars. `hoverable` previews the value under a mouse or a pen but never under a finger, `clearable` takes the score back, and `touch-target`, vertical and right-to-left layouts and `icon` and `empty-icon` slots work as elsewhere.

`readonly` shows an exact value, 4.3 fills the fifth star to 30%, as one picture named "Rated 4.3 out of 5", with no radios for screen readers to announce. In a Field it takes the field's id, label, description, error, invalid, required and disabled state. In a plain form, a rating with nothing picked, or cleared, submits an empty value, so native `required` holds until a star is picked.
