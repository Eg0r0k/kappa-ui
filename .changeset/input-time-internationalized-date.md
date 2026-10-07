---
"@kappa-ui/registry": patch
---

`add input-time` installs `@internationalized/date`. InputTime's value is a `Time` from that package, which a project has to import to set one, and pnpm doesn't let a project import what only reka-ui depends on.
