---
"@kappa-ui/registry": patch
---

A `Tour` whose tour starts during setup renders on the server: it no longer reads `document.activeElement` there to remember the element to give focus back to.
