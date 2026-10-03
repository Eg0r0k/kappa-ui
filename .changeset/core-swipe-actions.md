---
"@kappa-ui/core": minor
---

New `@kappa-ui/core/swipe-actions`: `SwipeRoot`, `SwipeItem`, `SwipeActions`, `SwipeAction`, `SwipeActionContent` and `SwipeContent`, a row that slides sideways on `useDrag` to reveal a strip of actions on its `start` or `end` side and holds open on it, with a velocity-projected threshold, an optional full swipe that clicks the outermost action, one open row per `SwipeRoot`, `v-model:state`, outside-press, `Escape` and scroll dismissal, arrow keys and inert closed strips. `tailwind.css` adds the `swipe-item` utility that animates them.
