---
"@kappa-ui/core": patch
---

`v-tooltip` no longer re-renders its tooltip each time the component holding the element re-renders. It renders again only when its text, arg, `.label` modifier or options change, so a table with a tooltip in every row stays cheap to update.
