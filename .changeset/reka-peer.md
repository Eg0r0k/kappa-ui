---
"@kappa-ui/core": minor
"@kappa-ui/registry": minor
---

`reka-ui` is now a peer dependency of `@kappa-ui/core` (`^2.10.5`), so your project and kappa-ui share one copy. The primitive re-exports (`@kappa-ui/core/checkbox`, `@kappa-ui/core/utils`, …) are gone: components import `reka-ui` directly, and adding one installs `reka-ui` like any shadcn-vue component. `@kappa-ui/core/menu` stays and, in development, names the missing parts if a Reka upgrade drops them. Breaking for code that imported the removed subpaths: import the same names from `reka-ui`.
