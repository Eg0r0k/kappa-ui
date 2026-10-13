---
"@kappa-ui/core": patch
---

`useDrag` on touch: a nested drag that refused a finger (its `canStart` said no) no longer starts later in the same gesture once an outer drag owns it, so a Swipe Actions row inside a Swipe Views page and the page no longer move together on a back-and-forth swipe.
