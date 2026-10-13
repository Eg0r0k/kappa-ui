---
"@kappa-ui/registry": patch
---

Selecting all rows of a DataTable leaves the rows `enableRowSelection` locks unchecked and out of the count: the banner and `getSelection().count` say 45 of 50 when five rows are locked, in client mode.
