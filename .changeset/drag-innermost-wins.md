---
"@kappa-ui/core": minor
---

Nested drags no longer start together: the innermost `useDrag` that starts takes the gesture, and an outer one gets it only when the inner one refuses it. A closed SwipeActions row no longer moves towards a side without actions, so that swipe reaches what is around the row. `scrollBlocksDrag` reads a right-to-left scroller from its start on the right.
