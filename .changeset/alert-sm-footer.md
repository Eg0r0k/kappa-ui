---
"@kappa-ui/registry": patch
---

The footer of an `sm` AlertDialog splits into as many equal columns as it has buttons, so `alert({ size: "sm" })` gives its lone OK button the whole width instead of half.
