---
"@kappa-ui/registry": patch
---

After Enter or Escape ends an edit, `Editable` gives focus back to its preview instead of dropping it to `<body>` as the input hides, without starting a focus-activated edit again. A save on blur leaves focus where the user moved it.
