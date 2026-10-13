---
"@kappa-ui/registry": patch
---

Table rows are 36px at `sm`, as the scale and the DataTable virtualizer's estimate say, not 37px; and a DataTable row with an expand or group toggle keeps its size's row height (44px at `md`) instead of growing by a pixel to fit the toggle. Virtualized `sm` tables and tree or grouped tables no longer drift when they scroll to a row.
