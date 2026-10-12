---
"@kappa-ui/registry": minor
---

`DataTable` takes an `error` prop and slot. Any value but `undefined`, `null` and `false` turns it on, so `:error="query.error.value"` works as is; the `error` slot gets `{ error }`. It shows where the empty message does, in place of the rows, the skeleton and the empty message, and pauses infinite scroll. Without the slot, a string is the message and anything else reads "Something went wrong". `ui.error` styles its box.
