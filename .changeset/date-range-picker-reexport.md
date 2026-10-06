---
"@kappa-ui/registry": patch
---

`DateRangePicker` installs and type-checks in a fresh project. Its `index.ts` re-exported the shared `DatePicker` parts with `export … from`, and the shadcn-vue CLI rewrites the alias only in imports, so the installed file still pointed at `@/registry/kappa-ui/ui/date-picker`.
