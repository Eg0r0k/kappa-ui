---
"@kappa-ui/registry": patch
---

`FileUpload` exposes the element that takes focus as `triggerEl` instead of `triggerRef`. In a Nuxt project the auto-imported Vue `triggerRef` is typed on every component instance, so `triggerRef` on a template ref read as a function and the Formisch example failed to type-check.
