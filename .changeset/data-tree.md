---
"@kappa-ui/registry": minor
---

New `DataTree`: a tree drawn from data over the Tree parts, as DataTable is over Table. It takes Tree's props, draws each row from the node's `icon` and `label` (with a checkbox in checkbox mode, or your own through the `item` slot), and shows loading (skeleton rows), empty and error states in its frame through `loading`, `empty` and `error` and their slots, error first. `virtualize` renders only the rows near the view. `v-model` and `v-model:expanded` survive a state.
