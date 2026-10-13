---
"@kappa-ui/registry": patch
---

A `gap-*` class on `BreadcrumbList` applies at every width; the list's own gap, wider from the `sm` breakpoint up, now comes through `--breadcrumb-gap`, so its `sm:` rule no longer outranks the class.
