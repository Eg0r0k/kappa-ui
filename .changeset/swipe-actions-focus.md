---
"@kappa-ui/core": patch
---

SwipeActions: when an action runs from the keyboard or Escape closes the row while focus is in a strip, focus goes back to the element last focused in the row's content (or its first focusable element) instead of dropping to `<body>` as the strip turns inert.
