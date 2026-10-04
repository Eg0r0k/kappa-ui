---
"@kappa-ui/registry": patch
---

DataTable no longer breaks hydration when a header, footer or cell renders an empty string (`header: ""` on an actions or expand column, an empty value). Such a render now outputs nothing, through the new `DataTableRender`, which the table uses in place of `FlexRender`.
