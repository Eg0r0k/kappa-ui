---
"@kappa-ui/registry": patch
---

A server-paginated DataTable follows a `rowCount` that arrives or changes after mount: it shows "1–10 of 95" and pages through it instead of staying on "Page N" or dropping to "0–0 of 0" at the first page change. The page count is computed from the row count and the page size, so page changes past the last page are clamped as TanStack does for a known count.
