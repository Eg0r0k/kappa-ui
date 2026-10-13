---
"@kappa-ui/registry": patch
---

A length class on `Separator` now applies: `h-4` on a vertical separator or `w-12` on a horizontal one sizes it instead of losing to the `data-[orientation]` rules that stretched it. The orientation's classes are picked from the prop, and `data-orientation` stays on the element.
