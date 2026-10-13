---
"@kappa-ui/registry": patch
---

A class on `Table` now retunes its rows and text: the size variables and the text size live on the root, where the class lands, instead of on the inner `<table>`, which redeclared them. The root also carries `data-size`.
