---
"@kappa-ui/registry": patch
---

DataTable attaches row click, keyboard, context-menu and hover listeners only when the matching `onRow*` prop is set, instead of five listeners per row regardless.
