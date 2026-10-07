---
"@kappa-ui/registry": minor
---

A click on a Tree folder's chevron only opens or closes it. It used to select the row as well, and in checkbox mode check the whole folder, so a folder couldn't be opened without changing what was checked.

In checkbox mode a click checks only on `TreeItemCheckbox`. A click on the rest of the row opens or closes a folder, as in a tree without checkboxes, and does nothing on a leaf; Space still checks the focused row.
