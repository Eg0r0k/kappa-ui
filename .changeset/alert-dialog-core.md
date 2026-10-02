---
"@kappa-ui/core": minor
---

`@kappa-ui/core/dialog` exports `AlertDialogContent`: Reka UI's alert dialog content with the duties of `DialogContent`, so an alert dialog opened with `openDialog` reports `"escape"` and `"close-button"`, holds while `loading` is on, ignores Escape during IME composition and gets the hidden title and description fallback. `DialogContent` now shares that code.
