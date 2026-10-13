---
"@kappa-ui/core": patch
"@kappa-ui/registry": patch
---

An open `AccordionContent` no longer clips its content: the accordion keyframes clip while the panel's height animates, as Collapsible's do, and the part drops its permanent `overflow-hidden`, so a focus ring or a shadow inside an open answer shows in full.
